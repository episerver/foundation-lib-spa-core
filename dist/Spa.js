var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Redux & Redux setup
import { configureStore } from '@reduxjs/toolkit';
// Lodash
import merge from 'lodash/merge';
import clone from 'lodash/clone';
import { DefaultServices } from './Core/IServiceContainer';
import DefaultEventEngine from './Core/DefaultEventEngine';
import { ContentLinkService } from './Models/ContentLink';
import getGlobal from './AppGlobal';
import ServerContextAccessor from './ServerSideRendering/ServerContextAccessor';
// Core Modules
import RoutingModule from './Routing/RoutingModule';
import RepositoryModule from './Repository/RepositoryModule';
import LoadersModule from './Loaders/LoadersModule';
import StringUtils from './Util/StringUtils';
// Create context
const ctx = getGlobal();
ctx.EpiserverSpa = ctx.EpiserverSpa || {};
ctx.epi = ctx.epi || {};
export var InitStatus;
(function (InitStatus) {
    InitStatus[InitStatus["NotInitialized"] = 0] = "NotInitialized";
    InitStatus[InitStatus["Initializing"] = 1] = "Initializing";
    InitStatus[InitStatus["Initialized"] = 2] = "Initialized";
})(InitStatus || (InitStatus = {}));
export class EpiserverSpaContext {
    constructor() {
        this._initialized = InitStatus.NotInitialized;
        this._modules = [];
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
        return this.serviceContainer.getService(DefaultServices.ContentDeliveryApi);
    }
    init(config, serviceContainer, isServerSideRendering = false) {
        // Generic init
        this._initialized = InitStatus.Initializing;
        this._isServerSideRendering = isServerSideRendering;
        this._serviceContainer = serviceContainer;
        const executionContext = { isServerSideRendering };
        config.enableDebug = process.env.NODE_ENV === 'production' ? false : config.enableDebug;
        // Create module list
        this._modules.push(new RepositoryModule(), new RoutingModule(), new LoadersModule());
        this._modules.sort((a, b) => a.SortOrder - b.SortOrder);
        if (config.modules)
            this._modules = this._modules.concat(config.modules);
        if (config.enableDebug)
            console.debug('Spa modules:', this._modules.map((m) => m.GetName()));
        // Register core services
        this._serviceContainer.addService(DefaultServices.Context, this);
        this._serviceContainer.addService(DefaultServices.Config, config);
        this._serviceContainer.addService(DefaultServices.ExecutionContext, executionContext);
        this._serviceContainer.addService(DefaultServices.ServerContext, new ServerContextAccessor());
        this._serviceContainer.addService(DefaultServices.EventEngine, new DefaultEventEngine());
        // Have modules add services of their own
        this._modules.forEach(x => x.ConfigureContainer(this._serviceContainer));
        // Redux init
        this._initRedux();
        // EpiEditMode init
        this._initEditMode();
        // Run module startup logic
        this._modules.forEach(x => x.StartModule(this));
        // Mark SPA as initialized & and make some info available in the global context
        this._initialized = InitStatus.Initialized;
        ctx.EpiserverSpa.serviceContainer = this._serviceContainer;
        ctx.EpiserverSpa.modules = this._modules;
    }
    _initRedux() {
        const reducers = {};
        this._modules.forEach(x => { const ri = x.GetStateReducer(); if (ri) {
            reducers[ri.stateKey] = ri.reducer;
        } });
        this._state = configureStore({ reducer: reducers });
        this._state.dispatch({ type: '@@EPI/INIT' });
    }
    _initEditMode() {
        if (this.isDebugActive())
            console.debug(`Initializing edit mode in ${this.initialEditMode() ? 'enabled' : 'disabled'} state`);
        if (!this._isServerSideRendering && this.initialEditMode()) {
            // if (this.isDebugActive()) console.debug('Adding edit mode event handlers');
            // this.contentDeliveryApi().setInEditMode(true);
            this.serviceContainer.getService(DefaultServices.ContentDeliveryAPI_V2).InEditMode = true;
            // this.events().addListener('beta/epiReady', 'BetaEpiReady', this.onEpiReady.bind(this), true);
            this.events().addListener('beta/contentSaved', 'BetaEpiContentSaved', this.onEpiContentSaved.bind(this), true);
            // this.events().addListener('epiReady', 'EpiReady', this.onEpiReady.bind(this), true);
            this.events().addListener('contentSaved', 'EpiContentSaved', this.onEpiContentSaved.bind(this), true);
        }
    }
    onEpiContentSaved(event) {
        if (this.isDebugActive())
            console.info('EpiContentSaved: Received updated content from the Episerver Shell', event);
        if (event.successful) {
            const repo = this.serviceContainer.getService(DefaultServices.IContentRepository_V2);
            const baseId = event.savedContentLink;
            const isStringProperty = (toTest, propName) => {
                try {
                    return toTest[propName] && typeof toTest[propName] === 'string';
                }
                catch (e) { /* Empty on purpose */ }
                return false;
            };
            repo.patch(baseId, (item) => {
                const out = clone(item);
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
                        merge(out, propertyData);
                    }
                });
                if (this.isDebugActive())
                    console.info('EpiContentSaved: Patched iContent', out);
                return out;
            });
        }
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
        return this._serviceContainer.getService(DefaultServices.EventEngine);
    }
    config() {
        this.enforceInitialized();
        return this._serviceContainer.getService(DefaultServices.Config);
    }
    componentLoader() {
        return this._serviceContainer.getService(DefaultServices.ComponentLoader);
    }
    contentDeliveryApi() {
        this.enforceInitialized();
        return this._serviceContainer.getService(DefaultServices.ContentDeliveryApi);
    }
    getContentByGuid(guid) {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByGuid(id) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService(DefaultServices.IContentRepository_V2);
        return repo.load(id).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentById(id) {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentById(id) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService(DefaultServices.IContentRepository_V2);
        return repo.load(id).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentByRef(ref) {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByRef(ref) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService(DefaultServices.IContentRepository_V2);
        return repo.getByReference(ref).then(iContent => { if (!iContent)
            throw new Error('Content not resolved!'); return iContent; });
    }
    getContentByPath(path) {
        throw new Error('Synchronous content loading is no longer supported');
    }
    loadContentByPath(path) {
        this.enforceInitialized();
        const repo = this._serviceContainer.getService(DefaultServices.IContentRepository_V2);
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
        var _a, _b;
        try {
            const mySearchParams = new URLSearchParams(window.location.search);
            if (((_a = mySearchParams.get('commondrafts')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true')
                return false;
            if (((_b = mySearchParams.get('epieditmode')) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'true')
                return true;
            return this.isInEditMode();
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
        var _a, _b;
        try {
            const mySearchParams = new URLSearchParams(window.location.search);
            if (((_a = mySearchParams.get('commondrafts')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true')
                return false;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test
        }
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
            return ((_b = (new URLSearchParams(window.location.search)).get('epieditmode')) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'true';
        }
        catch (e) {
            // Ignore error on purpose to go to next test
        }
        return false;
    }
    isEditable() {
        var _a;
        try {
            const mySearchParams = new URLSearchParams(window.location.search);
            if (((_a = mySearchParams.get('commondrafts')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true')
                return false;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test
        }
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
        if (ContentLinkService.referenceIsString(path)) {
            itemPath = path;
        }
        else if (ContentLinkService.referenceIsContentLink(path)) {
            itemPath = path.url;
        }
        else if (ContentLinkService.referenceIsIContent(path)) {
            itemPath = path.contentLink.url;
        }
        if (action) {
            itemPath += itemPath.length ? '/' + action : action;
        }
        return StringUtils.TrimRight('/', ((_a = this.config()) === null || _a === void 0 ? void 0 : _a.epiBaseUrl) + itemPath);
    }
    getSpaRoute(path) {
        let newPath = '';
        if (ContentLinkService.referenceIsString(path)) {
            newPath = path;
        }
        else if (ContentLinkService.referenceIsIContent(path)) {
            newPath = path.contentLink.url;
        }
        else if (ContentLinkService.referenceIsContentLink(path)) {
            newPath = path.url;
        }
        return '/' + StringUtils.TrimLeft('/', this.config().basePath + newPath);
    }
    /**
     *
     * @param content   The content item load, by path, content link or IContent
     * @param action    The action to invoke on the content controller
     */
    buildPath(content, action = "") {
        let newPath = '';
        if (ContentLinkService.referenceIsString(content)) {
            newPath = content;
        }
        else if (ContentLinkService.referenceIsIContent(content)) {
            newPath = content.contentLink.url;
        }
        else if (ContentLinkService.referenceIsContentLink(content)) {
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
        if (ContentLinkService.referenceIsString(path)) {
            newPath = path;
        }
        else if (ContentLinkService.referenceIsIContent(path)) {
            newPath = path.contentLink.url;
        }
        else if (ContentLinkService.referenceIsContentLink(path)) {
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
        const website = this.serviceContainer.getService(DefaultServices.ContentDeliveryAPI_V2).CurrentWebsite;
        if (!website)
            throw new Error('The Current website has not been set');
        return website;
    }
    loadCurrentWebsite() {
        return __awaiter(this, void 0, void 0, function* () {
            let domain = '';
            const repo = this.serviceContainer.getService(DefaultServices.IContentRepository_V2);
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
            this.serviceContainer.getService(DefaultServices.ContentDeliveryAPI_V2).CurrentWebsite = website;
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
        const id = ContentLinkService.createApiId(ref);
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
            configBasePath = StringUtils.TrimRight('/', StringUtils.TrimLeft('/', configBasePath));
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
ctx.EpiserverSpa.Context = ctx.EpiserverSpa.Context || new EpiserverSpaContext();
export default ctx.EpiserverSpa.Context;
