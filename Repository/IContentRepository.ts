import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { NetworkErrorData, getIContentFromPathResponse } from '../ContentDeliveryAPI';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList, { hostnameFilter } from '../Models/WebsiteList';
import IndexedDB from '../IndexedDB/IndexedDB';
import SchemaUpgrade from '../IndexedDB/SchemaUpgrade';
import Store from '../IndexedDB/Store';
import Property, { ContentAreaProperty, ContentReferenceProperty, ContentReferenceListProperty } from '../Property';

export type IRepositoryItem<T> = {
    data: T,
    added ?: number,
    accessed ?: number
}

/**
 * The data structure stored within the iContent repository
 */
export type IContentRepositoryItem<T extends IContent = IContent> = IRepositoryItem<T> & {
    apiId: string,
    contentId: string,
    type: string,
    route: string | null
}

export type WebsiteRepositoryItem<T extends Website = Website> = IRepositoryItem<T>;

export type IReadOnlyRepository<KeyType, DataType> = {
    get: (itemId: KeyType) => Promise<DataType | null>
    has: (itemId: KeyType) => Promise<boolean>
    load: (itemId: KeyType) => Promise<DataType | null>
    update: (reference: KeyType) => Promise<DataType | null>
}

export type IIContentRepository = IReadOnlyRepository<ContentReference, IContent> & {
    /**
     * Get the IContent from the client repository, if it's not present there, go to the Episerver Instance
     * to load the data
     * 
     * @param   { ContentReference }    itemId      The reference to the content that must be loaded
     * @param   { boolean }             recursive   Marker to indicate if the content must be laoded recursively (e.g. resolve all related content items)
     * @returns The loaded data or null if not found or accessible
     */
    load: (itemId: ContentReference, recursive?: boolean) => Promise<IContent | null>

    /**
     * Force loading the IContent from Episerver and update the reference in the local repository
     */
    update: (reference: ContentReference, recursive?: boolean) => Promise<IContent | null>
    getByContentId: (contentId: string) => Promise<IContent | null>
    getByRoute(route: string) : Promise<IContent | null>
    getByReference(reference: string, website: Website) : Promise<IContent | null>

    /**
     * Retrieve a list of all websites stored within Episerver
     */
    getWebsites() : Promise<WebsiteList>

    /**
     * Retrieve a single website, as stored within Episerver
     * 
     * @param   { string }  hostname    The hostname to match when retrieving the website
     * @param   { string }  language    The language to match when retrieving the website
     * @returns The matching website or null if none found or error
     */
    getWebsite(hostname: string, language ?: string) : Promise<Website | null>
}

export type IIContentRepositoryType = new(api: IContentDeliveryAPI)  => IIContentRepository;

/**
 * A wrapper for IndexedDB offering an Asynchronous API to load/fetch content items from the database
 * and underlying Episerver ContentDelivery API.
 */
export class IContentRepository implements IIContentRepository
{
    protected _api : IContentDeliveryAPI;
    protected _storage : IndexedDB;
    protected _loading : { [key: string] : Promise<IContent | NetworkErrorData<any> | null> } = {};

    /**
     * Create a new instance
     * 
     * @param { IContentDeliveryAPI } api The ContentDelivery API wrapper to use within this IContent Repository
     */
    public constructor (api: IContentDeliveryAPI)
    {
        this._api = api;
        this._storage = new IndexedDB("iContentRepository", 4, this.schemaUpgrade.bind(this));
        if (this._storage.IsAvailable) this._storage.open();
    }

