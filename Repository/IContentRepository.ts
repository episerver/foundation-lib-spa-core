// Import libraries
import EventEmitter from 'eventemitter3';

// Import framework
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IRepositoryItem, IPatchableRepository, IRepositoryConfig, IRepositoryPolicy } from './IRepository';
import { NetworkErrorData, getIContentFromPathResponse } from '../ContentDeliveryAPI';

// Import IndexedDB Wrappper
import IndexedDB from '../IndexedDB/IndexedDB';
import SchemaUpgrade from '../IndexedDB/SchemaUpgrade';
import Store from '../IndexedDB/Store';

// Import Taxonomy
import Property, { ContentAreaProperty, ContentReferenceProperty, ContentReferenceListProperty } from '../Property';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList, { hostnameFilter } from '../Models/WebsiteList';

/**
 * The data structure stored within the iContent repository
 */
export type IContentRepositoryItem<T extends IContent = IContent> = IRepositoryItem<T> & {
    apiId: string,
    contentId: string,
    type: string,
    route: string | null
}

export interface IReadonlyRepositoryEvents<KeyType extends unknown = any, DataType extends unknown = any>
{
    'beforeGet': [ item: Readonly<KeyType> ]
    'afterGet': [ item: Readonly<KeyType>, value: DataType | null ]
}
export interface IPatchableRepositoryEvents<KeyType extends unknown = any, DataType extends unknown = any> extends IReadonlyRepositoryEvents<KeyType, DataType>
{
    'beforePatch': [ item: Readonly<KeyType>, value: DataType ]
    'afterPatch': [ item: Readonly<KeyType>, newValue: DataType, oldValue: Readonly<DataType> ]
}

export interface IEventingRepository<EventTypes extends EventEmitter.ValidEventTypes = string | symbol, Context extends unknown = any> {
    /**
     * Return the listeners registered for a given event.
     */
    listeners<T extends EventEmitter.EventNames<EventTypes>>(
      event: T
    ): EventEmitter.EventListener<EventTypes, T>[];
  
    /**
     * Return the number of listeners listening to a given event.
     */
    listenerCount(event: EventEmitter.EventNames<EventTypes>): number;
    /**
     * Add the listener to a given event
     */
    on<T extends EventEmitter.EventNames<EventTypes>>(
        event: T,
        fn: EventEmitter.EventListener<EventTypes, T>,
        context?: Context
      ): this;
    addListener<T extends EventEmitter.EventNames<EventTypes>>(
        event: T,
        fn: EventEmitter.EventListener<EventTypes, T>,
        context?: Context
    ): this;

    /**
     * Remove the listeners of a given event.
     */
    removeListener<T extends EventEmitter.EventNames<EventTypes>>(
      event: T,
      fn?: EventEmitter.EventListener<EventTypes, T>,
      context?: Context,
      once?: boolean
    ): this;
    off<T extends EventEmitter.EventNames<EventTypes>>(
      event: T,
      fn?: EventEmitter.EventListener<EventTypes, T>,
      context?: Context,
      once?: boolean
    ): this;
}

export type WebsiteRepositoryItem<T extends Website = Website> = IRepositoryItem<T>;

export interface IIContentRepository extends IPatchableRepository<ContentReference, IContent>, IEventingRepository<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> {
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

    /**
     * Retrieve content by the Episerver ContentId, using the index on the local repository
     * 
     * @param { string } contentId  The Episerver ContentID (using format: {number}__{provider})
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByContentId: (contentId: string) => Promise<IContent | null>

    /**
     * Retrieve content by the Episerver route (URL), using the index on the local repository
     * 
     * @param { string } route 
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByRoute(route: string) : Promise<IContent | null>

    /**
     * Load content by the reference name from the website
     * 
     * @param { string } reference The name of the page, as registered on the Website
     * @param { Website } website The website to get the registrations from, if omitted it takes the current website from the ContentDelivery API
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByReference(reference: string, website?: Website) : Promise<IContent | null>

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

export type IIContentRepositoryType = new(api: IContentDeliveryAPI, config?: Partial<IRepositoryConfig>) => IIContentRepository;

/**
 * A wrapper for IndexedDB offering an Asynchronous API to load/fetch content items from the database
 * and underlying Episerver ContentDelivery API.
 */
export class IContentRepository extends EventEmitter<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> implements IIContentRepository
{
    protected _api : IContentDeliveryAPI;
    protected _storage : IndexedDB;
    protected _loading : { [key: string] : Promise<IContent | NetworkErrorData<any> | null> } = {};
    protected _config : IRepositoryConfig = {
        maxAge: 1440, // Default keep for one day = 24 * 60 = 1440 minutes
        policy: IRepositoryPolicy.NetworkFirst, // Default network first
        debug: false // Default to disabling debug mode
    }

    /**
     * Create a new instance
     * 
     * @param { IContentDeliveryAPI } api The ContentDelivery API wrapper to use within this IContent Repository
     */
    public constructor (api: IContentDeliveryAPI, config?: Partial<IRepositoryConfig>)
    {
        super();
        this._api = api;
        this._config = { ...this._config, ...config }
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
        const localFirst = this._config.policy === IRepositoryPolicy.LocalStorageFirst ||
                           this._config.policy === IRepositoryPolicy.PreferOffline ||
                           !this._api.OnLine;

        if (localFirst && await this.has(reference)) return this.get(reference);
        return this.update(reference, recursive);
    }

