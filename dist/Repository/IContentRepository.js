"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IContentRepository = void 0;
const ContentDeliveryAPI_1 = require("../ContentDeliveryAPI");
const ContentLink_1 = require("../Models/ContentLink");
const WebsiteList_1 = require("../Models/WebsiteList");
const IndexedDB_1 = __importDefault(require("../IndexedDB/IndexedDB"));
/**
 * A wrapper for IndexedDB offering an Asynchronous API to load/fetch content items from the database
 * and underlying Episerver ContentDelivery API.
 */
class IContentRepository {
    /**
     * Create a new instance
     *
     * @param { IContentDeliveryAPI } api The ContentDelivery API wrapper to use within this IContent Repository
     */
    constructor(api) {
        this._loading = {};
        this.schemaUpgrade = (db, t) => {
            return Promise.all([
                db.hasStore('iContent') ? Promise.resolve(true) : db.createStore('iContent', 'apiId', undefined, [
                    { name: 'guid', keyPath: 'data.contentLink.guidValue', unique: true },
                    { name: 'contentId', keyPath: 'contentId', unique: true },
                    { name: 'routes', keyPath: 'route', unique: false }
                ]),
                db.hasStore('website') ? Promise.resolve(true) : db.createStore('website', 'data.id', undefined, [
                    { name: 'hosts', keyPath: 'data.hosts.name', multiEntry: false, unique: false }
                ])
            ]).then(() => true);
        };
        this._api = api;
        this._storage = new IndexedDB_1.default("iContentRepository", 4, this.schemaUpgrade.bind(this));
        if (this._storage.IsAvailable)
            this._storage.open();
    }
    /**
     * Load the IContent, first try IndexedDB, if not found in the IndexedDB load it from the
     * ContentDelivery API
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    load(reference, recursive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiId = ContentLink_1.ContentLinkService.createApiId(reference);
            if (yield this.has(reference))
                return this.get(reference);
            if (!this._loading[apiId]) {
                const internalLoad = () => __awaiter(this, void 0, void 0, function* () {
                    const iContent = yield this._api.getContent(reference, undefined, recursive ? ['*'] : []);
                    const table = yield this.getTable();
                    yield this.recursiveLoad(iContent, recursive);
                    table.put(this.buildRepositoryItem(iContent));
                    delete this._loading[apiId];
                    return iContent;
                });
                this._loading[apiId] = internalLoad();
            }
            return this._loading[apiId];
        });
    }
    /**
     * Force reloading of the content and return the fresh content
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    update(reference, recursive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiId = ContentLink_1.ContentLinkService.createApiId(reference, true);
            const internalLoad = () => __awaiter(this, void 0, void 0, function* () {
                const iContent = yield this._api.getContent(reference, undefined, recursive ? ['*'] : []);
                const table = yield this.getTable();
                yield this.recursiveLoad(iContent, recursive);
                table.put(this.buildRepositoryItem(iContent));
                delete this._loading[apiId];
                return iContent;
            });
            if (!this._loading[apiId]) {
                this._loading[apiId] = internalLoad(); // If not loaded before, do initial load
            }
            else {
                this._loading[apiId] = this._loading[apiId].then(() => internalLoad()); // If loaded before, chain a reload to it
            }
            return this._loading[apiId];
        });
    }
    /**
     * Return whether or not the referenced iContent is available in the IndexedDB
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @returns { Promise<boolean> }
     */
    has(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiId = ContentLink_1.ContentLinkService.createApiId(reference);
            console.log('Verifying content in repo', reference, apiId);
            const table = yield this.getTable();
            return table.getViaIndex('contentId', apiId)
                .then(x => { console.log('Got repo response: ', x); return x ? true : false; })
                .catch(e => { console.log('Got repo error: ', e); return false; });
        });
    }
    /**
     * Retrieve the iContent item from the IndexedDB, or null if the item is
     * not found in the IndexedDB
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @returns { Promise<IContent | null> }
     */
    get(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiId = ContentLink_1.ContentLinkService.createApiId(reference);
            const table = yield this.getTable();
            const repositoryContent = yield table.getViaIndex('contentId', apiId).catch(() => undefined);
            if (repositoryContent) {
                // Update accessed time
            }
            return repositoryContent ? repositoryContent.data : null;
        });
    }
    getByContentId(contentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getTable().then(table => table.getViaIndex('contentId', contentId)).then(iContent => iContent ? iContent.data : null);
        });
    }
    /**
     * Resolve an IContent | null from a route via the index
     *
     * @param { string } route The route to resolve to an iContent item trough the index
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    getByRoute(route) {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.getTable();
            const routedContents = yield table.getViaIndex('routes', route);
            if (routedContents) {
                return routedContents.data;
            }
            const resolvedRoute = yield this._api.resolveRoute(route);
            const content = ContentDeliveryAPI_1.getIContentFromPathResponse(resolvedRoute);
            if (content) {
                table.put(this.buildRepositoryItem(content));
            }
            return content;
        });
    }
    getByReference(reference, website) {
        if (website.contentRoots[reference]) {
            return this.load(website.contentRoots[reference]);
        }
        return Promise.reject(`The content root ${reference} has not been defined`);
    }
    getWebsites() {
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.getWebsiteTable();
            let websites = yield table.all().then(list => list.map(wd => wd.data));
            if (!websites || websites.length === 0) {
                websites = yield this._api.getWebsites();
                yield table.putAll(websites.map(w => { return { data: this.buildWebsiteRepositoryItem(w) }; }));
            }
            return websites;
        });
    }
    getWebsite(hostname, language) {
        return __awaiter(this, void 0, void 0, function* () {
            const websites = (yield this.getWebsites()).filter(w => WebsiteList_1.hostnameFilter(w, hostname, language));
            return websites && websites.length === 1 ? websites[0] : null;
        });
    }
    /**
     * Get the underlying table in IndexedDB
     *
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    getTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this._storage.open();
            return db.getStore('iContent');
        });
    }
    getWebsiteTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this._storage.open();
            return db.getStore('website');
        });
    }
    buildWebsiteRepositoryItem(website) {
        return {
            data: website,
            added: Date.now(),
            accessed: Date.now()
        };
    }
    buildRepositoryItem(iContent) {
        var _a, _b;
        return {
            apiId: ContentLink_1.ContentLinkService.createApiId(iContent, true),
            contentId: ContentLink_1.ContentLinkService.createApiId(iContent, false),
            type: (_b = (_a = iContent.contentType) === null || _a === void 0 ? void 0 : _a.join('/')) !== null && _b !== void 0 ? _b : 'Errors/ContentTypeUnknown',
            route: ContentLink_1.ContentLinkService.createRoute(iContent),
            data: iContent,
            added: Date.now(),
            accessed: Date.now()
        };
    }
    recursiveLoad(iContent, recurseDown = false) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const table = yield this.getTable();
            for (const key of Object.keys(iContent)) {
                const p = iContent[key];
                if (p && p.propertyDataType)
                    switch (p.propertyDataType) {
                        case 'PropertyContentReference':
                        case 'PropertyPageReference':
                            const cRef = p;
                            if (cRef.expandedValue) {
                                table.put(this.buildRepositoryItem(cRef.expandedValue));
                                this.recursiveLoad(cRef.expandedValue, recurseDown);
                                delete iContent[key].expandedValue;
                                break;
                            }
                            if (cRef.value && recurseDown) {
                                this.load(cRef.value, recurseDown);
                            }
                            break;
                        case 'PropertyContentArea':
                            const cArea = p;
                            if (cArea.expandedValue) {
                                (_a = cArea.expandedValue) === null || _a === void 0 ? void 0 : _a.forEach(x => {
                                    table.put(this.buildRepositoryItem(x));
                                    this.recursiveLoad(x);
                                });
                                delete iContent[key].expandedValue;
                                break;
                            }
                            if (cArea.value && recurseDown) {
                                (_b = cArea.value) === null || _b === void 0 ? void 0 : _b.forEach(x => this.load(x.contentLink, recurseDown).catch(() => null));
                            }
                            break;
                        case 'PropertyContentReferenceList':
                            const cRefList = p;
                            if (cRefList.expandedValue) {
                                (_c = cRefList.expandedValue) === null || _c === void 0 ? void 0 : _c.forEach(x => {
                                    table.put(this.buildRepositoryItem(x));
                                    this.recursiveLoad(x);
                                });
                                delete iContent[key].expandedValue;
                                break;
                            }
                            if (cRefList.value && recurseDown) {
                                (_d = cRefList.value) === null || _d === void 0 ? void 0 : _d.forEach(x => this.load(x, recurseDown).catch(() => null));
                            }
                            break;
                    }
            }
        });
    }
}
exports.IContentRepository = IContentRepository;
exports.default = IContentRepository;
