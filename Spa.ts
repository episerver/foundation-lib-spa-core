// Redux & Redux setup
import { configureStore, EnhancedStore, Action, AnyAction, Reducer } from '@reduxjs/toolkit';

// Lodash
import merge from 'lodash/merge';
import clone from 'lodash/clone';

// Application context
import IEpiserverContext from './Core/IEpiserverContext';
import IServiceContainer, { DefaultServices } from './Core/IServiceContainer';
import ContentDeliveryAPI from './ContentDeliveryAPI';
import IEventEngine from './Core/IEventEngine';
import DefaultEventEngine from './Core/DefaultEventEngine';
import { ContentReference, ContentLinkService, ContentApiId } from './Models/ContentLink';
import ComponentLoader, { isIComponentLoader } from './Loaders/ComponentLoader';
import AppConfig from './AppConfig';
import getGlobal from './AppGlobal';
import PathProvider from './PathProvider';
import IExecutionContext from './Core/IExecutionContext';
import ServerContextAccessor from './ServerSideRendering/ServerContextAccessor';

// Core Modules
import RoutingModule from './Routing/RoutingModule';
import RepositoryModule from './Repository/RepositoryModule';
import LoadersModule from './Loaders/LoadersModule';

// Taxonomy
import IContentProperty from './Property';
import IContent from './Models/IContent';
import Website from './Models/Website';
import StringUtils from './Util/StringUtils';
import IInitializableModule from './Core/IInitializableModule';

// Content Delivery V2
import IIContentRepositoryV2 from './Repository/IIContentRepository';
import IContentDeliveryApiV2 from './ContentDelivery/IContentDeliveryAPI';

// Create context
const ctx : any = getGlobal();
ctx.EpiserverSpa = ctx.EpiserverSpa || {};
ctx.epi = ctx.epi || {};

interface EpiContentSavedEvent {
    successful: boolean;
    contentLink: string;
    hasContentLinkChanged: boolean;
    savedContentLink: string;
    publishedContentLink: string;
    properties: {
        name: string;
        successful: boolean;
        validationErrors: any;
        value: any;
    }[];
    validationErrors: any[];
    oldContentLink: string;
}

export enum InitStatus
{
  NotInitialized,
  Initializing,
  Initialized
}

export class EpiserverSpaContext implements IEpiserverContext, PathProvider {
    protected _initialized: InitStatus = InitStatus.NotInitialized;
    protected _state!: EnhancedStore;
    protected _isServerSideRendering!: boolean;
    protected _componentLoader!: ComponentLoader;
    protected _serviceContainer!: IServiceContainer;
    protected _modules: IInitializableModule[] = [];

    public get serviceContainer() : IServiceContainer
    {
        return this._serviceContainer;
    }

    /**
     * Retrieve an instance of the ContentDeliveryAPI wrapper
     * 
     * @deprecated    Use the ContentRepository_V2 service to fetch content and interact with controllers
     */
    public get contentStorage() : ContentDeliveryAPI
    {
        return this.serviceContainer.getService<ContentDeliveryAPI>(DefaultServices.ContentDeliveryApi);
    }

    public init(config: AppConfig, serviceContainer: IServiceContainer, isServerSideRendering: boolean = false): void {
        // Generic init
        this._initialized = InitStatus.Initializing;
        this._isServerSideRendering = isServerSideRendering;
        this._serviceContainer = serviceContainer;
        const executionContext : IExecutionContext = { isServerSideRendering }
        config.enableDebug = process.env.NODE_ENV === 'production' ? false : config.enableDebug;

        // Create module list
        this._modules.push(new RepositoryModule(), new RoutingModule(), new LoadersModule());
        this._modules.sort((a, b) => a.SortOrder - b.SortOrder);
        if (config.modules) this._modules = this._modules.concat(config.modules);
        if (config.enableDebug) console.debug('Spa modules:', this._modules.map((m) => m.GetName()));

        // Register core services
        this._serviceContainer.addService(DefaultServices.Context, this);
        this._serviceContainer.addService(DefaultServices.Config, config);
        this._serviceContainer.addService(DefaultServices.ExecutionContext, executionContext);
        this._serviceContainer.addService(DefaultServices.ServerContext, new ServerContextAccessor())
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
        if (!this._isServerSideRendering && this.initialEditMode()) {
            // if (this.isDebugActive()) console.debug('Adding edit mode event handlers');
            // this.contentDeliveryApi().setInEditMode(true);
            this.serviceContainer.getService<IContentDeliveryApiV2>(DefaultServices.ContentDeliveryAPI_V2).InEditMode = true;
            // this.events().addListener('beta/epiReady', 'BetaEpiReady', this.onEpiReady.bind(this), true);
            this.events().addListener('beta/contentSaved', 'BetaEpiContentSaved', this.onEpiContentSaved.bind(this), true);
            // this.events().addListener('epiReady', 'EpiReady', this.onEpiReady.bind(this), true);
            this.events().addListener('contentSaved', 'EpiContentSaved', this.onEpiContentSaved.bind(this), true);
        }
    }