    /**
     * Load the IContent, first try IndexedDB, if not found in the IndexedDB load it from the
     * ContentDelivery API
     * 
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    public async load(reference: ContentReference, recursive: boolean = false) : Promise<IContent | null>
    {
        const apiId = ContentLinkService.createApiId(reference);
        if (await this.has(reference)) return this.get(reference);
        if (!this._loading[apiId]) {
            const internalLoad = async () => {
                const iContent = await this._api.getContent(reference, undefined, recursive ? ['*'] : []);
                const table = await this.getTable();
                await this.recursiveLoad(iContent, recursive);
                table.put(this.buildRepositoryItem(iContent));
                delete this._loading[apiId];
                return iContent;
            }
            this._loading[apiId] = internalLoad();
        }
        return this._loading[apiId];
    }

    /**
     * Force reloading of the content and return the fresh content
     * 
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    public async update(reference: ContentReference, recursive: boolean = false) : Promise<IContent | null>
    {
        const apiId = ContentLinkService.createApiId(reference, true);
        const internalLoad = async () => {
            const iContent = await this._api.getContent(reference, undefined, recursive ? ['*'] : []);
            const table = await this.getTable();
            await this.recursiveLoad(iContent, recursive);
            table.put(this.buildRepositoryItem(iContent));
            delete this._loading[apiId];
            return iContent;
        }
        if (!this._loading[apiId]) {
            this._loading[apiId] = internalLoad(); // If not loaded before, do initial load
        } else {
            this._loading[apiId] = this._loading[apiId].then(() => internalLoad()); // If loaded before, chain a reload to it
        }
        return this._loading[apiId];
    }

    /**
     * Return whether or not the referenced iContent is available in the IndexedDB
     * 
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @returns { Promise<boolean> }
     */
    public async has(reference: ContentReference) : Promise<boolean>
    {
        const apiId = ContentLinkService.createApiId(reference);
        console.log('Verifying content in repo', reference, apiId);
        const table = await this.getTable();
        return table.getViaIndex('contentId', apiId)
            .then(x => { console.log('Got repo response: ', x); return x ? true : false})
            .catch(e => { console.log('Got repo error: ', e); return false});
    }

    /**
     * Retrieve the iContent item from the IndexedDB, or null if the item is
     * not found in the IndexedDB
     * 
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @returns { Promise<IContent | null> }
     */
    public async get(reference: ContentReference) : Promise<IContent | null>
    {
        const apiId = ContentLinkService.createApiId(reference);
        const table = await this.getTable();
        const repositoryContent = await table.getViaIndex('contentId', apiId).catch(() => undefined);
        if (repositoryContent) {
            // Update accessed time
        }
        return repositoryContent ? repositoryContent.data : null;
    }

    public async getByContentId(contentId: string) : Promise<IContent | null>
    {
        return this.getTable().then(table => table.getViaIndex('contentId', contentId)).then(iContent => iContent ? iContent.data : null);
    }

