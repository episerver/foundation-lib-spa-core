"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpiserverSpaContext = exports.InitStatus = void 0;
// Redux & Redux setup
const toolkit_1 = require("@reduxjs/toolkit");
const AbstractRepostory_1 = require("./Repository/AbstractRepostory");
const IContent_1 = __importStar(require("./Repository/IContent"));
const ViewContext_1 = __importDefault(require("./Repository/ViewContext"));
const IServiceContainer_1 = require("./Core/IServiceContainer");
const ContentDeliveryAPI_1 = __importDefault(require("./ContentDeliveryAPI"));
const DefaultEventEngine_1 = __importDefault(require("./Core/DefaultEventEngine"));
const ContentLink_1 = require("./Models/ContentLink");
const ComponentLoader_1 = __importDefault(require("./Loaders/ComponentLoader"));
const AppGlobal_1 = __importDefault(require("./AppGlobal"));
const RoutingModule_1 = __importDefault(require("./Routing/RoutingModule"));
const ErrorPage_1 = __importDefault(require("./Models/ErrorPage"));
const StringUtils_1 = __importDefault(require("./Util/StringUtils"));
// Content Delivery V2
const IContentRepository_1 = __importDefault(require("./Repository/IContentRepository"));
const ContentDeliveryAPI_2 = __importDefault(require("./ContentDelivery/ContentDeliveryAPI"));
// Create context
const ctx = AppGlobal_1.default();
ctx.EpiserverSpa = ctx.EpiserverSpa || {};
ctx.epi = ctx.epi || {};
var InitStatus;
(function (InitStatus) {
    InitStatus[InitStatus["NotInitialized"] = 0] = "NotInitialized";
    InitStatus[InitStatus["Initializing"] = 1] = "Initializing";
    InitStatus[InitStatus["Initialized"] = 2] = "Initialized";
})(InitStatus = exports.InitStatus || (exports.InitStatus = {}));
class EpiserverSpaContext {
    constructor() {
        this._initialized = InitStatus.NotInitialized;
        this._modules = [];
    }
    get serviceContainer() {
        return this._serviceContainer;
    }
    get contentStorage() {
        return this.serviceContainer.getService(IServiceContainer_1.DefaultServices.ContentDeliveryApi);
    }
    init(config, serviceContainer, isServerSideRendering = false) {
        // Generic init
        this._initialized = InitStatus.Initializing;
        this._isServerSideRendering = isServerSideRendering;
        this._serviceContainer = serviceContainer;
        const executionContext = { isServerSideRendering };
        // Create module list
        this._modules.push(new RoutingModule_1.default());
        if (config.modules) {
            this._modules = this._modules.concat(config.modules);
        }
        if (config.enableDebug)
            console.debug('Spa modules:', this._modules.map((m) => m.GetName()));
        // Add component loaders
        const cl = new ComponentLoader_1.default();
        cl.setDebug(config.enableDebug || false);
        // @ToDo: Add registration logic
        // Register core services
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.Context, this);
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.Config, config);
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.ExecutionContext, executionContext);
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.ContentDeliveryApi, new ContentDeliveryAPI_1.default(this, config));
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.EventEngine, new DefaultEventEngine_1.default());
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.ComponentLoader, cl);
        const newAPI = new ContentDeliveryAPI_2.default({
            Adapter: config.networkAdapter,
            BaseURL: config.epiBaseUrl,
            AutoExpandAll: config.autoExpandRequests,
            Debug: config.enableDebug,
            EnableExtensions: true,
            Language: config.defaultLanguage
        });
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.ContentDeliveryAPI_V2, newAPI);
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.IContentRepository_V2, new IContentRepository_1.default(newAPI));
        // Have modules add services of their own
        this._modules.forEach(x => x.ConfigureContainer(this._serviceContainer));
        // Redux init
        this._initRedux();
        // EpiEditMode init
        this._initEditMode();
        // Run module startup logic
        this._modules.forEach(x => x.StartModule(this));
        this._initialized = InitStatus.Initialized;
        ctx.EpiserverSpa.serviceContainer = this._serviceContainer;
    }
    _initRedux() {
        const reducers = {};
        IContent_1.default.ContentDeliveryAPI = this.contentDeliveryApi();
        reducers[IContent_1.default.StateKey] = IContent_1.default.reducer.bind(IContent_1.default);
        reducers[ViewContext_1.default.StateKey] = ViewContext_1.default.reducer.bind(ViewContext_1.default);
        this._modules.forEach(x => { const ri = x.GetStateReducer(); if (ri) {
            reducers[ri.stateKey] = ri.reducer;
        } });
        this._state = toolkit_1.configureStore({ reducer: reducers });
        const initAction = { type: AbstractRepostory_1.RepositoryActions.INIT };
        this._state.dispatch(initAction);
    }
    _initEditMode() {
        if (this.isDebugActive())
            console.debug(`Initializing edit mode in ${this.initialEditMode() ? 'enabled' : 'disabled'} state`);
        if (!this._isServerSideRendering && this.initialEditMode()) {
            if (this.isDebugActive())
                console.debug('Adding edit mode event handlers');
            this.contentDeliveryApi().setInEditMode(true);
            this.events().addListener('beta/epiReady', 'BetaEpiReady', this.onEpiReady.bind(this), true);
            this.events().addListener('beta/contentSaved', 'BetaEpiContentSaved', this.onEpiContentSaved.bind(this), true);
            this.events().addListener('epiReady', 'EpiReady', this.onEpiReady.bind(this), true);
            this.events().addListener('contentSaved', 'EpiContentSaved', this.onEpiContentSaved.bind(this), true);
        }
    }
    onEpiContentSaved(event) {
        if (this.isDebugActive())
            console.info('Received updated content from the Episerver Shell', event);
        if (event.successful) {
            const baseId = event.savedContentLink.split('_')[0];
            const baseContent = this.getContentById(baseId);
            if (baseContent) {
                event.properties.forEach((prop) => {
                    if (prop.successful) {
                        this.dispatch(IContent_1.IContentActionFactory.updateContentProperty(baseContent, prop.name, prop.value));
                    }
                });
            }
        }
    }
    /**
     * Handler for the postdata message sent by the Epishell to indicate that the environment is now ready
     * and the edit mode can be detected.
     */
    onEpiReady() {
        if (this.isDebugActive())
            console.info('Episerver Ready, setting edit mode to', this.isInEditMode() ? 'true' : 'false');
        this.contentDeliveryApi().setInEditMode(this.isInEditMode());
    }
    isInitialized() {
        return this._initialized === InitStatus.Initialized;
    }
    isDebugActive() {
        var _a;
        this.enforceInitialized();
        return ((_a = this.config()) === null || _a === void 0 ? void 0 : _a.enableDebug) || false;
    }
    isServerSideRendering() {
        if (this._isServerSideRendering == null) {
            try {
                this._isServerSideRendering = ctx.epi.isServerSideRendering === true;
            }
            catch (e) {
                return false;
            }
        }
        return this._isServerSideRendering;
    }
    enforceInitialized() {
        if (!this._initialized) {
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
        return this._serviceContainer.getService(IServiceContainer_1.DefaultServices.EventEngine);
    }
    config() {
        this.enforceInitialized();
        return this._serviceContainer.getService(IServiceContainer_1.DefaultServices.Config);
    }
    componentLoader() {
        return this._serviceContainer.getService(IServiceContainer_1.DefaultServices.ComponentLoader);
    }
    contentDeliveryApi() {
        this.enforceInitialized();
        return this._serviceContainer.getService(IServiceContainer_1.DefaultServices.ContentDeliveryApi);
    }
    getContentByGuid(guid) {
        if (this._state.getState().iContentRepo.guids[guid]) {
            const id = this._state.getState().iContentRepo.guids[guid];
            return this.getContentById(id);
        }
        return null;
    }
    loadContentByGuid(id) {
        const c = this.getContentByGuid(id);
        if (c) {
            return Promise.resolve(c);
        }
        return this.invoke(IContent_1.default.getById(id));
    }
    getContentById(id) {
        if (this._state.getState().iContentRepo.items && this._state.getState().iContentRepo.items[id]) {
            return this._state.getState().iContentRepo.items[id].content;
        }
        return null;
    }
    loadContentById(id) {
        const c = this.getContentById(id);
        if (c) {
            return Promise.resolve(c);
        }
        return this.invoke(IContent_1.default.getById(id));
    }
    getContentByRef(ref) {
        if (this._state.getState().iContentRepo.refs[ref]) {
            const id = this._state.getState().iContentRepo.refs[ref];
            return this.getContentById(id);
        }
        return null;
    }
    loadContentByRef(ref) {
        const item = this.getContentByRef(ref);
        if (item)
            return Promise.resolve(item);
        return this.invoke(IContent_1.default.getByReference(ref));
    }
    getContentByPath(path) {
        if (this._state.getState().iContentRepo.paths[path]) {
            const id = this._state.getState().iContentRepo.paths[path];
            return this.getContentById(id);
        }
        return null;
    }
    loadContentByPath(path) {
        const c = this.getContentByPath(path);
        if (c) {
            return Promise.resolve(c);
        }
        return this.invoke(IContent_1.default.getByPath(path));
    }
    injectContent(iContent) {
        this.dispatch(IContent_1.IContentActionFactory.addOrUpdateItem(iContent));
    }
    /**
     * Check whether or not we're in edit mode by looking at the URL. This
     * yields the correct result prior to the onEpiReady event has fired
     *
     * @return {boolean}
     */
    initialEditMode() {
        var _a;
        try {
            const testA = ((_a = (new URLSearchParams(window.location.search)).get('epieditmode')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true';
            const testB = this.isInEditMode();
            return testA || testB;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Determine the edit mode by following a sequence of steps, from most
     * reliable to most unreliable.
     *
     * @returns {boolean}
     */
    isInEditMode() {
        var _a;
        try {
            return ctx.epi && ctx.epi.inEditMode !== undefined ? ctx.epi.inEditMode === true : false;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            return ctx.epi && ctx.epi.beta && ctx.epi.beta.inEditMode !== undefined ? ctx.epi.beta.inEditMode === true : false;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            return ((_a = (new URLSearchParams(window.location.search)).get('epieditmode')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true';
        }
        catch (e) {
            // Ignore error on purpose to go to next test
        }
        return false;
    }
    isEditable() {
        try {
            return ctx.epi ? ctx.epi.isEditable === true : false;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test;
        }
        try {
            return ctx.epi && ctx.epi.beta ? ctx.epi.beta.isEditable === true : false;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test
        }
        return false;
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
        return StringUtils_1.default.TrimRight('/', ((_a = this.config()) === null || _a === void 0 ? void 0 : _a.epiBaseUrl) + itemPath);
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
    navigateTo(path, noHistory = false) {
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
        var _a;
        return (_a = this._state.getState().iContentRepo) === null || _a === void 0 ? void 0 : _a.website;
    }
    loadCurrentWebsite() {
        const website = this.getCurrentWebsite();
        if (website) {
            return Promise.resolve(website);
        }
        return this.invoke(IContent_1.default.getCurrentWebsite());
    }
    getCurrentPath() {
        const state = this._state.getState();
        return state.ViewContext.currentPath;
    }
    getRoutedContent() {
        if (this.isServerSideRendering()) {
            return ErrorPage_1.default.Error404;
        }
        const c = this.getContentByPath(this.getCurrentPath());
        if (!c) {
            throw new Error("There's no currently routed content");
        }
        return c;
    }
    getContentByContentRef(ref) {
        const id = ContentLink_1.ContentLinkService.createApiId(ref);
        return id ? this.getContentById(id) : null;
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
exports.default = ctx.EpiserverSpa.Context;