    private onEpiContentSaved(event: EpiContentSavedEvent) : void
    {
        if (this.isDebugActive()) console.info('EpiContentSaved: Received updated content from the Episerver Shell', event);
        if (event.successful) {
            const repo = this.serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
            const baseId = event.savedContentLink;
            const isStringProperty : (toTest: object, propName: string) => boolean = (toTest, propName) => {
              try {
                return (toTest as any)[propName] && typeof (toTest as any)[propName] === 'string';
              } catch (e) { /* Empty on purpose */ }
              return false;
            }
            
            repo.patch(baseId, (item) => {
              const out = clone<IContent>(item);
              event.properties.forEach(property => {
                if (property.successful) {
                  const propertyData : { [key: string ]: Partial<IContentProperty> | string } = { };
                  if (property.name.substr(0, 9) === 'icontent_') {
                    switch (property.name.substr(9)) {
                      case 'name':
                        if (this.isDebugActive()) console.info('EpiContentSaved: Received updated name');
                        propertyData.name = isStringProperty(out, 'name') ? property.value : { expandedValue: undefined, value: property.value };
                        break;
                      default:
                        if (this.isDebugActive()) console.warn('EpiContentSaved: Received unsupported property ', property);
                        break;
                    }
                  } else {
                    if (this.isDebugActive()) console.info(`EpiContentSaved: Received updated ${ property.name }`);
                    propertyData[property.name] = {
                      expandedValue: undefined,
                      value: property.value
                    }
                  }
                  merge(out, propertyData);
                }
              });
              if (this.isDebugActive()) console.info('EpiContentSaved: Patched iContent', out);
              return out;
            });
        }
    }

  public isInitialized(): boolean {
    return this._initialized === InitStatus.Initialized;
  }

  public isDebugActive(): boolean {
    this.enforceInitialized();
    return this.config()?.enableDebug || false;
  }

  public isServerSideRendering(): boolean {
    if (this._isServerSideRendering == null) {
      try {
        this._isServerSideRendering = ctx.epi.isServerSideRendering === true;
      } catch (e) {
        return false;
      }
    }
    return this._isServerSideRendering;
  }

  protected enforceInitialized(): void {
    if (!this._initialized) {
      throw new Error('The Episerver SPA Context has not yet been initialized');
    }
  }

  public dispatch<T>(action: AnyAction): T {
    this.enforceInitialized();
    return this._state.dispatch(action) as unknown as T
  }

  public invoke<T>(action: AnyAction): T {
    this.enforceInitialized();
    return this._state.dispatch(action) as unknown as T;
  }

  public getStore(): EnhancedStore {
    this.enforceInitialized();
    return this._state;
  }

  public events(): IEventEngine {
    return this._serviceContainer.getService(DefaultServices.EventEngine);
  }

  public config(): Readonly<AppConfig> {
    this.enforceInitialized();
    return this._serviceContainer.getService(DefaultServices.Config);
  }

  public componentLoader(): ComponentLoader {
    return this._serviceContainer.getService(DefaultServices.ComponentLoader);
  }

  public contentDeliveryApi<API extends ContentDeliveryAPI = ContentDeliveryAPI>(): API {
    this.enforceInitialized();
    return this._serviceContainer.getService<API>(DefaultServices.ContentDeliveryApi);
  }