    /**
     * Resolve an IContent | null from a route via the index
     * 
     * @param { string } route The route to resolve to an iContent item trough the index
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    public async getByRoute(route: string) : Promise<IContent | null>
    {
        const table = await this.getTable();
        const routedContents = await table.getViaIndex('routes', route);
        if (routedContents) {
            return routedContents.data
        }
        const resolvedRoute = await this._api.resolveRoute(route);
        const content = getIContentFromPathResponse(resolvedRoute);
        if (content) {
            table.put(this.buildRepositoryItem(content));
        }
        return content;
    }

    public getByReference(reference: string, website: Website) : Promise<IContent | null>
    {
        if (website.contentRoots[reference]) {
            return this.load(website.contentRoots[reference]);
        }
        return Promise.reject(`The content root ${ reference } has not been defined`);
    }

    public async getWebsites() : Promise<WebsiteList>
    {
        const table = await this.getWebsiteTable();
        let websites : WebsiteList = await table.all().then(list => list.map(wd => wd.data));
        if (!websites || websites.length === 0) {
            websites = await this._api.getWebsites();
            await table.putAll(websites.map(w => { return { data: this.buildWebsiteRepositoryItem(w) }}));
        }
        return websites;
    }

    public async getWebsite(hostname: string, language ?: string) : Promise<Website | null>
    {
        const websites = (await this.getWebsites()).filter(w => hostnameFilter(w, hostname, language));
        return websites && websites.length === 1 ? websites[0] : null;
    }

    /**
     * Get the underlying table in IndexedDB
     * 
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    protected async getTable() : Promise<Store<IContentRepositoryItem>>
    {
        const db = await this._storage.open();
        return db.getStore<IContentRepositoryItem>('iContent');
    }

    protected async getWebsiteTable() : Promise<Store<WebsiteRepositoryItem>>
    {
        const db = await this._storage.open();
        return db.getStore<WebsiteRepositoryItem>('website');
    }

    protected buildWebsiteRepositoryItem(website: Website) : WebsiteRepositoryItem
    {
        return {
            data: website,
            added: Date.now(),
            accessed: Date.now()
        }
    }

    protected buildRepositoryItem(iContent: IContent) : IContentRepositoryItem {
        return {
            apiId: ContentLinkService.createApiId(iContent, true),
            contentId: ContentLinkService.createApiId(iContent, false),
            type: iContent.contentType?.join('/') ?? 'Errors/ContentTypeUnknown',
            route: ContentLinkService.createRoute(iContent),
            data: iContent,
            added: Date.now(),
            accessed: Date.now()
        }
    }

    protected async recursiveLoad(iContent: IContent, recurseDown: boolean = false)
    {
        const table = await this.getTable();
        for (const key of Object.keys(iContent)) {
            const p : Property = (iContent as any)[key];
            if (p && p.propertyDataType) switch (p.propertyDataType) {
                case 'PropertyContentReference':
                case 'PropertyPageReference':
                    const cRef = p as ContentReferenceProperty;
                    if (cRef.expandedValue) {
                        table.put(this.buildRepositoryItem(cRef.expandedValue));
                        this.recursiveLoad(cRef.expandedValue, recurseDown);
                        delete (iContent as any)[key].expandedValue;
                        break;
                    }
                    if (cRef.value && recurseDown) {
                        this.load(cRef.value, recurseDown);
                    }
                    break;
                case 'PropertyContentArea':
                    const cArea = p as ContentAreaProperty;
                    if (cArea.expandedValue) {
                        cArea.expandedValue?.forEach(x => {
                            table.put(this.buildRepositoryItem(x))
                            this.recursiveLoad(x);
                        });
                        delete (iContent as any)[key].expandedValue;
                        break;
                    }
                    if (cArea.value && recurseDown) {
                        cArea.value?.forEach(x => this.load(x.contentLink, recurseDown).catch(() => null));
                    }
                    break;
                case 'PropertyContentReferenceList':
                    const cRefList = p as ContentReferenceListProperty;
                    if (cRefList.expandedValue) {
                        cRefList.expandedValue?.forEach(x => {
                            table.put(this.buildRepositoryItem(x))
                            this.recursiveLoad(x);
                        });
                        delete (iContent as any)[key].expandedValue;
                        break;
                    }
                    if (cRefList.value && recurseDown) {
                        cRefList.value?.forEach(x => this.load(x, recurseDown).catch(() => null));
                    }
                    break;
            }
        }
    }

    protected schemaUpgrade : SchemaUpgrade = (db, t) => {
        return Promise.all([
            db.hasStore('iContent') ? Promise.resolve(true) : db.createStore('iContent','apiId', undefined, [
                { name: 'guid', keyPath: 'data.contentLink.guidValue', unique: true },
                { name: 'contentId', keyPath: 'contentId', unique: true },
                { name: 'routes', keyPath: 'route', unique: false }
            ]),
            db.hasStore('website') ? Promise.resolve(true) : db.createStore('website', 'data.id', undefined, [
                { name: 'hosts', keyPath: 'data.hosts.name', multiEntry: false, unique: false }
            ])
        ]).then(() => true)
    }
}
export default IContentRepository