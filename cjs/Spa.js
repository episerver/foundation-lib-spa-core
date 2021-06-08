"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultContext = exports.EpiserverSpaContext = void 0;
const tslib_1 = require("tslib");
// Redux & Redux setup
const toolkit_1 = require("@reduxjs/toolkit");
const DefaultEventEngine_1 = require("./Core/DefaultEventEngine");
const ContentLink_1 = require("./Models/ContentLink");
const AppGlobal_1 = require("./AppGlobal");
const IServerContextAccessor_1 = require("./ServerSideRendering/IServerContextAccessor");
// Core Modules
const RoutingModule_1 = require("./Routing/RoutingModule");
const RepositoryModule_1 = require("./Repository/RepositoryModule");
const LoadersModule_1 = require("./Loaders/LoadersModule");
const StateModule_1 = require("./State/StateModule");
const StringUtils_1 = require("./Util/StringUtils");
// Create context
const ctx = AppGlobal_1.default();
ctx.EpiserverSpa = ctx.EpiserverSpa || {};
ctx.epi = ctx.epi || {};
class EpiserverSpaContext {
    constructor() {
        this._initialized = 0 /* NotInitialized */;
        this._modules = [];
        this._cachedEditModeUrl = undefined;
    }
    get serviceContainer() {
        return this._serviceContainer;
    }
    /**
     * Retrieve an instance of the ContentDeliveryAPI wrapper
     *
     * @deprecated    Use the ContentRepository_V2 service to fetch content and interact with controllers
     */
    get contentStorage() {
        return this.serviceContainer.getService("ContentDeliveryAPI" /* ContentDeliveryApi */);
    }
    get Language() {
        var _a;
        return ((_a = this.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */)) === null || _a === void 0 ? void 0 : _a.Language) ||
            this.config().defaultLanguage;
    }
    init(config, serviceContainer, isServerSideRendering = false) {
        if (config.enableDebug)
            console.time("SPA Initialization");
        // Generic init
        this._initialized = 1 /* Initializing */;
        this._serviceContainer = serviceContainer;
        // Prepare services
        const executionContext = {
            isServerSideRendering: (() => {
                try {
                    return isServerSideRendering || (ctx.epi.isServerSideRendering === true);
                }
                catch (e) {
                    return false;
                }
            })(),
            isDebugActive: typeof (config.enableDebug) === 'boolean' ? config.enableDebug : false,
            isEditable: this.initialEditMode(),
            isInEditMode: this.initialEditMode(),
        };
        config.enableDebug = executionContext.isDebugActive;
        const eventEngine = new DefaultEventEngine_1.default();
        eventEngine.debug = executionContext.isDebugActive;
        // Warn for production built with debug active
        if (process.env.NODE_ENV === 'production' && executionContext.isDebugActive)
            console.warn('Running Episerver SPA with a production build and debug enabled');
        // Create module list
        if (config.enableDebug)
            console.time('Creating modules');
        this._modules.push(new RepositoryModule_1.default(), new RoutingModule_1.default(), new LoadersModule_1.default(), new StateModule_1.default());
        if (config.modules)
            this._modules = this._modules.concat(config.modules);
        this._modules.sort((a, b) => a.SortOrder - b.SortOrder);
        if (config.enableDebug) {
            console.info(`Episerver SPA modules: ${this._modules.map((m) => `${m.GetName()} (${m.SortOrder})`).join(', ')}`);
            console.timeEnd('Creating modules');
        }
        // Register core services
        this._serviceContainer.addService("Context" /* Context */, this);
        this._serviceContainer.addService("Config" /* Config */, config);
        this._serviceContainer.addService("ExecutionContext" /* ExecutionContext */, executionContext);
        this._serviceContainer.addService("ServerContext" /* ServerContext */, IServerContextAccessor_1.Factory.create(executionContext, config));
        this._serviceContainer.addService("EventEngine" /* EventEngine */, eventEngine);
        this._initialized = 2 /* CoreServicesReady */;
        // Have modules add services of their own
        this._modules.forEach(x => x.ConfigureContainer(this._serviceContainer));
        this._initialized = 3 /* ContainerReady */;
        // Redux init
        this._initRedux();
        // EpiEditMode init
        this._initEditMode();
        // Run module startup logic
        this._modules.forEach(x => x.StartModule(this));
        // Mark SPA as initialized & and make some info available in the global context
        this._initialized = 4 /* Initialized */;
        if (executionContext.isDebugActive) {
            ctx.EpiserverSpa.serviceContainer = this._serviceContainer;
            ctx.EpiserverSpa.modules = this._modules;
            ctx.EpiserverSpa.eventEngine = eventEngine;
        }
        if (config.enableDebug)
            console.timeEnd("SPA Initialization");
    }
    _initRedux() {
        const reducers = {};
        this._modules.forEach(x => { const ri = x.GetStateReducer(); if (ri) {
            reducers[ri.stateKey] = ri.reducer;
        } });
        this._state = toolkit_1.configureStore({ reducer: reducers });
        this._state.dispatch({ type: '@@EPI/INIT' });
    }
    _initEditMode() {
        if (this.isDebugActive())
            console.debug(`Initializing edit mode in ${this.initialEditMode() ? 'enabled' : 'disabled'} state`);
        if (!this.isServerSideRendering() && this.initialEditMode()) {
            this.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */).InEditMode = true;
            this.serviceContainer.getService("ContentDeliveryAPI" /* ContentDeliveryApi */).setInEditMode(true);
        }
    }
    isInitialized() {
        return this._initialized === 4 /* Initialized */;
    }
    isDebugActive() {
        this.enforceInitialized();
        return this.serviceContainer.getService("ExecutionContext" /* ExecutionContext */).isDebugActive;
    }
    isServerSideRendering() {
        this.enforceInitialized();
        return this.serviceContainer.getService("ExecutionContext" /* ExecutionContext */).isServerSideRendering;
    }
    enforceInitialized() {
        const initializedStatuses = [3 /* ContainerReady */, 4 /* Initialized */];
        if (initializedStatuses.indexOf(this._initialized) < 0) {
            throw new Error('The Episerver SPA Context has not yet been initialized');
        }
    }
    dispatch(action) {
        this.enforceInitialized();
        return this._state.dispatch(action);
    }
    invoke(action) {
        this.enforceInitialized();
        return this._state.dispatch(action);
    }
    getStore() {
        this.enforceInitialized();
        return this._state;
    }
    events() {
        return this._serviceContainer.getService("EventEngine" /* EventEngine */);
    }
    config() {
        this.enforceInitialized();
        return this._serviceContainer.getService("Config" /* Config */);
    }
    componentLoader() {
        return this._serviceContainer.getService("ComponentLoader" /* ComponentLoader */);
    }
    contentDeliveryApi() {
        this.enforceInitialized();
        return this._serviceContainer.getService("ContentDeliveryAPI" /* ContentDeliveryApi */);
    }
    getContentByGuid() {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByGuid(id) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService("IContentRepository_V2" /* IContentRepository_V2 */);
        return repo.load(id).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentById() {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentById(id) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService("IContentRepository_V2" /* IContentRepository_V2 */);
        return repo.load(id).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentByRef() {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByRef(ref) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService("IContentRepository_V2" /* IContentRepository_V2 */);
        return repo.getByReference(ref).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentByPath() {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByPath(path) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService("IContentRepository_V2" /* IContentRepository_V2 */);
        return repo.getByRoute(path).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    injectContent() {
        // Ignore on purpose, will be removed
    }
    /**
     * Check whether or not we're in edit mode by looking at the URL. This
     * yields the correct result prior to the onEpiReady event has fired
     *
     * @return {boolean}
     */
    initialEditMode() {
        var _a, _b, _c;
        try {
            if (typeof ((_a = ctx === null || ctx === void 0 ? void 0 : ctx.epi) === null || _a === void 0 ? void 0 : _a.inEditMode) === 'boolean' && ctx.epi.inEditMode)
                return true;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            if (typeof ((_c = (_b = ctx === null || ctx === void 0 ? void 0 : ctx.epi) === null || _b === void 0 ? void 0 : _b.beta) === null || _c === void 0 ? void 0 : _c.inEditMode) === 'boolean' && ctx.epi.beta.inEditMode)
                return true;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            if (this._cachedEditModeUrl === undefined) {
                this._cachedEditModeUrl = (new URLSearchParams(window.location.search.toLowerCase())).get('epieditmode') === 'true';
            }
            return this._cachedEditModeUrl;
        }
        catch (e) {
            // Ignore error on purpose to go to next test
        }
        try {
            return window !== (window === null || window === void 0 ? void 0 : window.top) && (window === null || window === void 0 ? void 0 : window.name) === 'sitePreview';
        }
        catch (e) {
            // Ignore error on purpose to go to next test
        }
        return false;
    }
    isInEditMode() {
        return this._serviceContainer.getService("ExecutionContext" /* ExecutionContext */).isInEditMode;
    }
    isEditable() {
        return this._serviceContainer.getService("ExecutionContext" /* ExecutionContext */).isEditable;
    }
    getEpiserverUrl(path = '', action) {
        var _a;
        let itemPath = '';
        if (ContentLink_1.ContentLinkService.referenceIsString(path)) {
            itemPath = path;
        }
        else if (ContentLink_1.ContentLinkService.referenceIsContentLink(path)) {
            itemPath = path.url;
        }
        else if (ContentLink_1.ContentLinkService.referenceIsIContent(path)) {
            itemPath = path.contentLink.url;
        }
        if (action) {
            itemPath += itemPath.length ? '/' + action : action;
        }
        const itemUrl = new URL(itemPath, (_a = this.config()) === null || _a === void 0 ? void 0 : _a.epiBaseUrl);
        return StringUtils_1.default.TrimRight('/', itemUrl.href);
    }
    getSpaRoute(path) {
        let newPath = '';
        if (ContentLink_1.ContentLinkService.referenceIsString(path)) {
            newPath = path;
        }
        else if (ContentLink_1.ContentLinkService.referenceIsIContent(path)) {
            newPath = path.contentLink.url;
        }
        else if (ContentLink_1.ContentLinkService.referenceIsContentLink(path)) {
            newPath = path.url;
        }
        return '/' + StringUtils_1.default.TrimLeft('/', this.config().basePath + newPath);
    }
    /**
     *
     * @param content   The content item load, by path, content link or IContent
     * @param action    The action to invoke on the content controller
     */
    buildPath(content, action = "") {
        let newPath = '';
        if (ContentLink_1.ContentLinkService.referenceIsString(content)) {
            newPath = content;
        }
        else if (ContentLink_1.ContentLinkService.referenceIsIContent(content)) {
            newPath = content.contentLink.url;
        }
        else if (ContentLink_1.ContentLinkService.referenceIsContentLink(content)) {
            newPath = content.url;
        }
        if (!newPath) {
            if (this.isDebugActive())
                console.log('The navigation target does not include a path.', content);
            newPath = '/';
        }
        if (action) {
            newPath = newPath.substr(-1, 1) === "/" ? newPath + action + "/" : newPath + "/" + action + "/";
        }
        return newPath;
    }
    navigateTo(path) {
        let newPath = '';
        if (ContentLink_1.ContentLinkService.referenceIsString(path)) {
            newPath = path;
        }
        else if (ContentLink_1.ContentLinkService.referenceIsIContent(path)) {
            newPath = path.contentLink.url;
        }
        else if (ContentLink_1.ContentLinkService.referenceIsContentLink(path)) {
            newPath = path.url;
        }
        if (!newPath) {
            if (this.isDebugActive())
                console.log('The navigation target does not include a path.', path);
            newPath = '/';
        }
        window.location.href = newPath;
    }
    getCurrentWebsite() {
        const website = this.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */).CurrentWebsite;
        if (!website)
            throw new Error('The Current website has not been set');
        return website;
    }
    loadCurrentWebsite() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let domain = '';
            const repo = this.serviceContainer.getService("IContentRepository_V2" /* IContentRepository_V2 */);
            try {
                domain = window.location.hostname;
            }
            catch (e) {
                // Ignored on purpose
            }
            const website = yield repo.getWebsite(domain);
            if (!website)
                throw new Error('Current website not loadable');
            this.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */).CurrentWebsite = website;
            return website;
        });
    }
    getCurrentPath() {
        const state = this._state.getState();
        return state.ViewContext.currentPath;
    }
    getRoutedContent() {
        if (!this._routedContent) {
            throw new Error("There's no currently routed content");
        }
        return this._routedContent;
    }
    setRoutedContent(iContent) {
        this._routedContent = iContent;
        return this;
    }
    hasRoutedContent() {
        return this._routedContent ? true : false;
    }
    getContentByContentRef() {
        throw new Error('No longer supported');
    }
    /**
     * Get the base path where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns /spa. If it's
     * running at https://example.com/, this method will return an empty
     * string.
     *
     * It's preferred to use this method over accessing the config directly as
     * this method sanitizes the configuration value;
     *
     * @returns {string}    The base path of the SPA
     */
    getSpaBasePath() {
        var _a;
        if (typeof this._sanitizedSpaBasePath === 'string') {
            return this._sanitizedSpaBasePath;
        }
        let configBasePath = ((_a = this.config()) === null || _a === void 0 ? void 0 : _a.basePath) || '';
        if (configBasePath.length > 0) {
            configBasePath = StringUtils_1.default.TrimRight('/', StringUtils_1.default.TrimLeft('/', configBasePath));
            configBasePath = configBasePath.length > 0 ? '/' + configBasePath : '';
        }
        this._sanitizedSpaBasePath = configBasePath;
        return this._sanitizedSpaBasePath;
    }
    /**
     * Get the domain where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns: https://example.com
     */
    getSpaDomain() {
        return window.location.protocol + '//' + window.location.hostname;
    }
    /**
     * Get the location where Episerver is running, whithout a trailing slash.
     */
    getEpiserverURL() {
        return this.getEpiserverUrl();
    }
}
exports.EpiserverSpaContext = EpiserverSpaContext;
ctx.EpiserverSpa.Context = ctx.EpiserverSpa.Context || new EpiserverSpaContext();
exports.DefaultContext = ctx.EpiserverSpa.Context;
exports.default = exports.DefaultContext;
//# sourceMappingURL=Spa.js.map