  public getContentByGuid(guid: string): IContent | null {
    throw new Error('Synchronous content loading is no longer supported');
  }

  public loadContentByGuid(id: string): Promise<IContent> {
    this.enforceInitialized();
    const repo = this._serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    return repo.load(id).then(iContent => { if (!iContent) throw new Error('Content not resolved!'); return iContent; });
  }

  public getContentById(id: ContentApiId): IContent | null {
    throw new Error('Synchronous content loading is no longer supported');
  }

  public loadContentById(id: ContentApiId): Promise<IContent> {
    this.enforceInitialized();
    const repo = this._serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    return repo.load(id).then(iContent => { if (!iContent) throw new Error('Content not resolved!'); return iContent; });
  }

  public getContentByRef(ref: string): IContent | null {
    throw new Error('Synchronous content loading is no longer supported');
  }

  public loadContentByRef(ref: string): Promise<IContent> {
    this.enforceInitialized();
    const repo = this._serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    return repo.getByReference(ref).then(iContent => { if (!iContent) throw new Error('Content not resolved!'); return iContent; });
  }

  public getContentByPath(path: string): IContent | null {
    throw new Error('Synchronous content loading is no longer supported');
  }

  public loadContentByPath(path: string): Promise<IContent> {
    this.enforceInitialized();
    const repo = this._serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    return repo.getByRoute(path).then(iContent => { if (!iContent) throw new Error('Content not resolved!'); return iContent; });
  }

  public injectContent(iContent: IContent): void {
    // Ignore on purpose, will be removed
  }

    /**
     * Check whether or not we're in edit mode by looking at the URL. This
     * yields the correct result prior to the onEpiReady event has fired
     * 
     * @return {boolean}
     */
    public initialEditMode(): boolean {
        try {
            const mySearchParams = new URLSearchParams(window.location.search);
            if (mySearchParams.get('commondrafts')?.toLowerCase() === 'true') return false;
            if (mySearchParams.get('epieditmode')?.toLowerCase() === 'true') return true; 
            return this.isInEditMode();
        } catch (e) {
            return false;
        }
    }

