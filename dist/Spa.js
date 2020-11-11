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
exports.EpiserverSpaContext = exports.InitStatus = void 0;
// Redux & Redux setup
const toolkit_1 = require("@reduxjs/toolkit");
// Lodash
const lodash_1 = require("lodash");
const IServiceContainer_1 = require("./Core/IServiceContainer");
const ContentDeliveryAPI_1 = __importDefault(require("./ContentDeliveryAPI"));
const DefaultEventEngine_1 = __importDefault(require("./Core/DefaultEventEngine"));
const ContentLink_1 = require("./Models/ContentLink");
const ComponentLoader_1 = __importStar(require("./Loaders/ComponentLoader"));
const AppGlobal_1 = __importDefault(require("./AppGlobal"));
const RoutingModule_1 = __importDefault(require("./Routing/RoutingModule"));
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
        config.enableDebug = process.env.NODE_ENV === 'production' ? false : config.enableDebug;
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
        if (config.componentLoaders) {
            config.componentLoaders.forEach(loader => {
                var _a, _b;
                if (ComponentLoader_1.isIComponentLoader(loader)) {
                    loader.setDebug(((_a = config.componentLoaders) === null || _a === void 0 ? void 0 : _a.debug) || config.enableDebug || false);
                    cl.addLoader(loader);
                }
                else {
                    const loaderInstance = cl.createLoader(loader, true);
                    loaderInstance.setDebug(((_b = config.componentLoaders) === null || _b === void 0 ? void 0 : _b.debug) || config.enableDebug || false);
                }
            });
        }
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
        newAPI.InEditMode = this.initialEditMode();
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.ContentDeliveryAPI_V2, newAPI);
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.IContentRepository_V2, new IContentRepository_1.default(newAPI, { debug: config.enableDebug }));
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
        this._modules.forEach(x => { const ri = x.GetStateReducer(); if (ri) {
            reducers[ri.stateKey] = ri.reducer;
        } });
        this._state = toolkit_1.configureStore({ reducer: reducers });
        this._state.dispatch({ type: '@@EPI/INIT' });
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
            console.info('EpiContentSaved: Received updated content from the Episerver Shell', event);
        if (event.successful) {
            const repo = this.serviceContainer.getService(IServiceContainer_1.DefaultServices.IContentRepository_V2);
            const baseId = event.savedContentLink;
            const isStringProperty = (toTest, propName) => {
                try {
                    return toTest[propName] && typeof toTest[propName] === 'string';
                }
                catch (e) { /* Empty on purpose */ }
                return false;
            };
            repo.patch(baseId, (item) => {
                const out = lodash_1.clone(item);
                event.properties.forEach(property => {
                    if (property.successful) {
                        const propertyData = {};
                        if (property.name.substr(0, 9) === 'icontent_') {
                            switch (property.name.substr(9)) {
                                case 'name':
                                    if (this.isDebugActive())
                                        console.info('EpiContentSaved: Received updated name');
                                    propertyData.name = isStringProperty(out, 'name') ? property.value : { expandedValue: undefined, value: property.value };
                                    break;
                                default:
                                    if (this.isDebugActive())
                                        console.warn('EpiContentSaved: Received unsupported property ', property);
                                    break;
                            }
                        }
                        else {
                            if (this.isDebugActive())
                                console.info(`EpiContentSaved: Received updated ${property.name}`);
                            propertyData[property.name] = {
                                expandedValue: undefined,
                                value: property.value
                            };
                        }
                        lodash_1.merge(out, propertyData);
                    }
                });
                if (this.isDebugActive())
                    console.info('EpiContentSaved: Patched iContent', out);
                return out;
            });
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
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByGuid(id) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService(IServiceContainer_1.DefaultServices.IContentRepository_V2);
        return repo.load(id).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentById(id) {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentById(id) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService(IServiceContainer_1.DefaultServices.IContentRepository_V2);
        return repo.load(id).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentByRef(ref) {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByRef(ref) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService(IServiceContainer_1.DefaultServices.IContentRepository_V2);
        return repo.getByReference(ref).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentByPath(path) {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByPath(path) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService(IServiceContainer_1.DefaultServices.IContentRepository_V2);
        return repo.getByRoute(path).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    injectContent(iContent) {
        // Ignore on purpose, will be removed
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
            return (((_a = (new URLSearchParams(window.location.search)).get('epieditmode')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true') || this.isInEditMode();
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
        const website = this.serviceContainer.getService(IServiceContainer_1.DefaultServices.ContentDeliveryAPI_V2).CurrentWebsite;
        if (!website)
            throw new Error('The Current website has not been set');
        return website;
    }
    loadCurrentWebsite() {
        return __awaiter(this, void 0, void 0, function* () {
            let domain = '';
            const repo = this.serviceContainer.getService(IServiceContainer_1.DefaultServices.IContentRepository_V2);
            try {
                domain = window.location.hostname;
            }
            catch (e) {
                // Ignored on purpose
            }
            ;
            const website = yield repo.getWebsite(domain);
            if (!website)
                throw new Error('Current website not loadable');
            this.serviceContainer.getService(IServiceContainer_1.DefaultServices.ContentDeliveryAPI_V2).CurrentWebsite = website;
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
