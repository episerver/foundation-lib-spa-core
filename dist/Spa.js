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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpiserverSpaContext = exports.InitStatus = void 0;
// Redux & Redux setup
var toolkit_1 = require("@reduxjs/toolkit");
var AbstractRepostory_1 = require("./Repository/AbstractRepostory");
var IContent_1 = __importStar(require("./Repository/IContent"));
var ViewContext_1 = __importDefault(require("./Repository/ViewContext"));
var IServiceContainer_1 = require("./Core/IServiceContainer");
var ContentDeliveryAPI_1 = __importDefault(require("./ContentDeliveryAPI"));
var DefaultEventEngine_1 = __importDefault(require("./Core/DefaultEventEngine"));
var ContentLink_1 = require("./Models/ContentLink");
var ComponentLoader_1 = __importDefault(require("./Loaders/ComponentLoader"));
var AppGlobal_1 = __importDefault(require("./AppGlobal"));
var RoutingModule_1 = __importDefault(require("./Routing/RoutingModule"));
var ErrorPage_1 = __importDefault(require("./Models/ErrorPage"));
var StringUtils_1 = __importDefault(require("./Util/StringUtils"));
// Create context
var ctx = AppGlobal_1.default();
ctx.EpiserverSpa = ctx.EpiserverSpa || {};
ctx.epi = ctx.epi || {};
var InitStatus;
(function (InitStatus) {
    InitStatus[InitStatus["NotInitialized"] = 0] = "NotInitialized";
    InitStatus[InitStatus["Initializing"] = 1] = "Initializing";
    InitStatus[InitStatus["Initialized"] = 2] = "Initialized";
})(InitStatus = exports.InitStatus || (exports.InitStatus = {}));
var EpiserverSpaContext = /** @class */ (function () {
    function EpiserverSpaContext() {
        this._initialized = InitStatus.NotInitialized;
        this._modules = [];
    }
    Object.defineProperty(EpiserverSpaContext.prototype, "serviceContainer", {
        get: function () {
            return this._serviceContainer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EpiserverSpaContext.prototype, "contentStorage", {
        get: function () {
            return this.serviceContainer.getService(IServiceContainer_1.DefaultServices.ContentDeliveryApi);
        },
        enumerable: false,
        configurable: true
    });
    EpiserverSpaContext.prototype.init = function (config, serviceContainer, isServerSideRendering) {
        var _this = this;
        if (isServerSideRendering === void 0) { isServerSideRendering = false; }
        // Generic init
        this._initialized = InitStatus.Initializing;
        this._isServerSideRendering = isServerSideRendering;
        this._serviceContainer = serviceContainer;
        var executionContext = {
            isServerSideRendering: isServerSideRendering
        };
        //Create module list
        this._modules.push(new RoutingModule_1.default());
        if (config.modules) {
            this._modules = this._modules.concat(config.modules);
        }
        if (this.isDebugActive())
            console.debug('Spa modules:', this._modules.map(function (m) { return m.GetName(); }));
        // Register core services
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.Context, this);
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.Config, config);
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.ExecutionContext, executionContext);
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.ContentDeliveryApi, new ContentDeliveryAPI_1.default(this, config));
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.EventEngine, new DefaultEventEngine_1.default());
        this._serviceContainer.addService(IServiceContainer_1.DefaultServices.ComponentLoader, new ComponentLoader_1.default());
        // Have modules add services of their own
        this._modules.forEach(function (x) { return x.ConfigureContainer(_this._serviceContainer); });
        // Redux init
        this._initRedux();
        // EpiEditMode init
        this._initEditMode();
        // Run module startup logic
        this._modules.forEach(function (x) { return x.StartModule(_this); });
        this._initialized = InitStatus.Initialized;
    };
    EpiserverSpaContext.prototype._initRedux = function () {
        var reducers = {};
        IContent_1.default.ContentDeliveryAPI = this.contentDeliveryApi();
        reducers[IContent_1.default.StateKey] = IContent_1.default.reducer.bind(IContent_1.default);
        reducers[ViewContext_1.default.StateKey] = ViewContext_1.default.reducer.bind(ViewContext_1.default);
        this._modules.forEach(function (x) { var ri = x.GetStateReducer(); if (ri) {
            reducers[ri.stateKey] = ri.reducer;
        } });
        this._state = toolkit_1.configureStore({ reducer: reducers });
        var initAction = { type: AbstractRepostory_1.RepositoryActions.INIT };
        this._state.dispatch(initAction);
    };
    EpiserverSpaContext.prototype._initEditMode = function () {
        if (this.isDebugActive())
            console.debug("Initializing edit mode in " + (this.initialEditMode() ? 'enabled' : 'disabled') + " state");
        if (!this._isServerSideRendering && this.initialEditMode()) {
            if (this.isDebugActive())
                console.debug('Adding edit mode event handlers');
            this.contentDeliveryApi().setInEditMode(true);
            this.events().addListener('beta/epiReady', 'BetaEpiReady', this.onEpiReady.bind(this), true);
            this.events().addListener('beta/contentSaved', 'BetaEpiContentSaved', this.onEpiContentSaved.bind(this), true);
            this.events().addListener('epiReady', 'EpiReady', this.onEpiReady.bind(this), true);
            this.events().addListener('contentSaved', 'EpiContentSaved', this.onEpiContentSaved.bind(this), true);
        }
    };
    EpiserverSpaContext.prototype.onEpiContentSaved = function (event) {
        var _this = this;
        if (this.isDebugActive())
            console.info('Received updated content from the Episerver Shell', event);
        if (event.successful) {
            var baseId = event.savedContentLink.split('_')[0];
            var baseContent_1 = this.getContentById(baseId);
            if (baseContent_1) {
                event.properties.forEach(function (prop) {
                    if (prop.successful) {
                        _this.dispatch(IContent_1.IContentActionFactory.updateContentProperty(baseContent_1, prop.name, prop.value));
                    }
                });
            }
        }
    };
    /**
     * Handler for the postdata message sent by the Epishell to indicate that the environment is now ready
     * and the edit mode can be detected.
     */
    EpiserverSpaContext.prototype.onEpiReady = function () {
        if (this.isDebugActive())
            console.info('Episerver Ready, setting edit mode to', this.isInEditMode() ? 'true' : 'false');
        this.contentDeliveryApi().setInEditMode(this.isInEditMode());
    };
    EpiserverSpaContext.prototype.isInitialized = function () {
        return this._initialized === InitStatus.Initialized;
    };
    EpiserverSpaContext.prototype.isDebugActive = function () {
        var _a;
        this.enforceInitialized();
        return ((_a = this.config()) === null || _a === void 0 ? void 0 : _a.enableDebug) || false;
    };
    EpiserverSpaContext.prototype.isServerSideRendering = function () {
        if (this._isServerSideRendering == null) {
            try {
                this._isServerSideRendering = ctx.epi.isServerSideRendering === true;
            }
            catch (e) {
                return false;
            }
        }
        return this._isServerSideRendering;
    };
    EpiserverSpaContext.prototype.enforceInitialized = function () {
        if (!this._initialized) {
            throw new Error('The Episerver SPA Context has not yet been initialized');
        }
    };
    EpiserverSpaContext.prototype.dispatch = function (action) {
        this.enforceInitialized();
        return this._state.dispatch(action);
    };
    EpiserverSpaContext.prototype.invoke = function (action) {
        this.enforceInitialized();
        return this._state.dispatch(action);
    };
    EpiserverSpaContext.prototype.getStore = function () {
        this.enforceInitialized();
        return this._state;
    };
    EpiserverSpaContext.prototype.events = function () {
        return this._serviceContainer.getService(IServiceContainer_1.DefaultServices.EventEngine);
    };
    EpiserverSpaContext.prototype.config = function () {
        this.enforceInitialized();
        return this._serviceContainer.getService(IServiceContainer_1.DefaultServices.Config);
    };
    EpiserverSpaContext.prototype.componentLoader = function () {
        return this._serviceContainer.getService(IServiceContainer_1.DefaultServices.ComponentLoader);
    };
    EpiserverSpaContext.prototype.contentDeliveryApi = function () {
        this.enforceInitialized();
        return this._serviceContainer.getService(IServiceContainer_1.DefaultServices.ContentDeliveryApi);
    };
    EpiserverSpaContext.prototype.getContentByGuid = function (guid) {
        if (this._state.getState().iContentRepo.guids[guid]) {
            var id = this._state.getState().iContentRepo.guids[guid];
            return this.getContentById(id);
        }
        return null;
    };
    EpiserverSpaContext.prototype.loadContentByGuid = function (id) {
        var c = this.getContentByGuid(id);
        if (c) {
            return Promise.resolve(c);
        }
        return this.invoke(IContent_1.default.getById(id));
    };
    EpiserverSpaContext.prototype.getContentById = function (id) {
        if (this._state.getState().iContentRepo.items && this._state.getState().iContentRepo.items[id]) {
            return this._state.getState().iContentRepo.items[id].content;
        }
        return null;
    };
    EpiserverSpaContext.prototype.loadContentById = function (id) {
        var c = this.getContentById(id);
        if (c) {
            return Promise.resolve(c);
        }
        return this.invoke(IContent_1.default.getById(id));
    };
    EpiserverSpaContext.prototype.getContentByRef = function (ref) {
        if (this._state.getState().iContentRepo.refs[ref]) {
            var id = this._state.getState().iContentRepo.refs[ref];
            return this.getContentById(id);
        }
        return null;
    };
    EpiserverSpaContext.prototype.loadContentByRef = function (ref) {
        var item = this.getContentByRef(ref);
        if (item)
            return Promise.resolve(item);
        return this.invoke(IContent_1.default.getByReference(ref));
    };
    EpiserverSpaContext.prototype.getContentByPath = function (path) {
        if (this._state.getState().iContentRepo.paths[path]) {
            var id = this._state.getState().iContentRepo.paths[path];
            return this.getContentById(id);
        }
        return null;
    };
    EpiserverSpaContext.prototype.loadContentByPath = function (path) {
        var c = this.getContentByPath(path);
        if (c) {
            return Promise.resolve(c);
        }
        return this.invoke(IContent_1.default.getByPath(path));
    };
    EpiserverSpaContext.prototype.injectContent = function (iContent) {
        this.dispatch(IContent_1.IContentActionFactory.addOrUpdateItem(iContent));
    };
    /**
     * Check whether or not we're in edit mode by looking at the URL. This
     * yields the correct result prior to the onEpiReady event has fired
     *
     * @return {boolean}
     */
    EpiserverSpaContext.prototype.initialEditMode = function () {
        var _a;
        try {
            var testA = ((_a = (new URLSearchParams(window.location.search)).get('epieditmode')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true';
            var testB = this.isInEditMode();
            return testA || testB;
        }
        catch (e) {
            return false;
        }
    };
    /**
     * Determine the edit mode by following a sequence of steps, from most
     * reliable to most unreliable.
     *
     * @returns {boolean}
     */
    EpiserverSpaContext.prototype.isInEditMode = function () {
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
    };
    EpiserverSpaContext.prototype.isEditable = function () {
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
    };
    EpiserverSpaContext.prototype.getEpiserverUrl = function (path, action) {
        var _a;
        if (path === void 0) { path = ''; }
        var itemPath = '';
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
    };
    EpiserverSpaContext.prototype.getSpaRoute = function (path) {
        var newPath = '';
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
    };
    /**
     *
     * @param content   The content item load, by path, content link or IContent
     * @param action    The action to invoke on the content controller
     */
    EpiserverSpaContext.prototype.buildPath = function (content, action) {
        if (action === void 0) { action = ""; }
        var newPath = '';
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
    };
    EpiserverSpaContext.prototype.navigateTo = function (path, noHistory) {
        if (noHistory === void 0) { noHistory = false; }
        var newPath = '';
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
    };
    EpiserverSpaContext.prototype.getCurrentWebsite = function () {
        var _a;
        return (_a = this._state.getState().iContentRepo) === null || _a === void 0 ? void 0 : _a.website;
    };
    EpiserverSpaContext.prototype.loadCurrentWebsite = function () {
        var website = this.getCurrentWebsite();
        if (website) {
            return Promise.resolve(website);
        }
        return this.invoke(IContent_1.default.getCurrentWebsite());
    };
    EpiserverSpaContext.prototype.getCurrentPath = function () {
        var state = this._state.getState();
        return state.ViewContext.currentPath;
    };
    EpiserverSpaContext.prototype.getRoutedContent = function () {
        if (this.isServerSideRendering()) {
            return ErrorPage_1.default.Error404;
        }
        var c = this.getContentByPath(this.getCurrentPath());
        if (!c) {
            throw new Error("There's no currently routed content");
        }
        return c;
    };
    EpiserverSpaContext.prototype.getContentByContentRef = function (ref) {
        var id = ContentLink_1.ContentLinkService.createApiId(ref);
        return id ? this.getContentById(id) : null;
    };
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
    EpiserverSpaContext.prototype.getSpaBasePath = function () {
        var _a;
        if (typeof this._sanitizedSpaBasePath === 'string') {
            return this._sanitizedSpaBasePath;
        }
        var configBasePath = ((_a = this.config()) === null || _a === void 0 ? void 0 : _a.basePath) || '';
        if (configBasePath.length > 0) {
            configBasePath = StringUtils_1.default.TrimRight('/', StringUtils_1.default.TrimLeft('/', configBasePath));
            configBasePath = configBasePath.length > 0 ? '/' + configBasePath : '';
        }
        this._sanitizedSpaBasePath = configBasePath;
        return this._sanitizedSpaBasePath;
    };
    /**
     * Get the domain where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns: https://example.com
     */
    EpiserverSpaContext.prototype.getSpaDomain = function () {
        return window.location.protocol + '//' + window.location.hostname;
    };
    /**
     * Get the location where Episerver is running, whithout a trailing slash.
     */
    EpiserverSpaContext.prototype.getEpiserverURL = function () {
        return this.getEpiserverUrl();
    };
    return EpiserverSpaContext;
}());
exports.EpiserverSpaContext = EpiserverSpaContext;
ctx.EpiserverSpa.Context = ctx.EpiserverSpa.Context || new EpiserverSpaContext();
exports.default = ctx.EpiserverSpa.Context;
