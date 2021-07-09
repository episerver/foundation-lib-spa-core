// Redux & Redux setup
import { configureStore, EnhancedStore, Action, Reducer } from '@reduxjs/toolkit';

// Application context
import IEpiserverContext from './Core/IEpiserverContext';
import IServiceContainer, { DefaultServices } from './Core/IServiceContainer';
import IEventEngine from './Core/IEventEngine';
import DefaultEventEngine from './Core/DefaultEventEngine';
import { ContentReference, ContentLinkService } from './Models/ContentLink';
import ComponentLoader from './Loaders/ComponentLoader';
import AppConfig from './AppConfig';
import getGlobal from './AppGlobal';
import IExecutionContext from './Core/IExecutionContext';
import { Factory as ServerContextFactory } from './ServerSideRendering/IServerContextAccessor';

// Core Modules
import RoutingModule from './Routing/RoutingModule';
import RepositoryModule from './Repository/RepositoryModule';
import LoadersModule from './Loaders/LoadersModule';
import StateModule from './State/StateModule';

// Taxonomy
import IContent from './Models/IContent';
import StringUtils from './Util/StringUtils';
import IInitializableModule from './Core/IInitializableModule';

// Content Delivery V2
import IContentDeliveryApiV2 from './ContentDelivery/IContentDeliveryAPI';

// Create context
const ctx : any = getGlobal();
ctx.EpiserverSpa = ctx.EpiserverSpa || {};
ctx.epi = ctx.epi || {};

export const enum InitStatus
{
    NotInitialized,
    Initializing,
    CoreServicesReady,
    ContainerReady,
    Initialized
}

export class EpiserverSpaContext implements IEpiserverContext
{
    private _cachedEditModeUrl ?: boolean = undefined;
    protected _initialized: InitStatus = InitStatus.NotInitialized;
    protected _serviceContainer!: IServiceContainer;
    protected _modules: IInitializableModule[] = [];
    protected _state!: EnhancedStore;
    private _routedContent ?: IContent;

    public get serviceContainer() : IServiceContainer
    {
        return this._serviceContainer;
    }

    public get Language() : string
    {
        return this.serviceContainer.getService<IContentDeliveryApiV2>(DefaultServices.ContentDeliveryAPI_V2)?.Language ||
            this.config().defaultLanguage;
    }