    /**
     * Force reloading of the content and return the fresh content
     * 
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    public update(reference: ContentReference, recursive: boolean = false) : Promise<IContent | null>
    {
        if (!this._api.OnLine) return Promise.resolve<IContent | null>(null);
        const apiId = ContentLinkService.createApiId(reference, false, this._api.InEditMode);
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
     * Validate if the current item is still valid or must be refreshed from the server
     * 
     * @param   { IContentRepositoryItem }  item    The item to be tested
     * @returns The validity of the stored item
     */
    protected isValid(item: IContentRepositoryItem) : boolean
    {
        if (!this._api.OnLine) return true; // Do not invalidate if we're off-line

        // @ToDo: Invalidate if user changed
        // @ToDo: Invalidate if visitor groups changed
        // @ToDo: Invalidate if A/B test changed

        // Check Content Provider
        const isSpaContentProvider : boolean = item.data.contentLink.providerName === 'EpiserverSPA'

        // Check expiry of content cache
        const added = item.added || 0;
        const now = Date.now();
        const maxAgeMiliseconds = this._config.maxAge * 60 * 1000;
        const expired : boolean  = now - added > maxAgeMiliseconds

        // Run actual test
        const valid = !isSpaContentProvider && !expired;
        if (this._config.debug) console.log(`IContentRepository: Validation check: ${ item.contentId }`, valid);
        return valid;
    }

    protected updateInBackground(item: IContentRepositoryItem) : void
    {
        if (!this._api.OnLine) return; // Don't try updating if we're off-line
        this.update(item.data.contentLink);
    }

    /**
     * Return whether or not the referenced iContent is available in the IndexedDB
     * 
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @returns { Promise<boolean> }
     */
    public async has(reference: ContentReference) : Promise<boolean>
    {
        const apiId = ContentLinkService.createApiId(reference, false, this._api.InEditMode);
        const table = await this.getTable();
        return table.getViaIndex('contentId', apiId)
            .then(x => x ? this.isValid(x) : false)
            .catch(() => false);
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
        this.emit('beforeGet', reference);
        const apiId = ContentLinkService.createApiId(reference, false, this._api.InEditMode);
        const table = await this.getTable();
        const repositoryContent = await table.getViaIndex('contentId', apiId).catch(() => undefined);
        if (repositoryContent && this.isValid(repositoryContent)) {
            if (this._config.policy !== IRepositoryPolicy.PreferOffline) this.updateInBackground(repositoryContent);
            this.emit('afterGet', reference, repositoryContent.data);
            return repositoryContent.data;
        }
        this.emit('afterGet', reference, null);
        return null;
    }

    public async getByContentId(contentId: string) : Promise<IContent | null>
    {
        return this.getTable().then(table => table.getViaIndex('contentId', contentId)).then(iContent => iContent && this.isValid(iContent) ? iContent.data : null);
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
        const resolveLocal = async () : Promise<IContent | null> => {
            const routedContents = await table.getViaIndex('routes', route);
            if (routedContents && this.isValid(routedContents)) {
                if (this._config.policy !== IRepositoryPolicy.PreferOffline) this.updateInBackground(routedContents);
                return routedContents.data;
            }
            return null;
        }
        const resolveNetwork = async () : Promise<IContent | null> => {
            const resolvedRoute = await this._api.resolveRoute(route);
            const content = getIContentFromPathResponse(resolvedRoute);
            if (content) table.put(this.buildRepositoryItem(content));
            return content;
        }
        switch (this._config.policy) {
            case IRepositoryPolicy.NetworkFirst:
                return this._api.OnLine ? resolveNetwork() : resolveLocal();
            case IRepositoryPolicy.PreferOffline:
                return resolveLocal().then(async x => x ? x : await resolveNetwork());
            case IRepositoryPolicy.LocalStorageFirst:
                return await resolveLocal().then(x => { if (x) { resolveNetwork(); } return x; }) || await resolveNetwork();
        }
        return resolveNetwork();
    }

    public getByReference(reference: string, website?: Website) : Promise<IContent | null>
    {
        const w = website || this._api.CurrentWebsite;
        if (!w) return Promise.reject('There\'s no website provided and none inferred from the ContentDelivery API');
        if (w.contentRoots && w.contentRoots[reference]) return this.load(w.contentRoots[reference]);
        return Promise.reject(`The content root ${ reference } has not been defined`);
    }

    public async patch(reference: ContentReference, patch: (item: Readonly<IContent>) => IContent) : Promise<IContent | null>
    {
        try {
            const item = await this.load(reference);
            if (!item) return null;
            if (this._config.debug) console.log('IContentRepository: Will apply patch to content item', reference, item, patch);
            this.emit('beforePatch', item.contentLink, item);
            const patchedItem = patch(item);
            this.emit('afterPatch', patchedItem.contentLink, item, patchedItem)
            if (this._config.debug) console.log('IContentRepository: Applied patch to content item', reference, item, patchedItem);
            const table = await this.getTable();
            return await table.put(this.buildRepositoryItem(patchedItem)) ? patchedItem : null;
        } catch (e) {
            return null;
        }
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
        const tableName = this._api.InEditMode ? 'iContentEditor' : 'iContent';
        return db.getStore<IContentRepositoryItem>(tableName);
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
            apiId: ContentLinkService.createApiId(iContent, true, this._api.InEditMode),
            contentId: ContentLinkService.createApiId(iContent, false, this._api.InEditMode),
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
            db.hasStore('iContentEditor') ? Promise.resolve(true) : db.createStore('iContentEditor','apiId', undefined, [
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