    /**
     * Determine the edit mode by following a sequence of steps, from most
     * reliable to most unreliable.
     * 
     * @returns {boolean}
     */
    public isInEditMode(): boolean {
        try {
            const mySearchParams = new URLSearchParams(window.location.search);
            if (mySearchParams.get('commondrafts')?.toLowerCase() === 'true') return false;
        } catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            return ctx.epi && ctx.epi.inEditMode !== undefined ? ctx.epi.inEditMode === true : false;
        } catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            return ctx.epi && ctx.epi.beta && ctx.epi.beta.inEditMode !== undefined ? ctx.epi.beta.inEditMode === true : false;
        } catch (e) {
            // Ignore errors on purpose to go to next test
        }
        try {
            return (new URLSearchParams(window.location.search)).get('epieditmode')?.toLowerCase() === 'true';
        } catch (e) {
            // Ignore error on purpose to go to next test
        }
        return false;
    }

  public isEditable(): boolean {
    try {
        const mySearchParams = new URLSearchParams(window.location.search);
        if (mySearchParams.get('commondrafts')?.toLowerCase() === 'true') return false;
    } catch (e) {
        // Ignore errors on purpose to go to next test
    }
    try {
      return ctx.epi ? ctx.epi.isEditable === true : false;
    } catch (e) {
      // Ignore errors on purpose to go to next test;
    }
    try {
      return ctx.epi && ctx.epi.beta ? ctx.epi.beta.isEditable === true : false;
    } catch (e) {
      // Ignore errors on purpose to go to next test
    }
    return false;
  }

  public getEpiserverUrl(path: ContentReference = '', action?: string): string {
    let itemPath: string = '';
    if (ContentLinkService.referenceIsString(path)) {
      itemPath = path;
    } else if (ContentLinkService.referenceIsContentLink(path)) {
      itemPath = path.url;
    } else if (ContentLinkService.referenceIsIContent(path)) {
      itemPath = path.contentLink.url;
    }

    if (action) {
      itemPath += itemPath.length ? '/' + action : action;
    }

    return StringUtils.TrimRight('/', this.config()?.epiBaseUrl + itemPath);
  }

    public getSpaRoute(path: ContentReference) : string
    {
        let newPath: string = '';
        if (ContentLinkService.referenceIsString(path)) {
            newPath = path;
        } else if (ContentLinkService.referenceIsIContent(path)) {
            newPath = path.contentLink.url;
        } else if (ContentLinkService.referenceIsContentLink(path)) {
            newPath = path.url;
        }

        return '/' + StringUtils.TrimLeft('/',this.config().basePath + newPath)
    }

    /**
     * 
     * @param content   The content item load, by path, content link or IContent
     * @param action    The action to invoke on the content controller
     */
    public buildPath(content: ContentReference, action: string = "") : string
    {
        let newPath: string = '';
        if (ContentLinkService.referenceIsString(content)) {
            newPath = content;
        } else if (ContentLinkService.referenceIsIContent(content)) {
            newPath = content.contentLink.url;
        } else if (ContentLinkService.referenceIsContentLink(content)) {
            newPath = content.url;
        }

        if (!newPath) {
            if (this.isDebugActive()) console.log('The navigation target does not include a path.', content);
            newPath = '/';
        }

        if (action) {
            newPath = newPath.substr(-1,1) === "/" ? newPath + action + "/" : newPath + "/" + action + "/";
        }

        return newPath;
    }

  public navigateTo(path: ContentReference, noHistory: boolean = false): void {
    let newPath: string = '';
    if (ContentLinkService.referenceIsString(path)) {
      newPath = path;
    } else if (ContentLinkService.referenceIsIContent(path)) {
      newPath = path.contentLink.url;
    } else if (ContentLinkService.referenceIsContentLink(path)) {
      newPath = path.url;
    }

    if (!newPath) {
      if (this.isDebugActive()) console.log('The navigation target does not include a path.', path);
      newPath = '/';
    }

    window.location.href = newPath;
  }

  public getCurrentWebsite(): Website {
    const website = this.serviceContainer.getService<IContentDeliveryApiV2>(DefaultServices.ContentDeliveryAPI_V2).CurrentWebsite;
    if (!website) throw new Error('The Current website has not been set');
    return website;
  }

  public async loadCurrentWebsite(): Promise<Website> {
    let domain : string = '';
    const repo = this.serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    try {
      domain = window.location.hostname;
    } catch (e) {
      // Ignored on purpose
    };
    const website = await repo.getWebsite(domain);
    if (!website) throw new Error('Current website not loadable');
    this.serviceContainer.getService<IContentDeliveryApiV2>(DefaultServices.ContentDeliveryAPI_V2).CurrentWebsite = website;
    return website;
  }

  public getCurrentPath(): string {
    const state = this._state.getState();
    return state.ViewContext.currentPath;
  }

  private _routedContent ?: IContent;

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

  public getContentByContentRef(ref: ContentReference) {
    const id: string | null = ContentLinkService.createApiId(ref);
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
  public getSpaBasePath(): string {
    if (typeof this._sanitizedSpaBasePath === 'string') {
      return this._sanitizedSpaBasePath;
    }
    let configBasePath = this.config()?.basePath || '';
    if (configBasePath.length > 0) {
      configBasePath = StringUtils.TrimRight('/', StringUtils.TrimLeft('/', configBasePath));
      configBasePath = configBasePath.length > 0 ? '/' + configBasePath : '';
    }
    this._sanitizedSpaBasePath = configBasePath;
    return this._sanitizedSpaBasePath;
  }

  private _sanitizedSpaBasePath!: string;

  /**
   * Get the domain where the SPA is running. If it's configured to be
   * running at https://example.com/spa/, this method returns: https://example.com
   */
  public getSpaDomain(): string {
    return window.location.protocol + '//' + window.location.hostname;
  }

  /**
   * Get the location where Episerver is running, whithout a trailing slash.
   */
  public getEpiserverURL(): string {
    return this.getEpiserverUrl();
  }
}

ctx.EpiserverSpa.Context = ctx.EpiserverSpa.Context || new EpiserverSpaContext();
export default ctx.EpiserverSpa.Context as IEpiserverContext;