    public init(config: AppConfig, serviceContainer: IServiceContainer, isServerSideRendering = false): void {
        if (config.enableDebug) console.time("SPA Initialization");
        // Generic init
        this._initialized = InitStatus.Initializing;
        this._serviceContainer = serviceContainer;

        // Prepare services
        const executionContext : Readonly<IExecutionContext> = { 
            isServerSideRendering: (() : boolean => {
                try {
                    return isServerSideRendering || (ctx.epi.isServerSideRendering === true);
                } catch (e) {
                    return false;
                }
            })(),
            isDebugActive: typeof(config.enableDebug) === 'boolean' ? config.enableDebug : false,
            isEditable: this.initialEditMode(),
            isInEditMode: this.initialEditMode(),
        }
        config.enableDebug = executionContext.isDebugActive;

        // Warn for production built with debug active
        if (process.env.NODE_ENV === 'production' && executionContext.isDebugActive)
            console.warn('Running Episerver SPA with a production build and debug enabled');    

        // Create module list
        if (config.enableDebug) console.time('Creating modules');
        this._modules.push(new RepositoryModule(), new RoutingModule(), new LoadersModule(), new StateModule());
        if (config.modules) this._modules = this._modules.concat(config.modules);
        this._modules.sort((a, b) => a.SortOrder - b.SortOrder);
        if (config.enableDebug) {
            console.debug(`Episerver SPA modules: ${this._modules.map((m) => `${m.GetName()} (${m.SortOrder})`).join(', ')}`);
            console.timeEnd('Creating modules');
        }

        // Register core services
        if (config.enableDebug) console.time('Adding default services');
        if (!this._serviceContainer.hasService(DefaultServices.Context)) this._serviceContainer.addService(DefaultServices.Context, this);
        if (!this._serviceContainer.hasService(DefaultServices.Config)) this._serviceContainer.addService(DefaultServices.Config, config);
        if (!this._serviceContainer.hasService(DefaultServices.ExecutionContext)) this._serviceContainer.addService(DefaultServices.ExecutionContext, executionContext);
        if (!this._serviceContainer.hasService(DefaultServices.ServerContext)) this._serviceContainer.addFactory(DefaultServices.ServerContext, (container) => 
            ServerContextFactory.create(container.getService(DefaultServices.ExecutionContext), container.getService(DefaultServices.Config))
        );
        if (!this._serviceContainer.hasService(DefaultServices.EventEngine)) this._serviceContainer.addFactory(DefaultServices.EventEngine, (container) => {
            const engine = new DefaultEventEngine();
            engine.debug = container.getService<Readonly<IExecutionContext>>(DefaultServices.ExecutionContext).isDebugActive;
            return engine;
        });
        if (config.enableDebug) console.timeEnd('Adding default services');
        this._initialized = InitStatus.CoreServicesReady;

        // Have modules add services of their own
        if (config.enableDebug) console.time('Module container configuration');
        this._modules.forEach(x => {
            if (config.enableDebug) console.time('Module container configuration: ' + x.GetName());
            x.ConfigureContainer(this._serviceContainer)
            if (config.enableDebug) console.timeEnd('Module container configuration: ' + x.GetName());
        });
        if (config.enableDebug) console.timeEnd('Module container configuration');
        this._initialized = InitStatus.ContainerReady;

        // Redux init
        this._initRedux();

        // EpiEditMode init
        this._initEditMode();

        // Run module startup logic
        this._modules.forEach(x => x.StartModule(this));

        // Mark SPA as initialized & and make some info available in the global context
        this._initialized = InitStatus.Initialized;

        if (executionContext.isDebugActive) {
            ctx.EpiserverSpa.serviceContainer = this._serviceContainer;
            ctx.EpiserverSpa.modules = this._modules;
        }
        if (config.enableDebug) console.timeEnd("SPA Initialization");
    }

    public isInitialized(): boolean {
        return this._initialized === InitStatus.Initialized;
    }

    public isDebugActive(): boolean {
        this.enforceInitialized();
        return this.serviceContainer.getService<IExecutionContext>(DefaultServices.ExecutionContext).isDebugActive;
    }

    public isServerSideRendering(): boolean {
        this.enforceInitialized();
        return this.serviceContainer.getService<IExecutionContext>(DefaultServices.ExecutionContext).isServerSideRendering;
    }

    public getStore(): EnhancedStore {
        this.enforceInitialized();
        return this._state;
    }

    public events(): IEventEngine {
        this.enforceInitialized();
        return this._serviceContainer.getService(DefaultServices.EventEngine);
    }

    public config(): Readonly<AppConfig> {
        this.enforceInitialized();
        return this._serviceContainer.getService(DefaultServices.Config);
    }

    public componentLoader(): ComponentLoader {
        this.enforceInitialized();
        return this._serviceContainer.getService(DefaultServices.ComponentLoader);
    }

