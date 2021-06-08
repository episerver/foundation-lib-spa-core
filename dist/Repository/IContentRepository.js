// Import libraries
import { EventEmitter } from 'eventemitter3';
import clone from 'lodash/cloneDeep';
import deepEqual from 'deep-equal';
// Import framework
import { isNetworkError } from '../ContentDelivery/IContentDeliveryAPI';
import { getIContentFromPathResponse } from '../ContentDeliveryAPI';
// Import IndexedDB Wrappper
import IndexedDB from '../IndexedDB/IndexedDB';
import { ContentLinkService } from '../Models/ContentLink';
import { genericPropertyIsProperty } from '../Models/IContent';
import { hostnameFilter, languageFilter } from '../Models/WebsiteList';
/**
 * A wrapper for IndexedDB offering an Asynchronous API to load/fetch content items from the database
 * and underlying Episerver ContentDelivery API.
 */
export class IContentRepository extends EventEmitter {
    /**
     * Create a new instance
     *
     * @param { IContentDeliveryAPI } api The ContentDelivery API wrapper to use within this IContent Repository
     */
    constructor(api, config, serverContext) {
        super();
        this._loading = {};
        this._config = {
            maxAge: 1440,
            policy: "NetworkFirst" /* NetworkFirst */,
            debug: false // Default to disabling debug mode
        };
        this.schemaUpgrade = async (db) => {
            await Promise.all([
                db.replaceStore('iContent', 'apiId', undefined, [
                    { name: 'guid', keyPath: 'guid', unique: true },
                    { name: 'contentId', keyPath: 'contentId', unique: true },
                    { name: 'routes', keyPath: 'route', unique: false }
                ]),
                db.replaceStore('website', 'data.id', undefined, [
                    { name: 'hosts', keyPath: 'hosts', multiEntry: false, unique: false }
                ])
            ]);
            return true;
        };
        this._api = api;
        this._config = { ...this._config, ...config };
        this._storage = new IndexedDB("iContentRepository", 5, this.schemaUpgrade.bind(this));
        if (this._storage.IsAvailable)
            this._storage.open();
        // Ingest server context into the database, if we have it
        if (serverContext) {
            if (serverContext.IContent) {
                const iContent = serverContext.IContent;
                const apiId = this.createStorageId(iContent, false);
                this._loading[apiId] = (async () => {
                    this.debugMessage('Initialization: Ingesting main content', iContent);
                    await this.ingestIContent(iContent, false);
                    delete this._loading[apiId];
                    return iContent;
                })();
            }
            (serverContext?.Contents || []).forEach(iContent => {
                const apiId = this.createStorageId(iContent, false);
                this._loading[apiId] = (async () => {
                    this.debugMessage('Initialization: Ingesting additional content', iContent);
                    await this.ingestIContent(iContent, false);
                    delete this._loading[apiId];
                    return iContent;
                })();
            });
            const website = serverContext.Website; // Fetching the website causes some processing in C#, so fetch it only once...
            if (website && (website?.hosts?.length || 0) > 0) { // Maker sure we only ingest the website if it has hosts
                this.debugMessage('Initialization: Ingesting current website', website);
                this._websitesLoading = this.ingestWebsite(website).then(w => {
                    this.debugMessage('Initialization: Ingested current website', w);
                    this._websitesLoading = undefined;
                    return (w ? [w] : []);
                });
            }
        }
    }
    /**
     * Load the IContent, first try IndexedDB, if not found in the IndexedDB load it from the
     * ContentDelivery API
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    async load(reference, recursive = false) {
        const localFirst = this._config.policy === "LocalStorageFirst" /* LocalStorageFirst */ ||
            this._config.policy === "PreferOffline" /* PreferOffline */ ||
            !this._api.OnLine;
        if (localFirst && await this.has(reference))
            return this.get(reference);
        return this.update(reference, recursive);
    }
    createStorageId(reference, preferGuid, editModeId) {
        return ContentLinkService.createApiId(reference, preferGuid, editModeId) + '%%' + this._api.Language;
    }
    /**
     * Force reloading of the content and return the fresh content
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    update(reference, recursive = false) {
        if (!this._api.OnLine)
            return Promise.resolve(null);
        const apiId = this.createStorageId(reference, false);
        if (!this._loading[apiId]) {
            const internalLoad = async () => {
                const iContent = await this._api.getContent(reference, undefined, recursive ? ['*'] : []);
                if (iContent) {
                    if (!isNetworkError(iContent)) {
                        await this.recursiveLoad(iContent, recursive);
                    }
                    await this.ingestIContent(iContent);
                }
                delete this._loading[apiId];
                return iContent;
            };
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
    isValid(item) {
        if (!this._api.OnLine)
            return true; // Do not invalidate if we're off-line
        // @ToDo: Invalidate if user changed
        // @ToDo: Invalidate if visitor groups changed
        // @ToDo: Invalidate if A/B test changed
        // Check Content Provider
        const isSpaContentProvider = item.data.contentLink.providerName === 'EpiserverSPA';
        // Check expiry of content cache
        const added = item.added || 0;
        const now = Date.now();
        const maxAgeMiliseconds = this._config.maxAge * 60 * 1000;
        const expired = now - added > maxAgeMiliseconds;
        // Run actual test
        const valid = !isSpaContentProvider && !expired;
        this.debugMessage(`Validation check: ${item.contentId}`, valid);
        return valid;
    }
    updateInBackground(item) {
        if (!this._api.OnLine)
            return; // Don't try updating if we're off-line
        this.update(item.data.contentLink);
    }
    /**
     * Return whether or not the referenced iContent is available in the IndexedDB
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @returns { Promise<boolean> }
     */
    async has(reference) {
        const apiId = this.createStorageId(reference, false);
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
    async get(reference) {
        this.emit('beforeGet', reference);
        let data = null;
        const apiId = this.createStorageId(reference, false);
        const table = await this.getTable();
        const repositoryContent = await table.getViaIndex('contentId', apiId).catch(() => undefined);
        if (repositoryContent && this.isValid(repositoryContent)) {
            if (this._config.policy !== "PreferOffline" /* PreferOffline */)
                this.updateInBackground(repositoryContent);
            data = repositoryContent.data;
        }
        this.emit('afterGet', reference, data);
        return data;
    }
    async getByContentId(contentId) {
        return this.getTable().then(table => table.getViaIndex('contentId', contentId)).then(iContent => iContent && this.isValid(iContent) ? iContent.data : null);
    }
    /**
     * Resolve an IContent | null from a route via the index
     *
     * @param { string } route The route to resolve to an iContent item trough the index
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    async getByRoute(route) {
        this.debugMessage(`Fetching iContent for route ${route}`);
        if (Object.keys(this._loading).length) {
            this.debugMessage("Loading items, awaiting current load to complete");
            await Promise.all(Object.values(this._loading).map(x => x.catch(() => null)));
        }
        const table = await this.getTable();
        const resolveLocal = async () => {
            const routedContents = await table.getViaIndex('routes', route);
            if (routedContents && this.isValid(routedContents)) {
                if (this._config.policy !== "PreferOffline" /* PreferOffline */)
                    this.updateInBackground(routedContents);
                this.debugMessage(`Fetched iContent for route ${route} locally`, routedContents.data);
                return routedContents.data;
            }
            if (route === '/') { // Special case for Homepage
                this.debugMessage(`Fetched iContent for homepage`);
                return this.getByReference('startPage');
            }
            return null;
        };
        const resolveNetwork = async () => {
            const resolvedRoute = await this._api.resolveRoute(route);
            const content = getIContentFromPathResponse(resolvedRoute);
            if (content)
                this.ingestIContent(content);
            this.debugMessage(`Fetched iContent for route ${route} remotely`, content);
            return content;
        };
        switch (this._config.policy) {
            case "NetworkFirst" /* NetworkFirst */:
                return this._api.OnLine ? resolveNetwork() : resolveLocal();
            case "PreferOffline" /* PreferOffline */:
            case "LocalStorageFirst" /* LocalStorageFirst */:
                {
                    const iContent = await resolveLocal();
                    return iContent ? iContent : resolveNetwork();
                }
        }
        return resolveNetwork();
    }
    async getByReference(reference, website) {
        const ws = website ? website : await this.getCurrentWebsite();
        if (!ws)
            throw new Error('There\'s no website provided and none inferred from the ContentDelivery API');
        if (!(ws?.contentRoots[reference]))
            throw new Error(`The content root ${reference} has not been defined`);
        return this.load(ws.contentRoots[reference]);
    }
    async patch(reference, patch) {
        try {
            const item = await this.load(reference);
            if (!item)
                return null;
            this.debugMessage('Will apply patch to content item', reference, item, patch);
            this.emit('beforePatch', item.contentLink, item);
            const patchedItem = patch(clone(item)); // Always work on a cloned version of the content
            this.emit('afterPatch', patchedItem.contentLink, item, patchedItem);
            this.debugMessage('Applied patch to content item', reference, item, patchedItem);
            return await this.ingestIContent(patchedItem);
        }
        catch (e) {
            return null;
        }
    }
    getWebsites() {
        if (this._websitesLoading) {
            this.debugMessage('Already loading websites, returning existing promise');
            return this._websitesLoading;
        }
        const internalLoad = async () => {
            const table = await this.getWebsiteTable();
            let websites = await table.all().then(list => list.map(wd => wd.data));
            if (!websites || websites.length === 0) {
                this.debugMessage('No websites in store, fetching from server');
                websites = await this._api.getWebsites();
                await table.putAll(websites.map(w => { return { data: this.buildWebsiteRepositoryItem(w) }; }));
                this.debugMessage('Loaded websites from server and stored locally');
            }
            this._websitesLoading = undefined;
            return websites;
        };
        return (this._websitesLoading = internalLoad());
    }
    async getWebsite(hostname, language, matchWildCard = true) {
        const lang = language || this._api.Language;
        this.debugMessage(`Loading website by host ${hostname} in language ${lang}; ${matchWildCard ? '' : 'not '}accepting the wildcard host`);
        const websites = await this.getWebsites();
        const website = websites.filter(w => hostnameFilter(w, hostname, lang, matchWildCard) && languageFilter(w, lang)).shift() || null;
        this.debugMessage(`Loaded website by host ${hostname} in language ${lang}; ${matchWildCard ? '' : 'not '}accepting the wildcard host:`, website);
        return website;
    }
    getCurrentWebsite() {
        let hostname = '*';
        try {
            hostname = window.location.host;
        }
        catch (e) { /* Ignored on purpose */ }
        return this.getWebsite(hostname, undefined, true);
    }
    async ingestIContent(iContent, overwrite = true) {
        const table = await this.getTable();
        const current = await table.get(this.createStorageId(iContent, true));
        const isUpdate = current?.data ? true : false;
        if (!overwrite && isUpdate)
            return current.data;
        if (deepEqual(iContent, current?.data, { strict: true })) {
            this.debugMessage('Ignoring ingestion as there\'s no change');
            return current.data;
        }
        if (isUpdate) {
            this.debugMessage('Before update', iContent, current.data);
            this.emit('beforeUpdate', iContent, current.data);
        }
        else {
            this.debugMessage('Before add', iContent);
            this.emit('beforeAdd', iContent);
        }
        const ingested = (await table.put(this.buildRepositoryItem(iContent))) ? iContent : null;
        if (isUpdate) {
            this.debugMessage('After update', ingested);
            this.emit('afterUpdate', ingested);
        }
        else {
            this.debugMessage('After add', ingested);
            this.emit('afterAdd', ingested);
        }
        return ingested;
    }
    async ingestWebsite(website) {
        const table = await this.getWebsiteTable();
        return (await table.put(this.buildWebsiteRepositoryItem(website))) ? website : null;
    }
    /**
     * Get the underlying table in IndexedDB
     *
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    async getTable() {
        const db = await this._storage.open();
        const tableName = 'iContent';
        return db.getStore(tableName);
    }
    async getWebsiteTable() {
        const db = await this._storage.open();
        return db.getStore('website');
    }
    buildWebsiteRepositoryItem(website) {
        return {
            data: website,
            added: Date.now(),
            accessed: Date.now(),
            hosts: website.hosts?.map(x => x.name).join(' ') || website.id
        };
    }
    buildRepositoryItem(iContent) {
        return {
            apiId: this.createStorageId(iContent, true),
            contentId: this.createStorageId(iContent, false),
            type: iContent.contentType?.join('/') ?? 'Errors/ContentTypeUnknown',
            route: ContentLinkService.createRoute(iContent),
            data: iContent,
            added: Date.now(),
            accessed: Date.now(),
            guid: this._api.Language + '-' + iContent.contentLink.guidValue
        };
    }
    async recursiveLoad(iContent, recurseDown = false) {
        for (const key of Object.keys(iContent)) {
            const p = iContent[key];
            if (genericPropertyIsProperty(p))
                switch (p.propertyDataType) {
                    case 'PropertyContentReference':
                    case 'PropertyPageReference':
                        {
                            const cRef = p;
                            if (cRef.expandedValue) {
                                await this.ingestIContent(cRef.expandedValue);
                                await this.recursiveLoad(cRef.expandedValue, recurseDown);
                                delete iContent[key].expandedValue;
                                break;
                            }
                            if (cRef.value && recurseDown) {
                                await this.load(cRef.value, recurseDown);
                            }
                            break;
                        }
                    case 'PropertyContentArea':
                        {
                            const cArea = p;
                            if (cArea.expandedValue) {
                                await Promise.all(cArea.expandedValue?.map(async (x) => {
                                    await this.ingestIContent(x);
                                    await this.recursiveLoad(x);
                                }));
                                delete iContent[key].expandedValue;
                                break;
                            }
                            if (cArea.value && recurseDown) {
                                await Promise.all(cArea.value?.map(x => this.load(x.contentLink, recurseDown).catch(() => null)) || []);
                            }
                            break;
                        }
                    case 'PropertyContentReferenceList':
                        {
                            const cRefList = p;
                            if (cRefList.expandedValue) {
                                await Promise.all(cRefList.expandedValue?.map(async (x) => {
                                    await this.ingestIContent(x);
                                    await this.recursiveLoad(x);
                                }));
                                delete iContent[key].expandedValue;
                                break;
                            }
                            if (cRefList.value && recurseDown) {
                                await Promise.all(cRefList.value?.map(x => this.load(x, recurseDown).catch(() => null)) || []);
                            }
                            break;
                        }
                }
        }
    }
    /**
     * Write a debug message
     *
     * @param message The message to write to the debugging system
     */
    debugMessage(...message) {
        if (this._config.debug && console)
            console.debug.apply(console, ['IContentRepository:', ...message]);
    }
}
export default IContentRepository;
//# sourceMappingURL=IContentRepository.js.map