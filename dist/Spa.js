// Redux & Redux setup
import { configureStore } from '@reduxjs/toolkit';
import DefaultEventEngine from './Core/DefaultEventEngine';
import { ContentLinkService } from './Models/ContentLink';
import getGlobal from './AppGlobal';
import { Factory as ServerContextFactory } from './ServerSideRendering/IServerContextAccessor';
// Core Modules
import RoutingModule from './Routing/RoutingModule';
import RepositoryModule from './Repository/RepositoryModule';
import LoadersModule from './Loaders/LoadersModule';
import StateModule from './State/StateModule';
import StringUtils from './Util/StringUtils';
// Create context
const ctx = getGlobal();
ctx.EpiserverSpa = ctx.EpiserverSpa || {};
ctx.epi = ctx.epi || {};
export class EpiserverSpaContext {
    constructor() {
        this._cachedEditModeUrl = undefined;
        this._initialized = 0 /* NotInitialized */;
        this._modules = [];
    }
    get serviceContainer() {
        return this._serviceContainer;
    }
    get Language() {
        return this.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */)?.Language ||
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
        // Warn for production built with debug active
        if (process.env.NODE_ENV === 'production' && executionContext.isDebugActive)
            console.warn('Running Episerver SPA with a production build and debug enabled');
        // Create module list
        if (config.enableDebug)
            console.time('Creating modules');
        this._modules.push(new RepositoryModule(), new RoutingModule(), new LoadersModule(), new StateModule());
        if (config.modules)
            this._modules = this._modules.concat(config.modules);
        this._modules.sort((a, b) => a.SortOrder - b.SortOrder);
        if (config.enableDebug) {
            console.debug(`Episerver SPA modules: ${this._modules.map((m) => `${m.GetName()} (${m.SortOrder})`).join(', ')}`);
            console.timeEnd('Creating modules');
        }
        // Register core services
        if (config.enableDebug)
            console.time('Adding default services');
        if (!this._serviceContainer.hasService("Context" /* Context */))
            this._serviceContainer.addService("Context" /* Context */, this);
        if (!this._serviceContainer.hasService("Config" /* Config */))
            this._serviceContainer.addService("Config" /* Config */, config);
        if (!this._serviceContainer.hasService("ExecutionContext" /* ExecutionContext */))
            this._serviceContainer.addService("ExecutionContext" /* ExecutionContext */, executionContext);
        if (!this._serviceContainer.hasService("ServerContext" /* ServerContext */))
            this._serviceContainer.addFactory("ServerContext" /* ServerContext */, (container) => ServerContextFactory.create(container.getService("ExecutionContext" /* ExecutionContext */), container.getService("Config" /* Config */)));
        if (!this._serviceContainer.hasService("EventEngine" /* EventEngine */))
            this._serviceContainer.addFactory("EventEngine" /* EventEngine */, (container) => {
                const engine = new DefaultEventEngine();
                engine.debug = container.getService("ExecutionContext" /* ExecutionContext */).isDebugActive;
                return engine;
            });
        if (config.enableDebug)
            console.timeEnd('Adding default services');
        this._initialized = 2 /* CoreServicesReady */;
        // Have modules add services of their own
        if (config.enableDebug)
            console.time('Module container configuration');
        this._modules.forEach(x => {
            if (config.enableDebug)
                console.time('Module container configuration: ' + x.GetName());
            x.ConfigureContainer(this._serviceContainer);
            if (config.enableDebug)
                console.timeEnd('Module container configuration: ' + x.GetName());
        });
        if (config.enableDebug)
            console.timeEnd('Module container configuration');
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
        }
        if (config.enableDebug)
            console.timeEnd("SPA Initialization");
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
    getStore() {
        this.enforceInitialized();
        return this._state;
    }
    events() {
        this.enforceInitialized();
        return this._serviceContainer.getService("EventEngine" /* EventEngine */);
    }
    config() {
        this.enforceInitialized();
        return this._serviceContainer.getService("Config" /* Config */);
    }
    componentLoader() {
        this.enforceInitialized();
        return this._serviceContainer.getService("ComponentLoader" /* ComponentLoader */);
    }
    /**
     * Check whether or not we're in edit mode by looking at the URL. This
     * yields the correct result prior to the onEpiReady event has fired
     *
     * @return {boolean}
     */
    initialEditMode() {
        try {
            if (typeof (ctx?.epi?.inEditMode) === 'boolean' && ctx.epi.inEditMode)
                return true;
        }
        catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            if (typeof (ctx?.epi?.beta?.inEditMode) === 'boolean' && ctx.epi.beta.inEditMode)
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
            return window !== window?.top && window?.name === 'sitePreview';
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
        const itemPath = this.buildPath(path, action);
        return new URL(itemPath, this.config()?.epiBaseUrl);
    }
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
                console.debug('The navigation target does not include a path.', content);
            newPath = '/';
        }
        if (action) {
            newPath = "/" + StringUtils.TrimLeft("/", StringUtils.TrimRight("/", newPath) + "/" + action);
        }
        return newPath;
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
        return this.spaBaseUrl.pathname;
    }
    /**
     * Get the domain where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns: https://example.com
     */
    getSpaDomain() {
        return `${this.spaBaseUrl.protocol}//${this.spaBaseUrl.host}`;
    }
    get spaBaseUrl() {
        if (!this._spaBaseUrl) {
            this._spaBaseUrl = new URL(this.config()?.basePath || '', this.config()?.spaBaseUrl ||
                this.config()?.epiBaseUrl ||
                window.location.protocol + "//" + window.location.host);
        }
        return this._spaBaseUrl;
    }
    enforceInitialized() {
        const initializedStatuses = [3 /* ContainerReady */, 4 /* Initialized */];
        if (initializedStatuses.indexOf(this._initialized) < 0) {
            throw new Error('The Episerver SPA Context has not yet been initialized');
        }
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
        if (!this.isServerSideRendering() && this.initialEditMode()) {
            this.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */).InEditMode = true;
        }
    }
}
ctx.EpiserverSpa.Context = ctx.EpiserverSpa.Context || new EpiserverSpaContext();
export const DefaultContext = ctx.EpiserverSpa.Context;
export default DefaultContext;
//# sourceMappingURL=Spa.js.map