    /**
     * Check whether or not we're in edit mode by looking at the URL. This
     * yields the correct result prior to the onEpiReady event has fired
     * 
     * @return {boolean}
     */
    public initialEditMode(): boolean {
        try {
            if (typeof(ctx?.epi?.inEditMode) === 'boolean' && ctx.epi.inEditMode) 
                return true;
        } catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            if (typeof(ctx?.epi?.beta?.inEditMode) === 'boolean' && ctx.epi.beta.inEditMode) 
                return true;
        } catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            if (this._cachedEditModeUrl === undefined) {
                this._cachedEditModeUrl = (new URLSearchParams(window.location.search.toLowerCase())).get('epieditmode') === 'true';
            }
            return this._cachedEditModeUrl;
        } catch (e) {
            // Ignore error on purpose to go to next test
        }
        try {
            return window !== window?.top && window?.name === 'sitePreview';
        } catch (e) {
            // Ignore error on purpose to go to next test
        }
        return false;
    }

    public isInEditMode(): boolean {
        return this._serviceContainer.getService<IExecutionContext>(DefaultServices.ExecutionContext).isInEditMode;
    }

    public isEditable(): boolean {
        return this._serviceContainer.getService<IExecutionContext>(DefaultServices.ExecutionContext).isEditable;
    }

    public getEpiserverUrl(path: ContentReference = '', action?: string): URL {
        const itemPath = this.buildPath(path, action);
        return new URL(itemPath, this.config()?.epiBaseUrl);
    }

    public buildPath(content: ContentReference, action = "") : string
    {
        let newPath = '';
        if (ContentLinkService.referenceIsString(content)) {
            newPath = content;
        } else if (ContentLinkService.referenceIsIContent(content)) {
            newPath = content.contentLink.url;
        } else if (ContentLinkService.referenceIsContentLink(content)) {
            newPath = content.url;
        }

        if (!newPath) {
            if (this.isDebugActive()) console.debug('The navigation target does not include a path.', content);
            newPath = '/';
        }

        if (action) {
            newPath = "/" + StringUtils.TrimLeft("/", StringUtils.TrimRight("/", newPath) + "/" + action);
        }

        return newPath;
    }

    public getRoutedContent(): IContent {
        if (!this._routedContent) {
            throw new Error("There's no currently routed content");
        }
        return this._routedContent;
    }
  
    public setRoutedContent(iContent?: IContent) : IEpiserverContext
    {
        this._routedContent = iContent;
        return this;
    }
  
    public hasRoutedContent() : boolean {
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
    public getSpaBasePath() : string{
        return this.spaBaseUrl.pathname;
    }
  
    /**
     * Get the domain where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns: https://example.com
     */
    public getSpaDomain(): string {
        return `${ this.spaBaseUrl.protocol }//${ this.spaBaseUrl.host }`;
    }

    public get spaBaseUrl() : URL
    {
        if (!this._spaBaseUrl) {
            this._spaBaseUrl = new URL(this.config()?.basePath || '', this.config()?.spaBaseUrl || 
                this.config()?.epiBaseUrl ||  
                window.location.protocol + "//" + window.location.host
            );
        }
        return this._spaBaseUrl;
    }

    private _spaBaseUrl : URL | undefined;

    protected enforceInitialized(): void {
        const initializedStatuses : InitStatus[] = [InitStatus.ContainerReady, InitStatus.Initialized];
        if (initializedStatuses.indexOf(this._initialized) < 0) {
            throw new Error('The Episerver SPA Context has not yet been initialized');
        }
    }

    private _initRedux() : void
    {
        const reducers: { [key : string ]: Reducer<any, Action> } = {};
        this._modules.forEach(x => { const ri = x.GetStateReducer(); if (ri) { reducers[ri.stateKey] = ri.reducer }});
        this._state = configureStore({ reducer: reducers });
        this._state.dispatch({ type: '@@EPI/INIT' });
    }

    private _initEditMode() : void
    {
        if (this.isDebugActive()) console.debug(`Initializing edit mode in ${ this.initialEditMode() ? 'enabled' : 'disabled'} state`);
        if (!this.isServerSideRendering() && this.initialEditMode()) {
            this.serviceContainer.getService<IContentDeliveryApiV2>(DefaultServices.ContentDeliveryAPI_V2).InEditMode = true;
        }
    }
}

ctx.EpiserverSpa.Context = ctx.EpiserverSpa.Context || new EpiserverSpaContext();
export const DefaultContext = ctx.EpiserverSpa.Context as IEpiserverContext;
export default DefaultContext;
