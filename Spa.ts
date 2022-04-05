// Redux & Redux setup
import { configureStore, EnhancedStore, Action, AnyAction, Reducer } from '@reduxjs/toolkit';

// Application context
import IEpiserverContext from './Core/IEpiserverContext';
import IServiceContainer, { DefaultServices } from './Core/IServiceContainer';
import ContentDeliveryAPI from './ContentDeliveryAPI';
import IEventEngine from './Core/IEventEngine';
import DefaultEventEngine from './Core/DefaultEventEngine';
import { ContentReference, ContentLinkService, ContentApiId } from './Models/ContentLink';
import ComponentLoader from './Loaders/ComponentLoader';
import AppConfig from './AppConfig';
import getGlobal from './AppGlobal';
import PathProvider from './PathProvider';
import IExecutionContext from './Core/IExecutionContext';
import { Factory as ServerContextFactory } from './ServerSideRendering/IServerContextAccessor';

// Core Modules
import RoutingModule from './Routing/RoutingModule';
import RepositoryModule from './Repository/RepositoryModule';
import LoadersModule from './Loaders/LoadersModule';
import StateModule from './State/StateModule';

// Taxonomy
import IContent from './Models/IContent';
import Website from './Models/Website';
import StringUtils from './Util/StringUtils';
import IInitializableModule from './Core/IInitializableModule';

// Content Delivery V2
import IIContentRepositoryV2 from './Repository/IIContentRepository';
import IContentDeliveryApiV2 from './ContentDelivery/IContentDeliveryAPI';
import ServerContext from './ServerSideRendering/ServerContext';
import { ContentAppState } from './State/Reducer';

// Create context
const ctx: any = getGlobal();
ctx.EpiserverSpa = ctx.EpiserverSpa || {};
ctx.epi = ctx.epi || {};

export enum InitStatus {
  NotInitialized,
  Initializing,
  CoreServicesReady,
  ContainerReady,
  Initialized,
}

export class EpiserverSpaContext implements IEpiserverContext, PathProvider {
  protected _initialized: InitStatus = InitStatus.NotInitialized;
  protected _state!: EnhancedStore;
  protected _componentLoader!: ComponentLoader;
  protected _serviceContainer!: IServiceContainer;
  protected _modules: IInitializableModule[] = [];

  private _cachedEditModeUrl?: boolean = undefined;
  private _routedContent?: IContent;

  public get serviceContainer(): IServiceContainer {
    return this._serviceContainer;
  }

  /**
   * Retrieve an instance of the ContentDeliveryAPI wrapper
   *
   * @deprecated    Use the ContentRepository_V2 service to fetch content and interact with controllers
   */
  public get contentStorage(): ContentDeliveryAPI {
    return this.serviceContainer.getService<ContentDeliveryAPI>(DefaultServices.ContentDeliveryApi);
  }

  public get Language(): string {
    return (
      this.serviceContainer.getService<IContentDeliveryApiV2>(DefaultServices.ContentDeliveryAPI_V2)?.Language ||
      this.config().defaultLanguage
    );
  }

  public init(
    config: AppConfig,
    serviceContainer: IServiceContainer,
    isServerSideRendering = false,
    hydrateDate?: ServerContext,
  ): void {
    // Generic init
    this._initialized = InitStatus.Initializing;
    this._serviceContainer = serviceContainer;

    // Prepare services
    const executionContext: Readonly<IExecutionContext> = {
      isServerSideRendering: ((): boolean => {
        try {
          return isServerSideRendering || ctx.epi.isServerSideRendering === true;
        } catch (e) {
          return false;
        }
      })(),
      isDebugActive: typeof config.enableDebug === 'boolean' ? config.enableDebug : false,
      isEditable: this.initialEditMode(),
      isInEditMode: this.initialEditMode(),
    };
    config.enableDebug = executionContext.isDebugActive;
    const eventEngine = new DefaultEventEngine();
    eventEngine.debug = executionContext.isDebugActive;

    // Warn for production built with debug active
    if (process.env.NODE_ENV === 'production' && executionContext.isDebugActive)
      console.warn('Running Episerver SPA with a production build and debug enabled');

    // Create module list
    this._modules.push(new RepositoryModule(), new RoutingModule(), new LoadersModule(), new StateModule());
    if (config.modules) this._modules = this._modules.concat(config.modules);
    this._modules.sort((a, b) => a.SortOrder - b.SortOrder);
    if (config.enableDebug)
      console.info(`Episerver SPA modules: ${this._modules.map((m) => `${m.GetName()} (${m.SortOrder})`).join(', ')}`);

    // Register core services
    this._serviceContainer.addService(DefaultServices.Context, this);
    this._serviceContainer.addService(DefaultServices.Config, config);
    this._serviceContainer.addService(DefaultServices.ExecutionContext, executionContext);
    this._serviceContainer.addService(
      DefaultServices.ServerContext,
      ServerContextFactory.create(executionContext, config),
    );
    this._serviceContainer.addService(DefaultServices.EventEngine, eventEngine);
    this._initialized = InitStatus.CoreServicesReady;

    // Have modules add services of their own
    this._modules.forEach((x) => x.ConfigureContainer(this._serviceContainer));
    this._initialized = InitStatus.ContainerReady;

    // Redux init
    if (executionContext.isServerSideRendering && hydrateDate) {
      this._initRedux(hydrateDate);
    } else {
      this._initRedux();
    }

    // EpiEditMode init
    this._initEditMode();

    // Run module startup logic
    this._modules.forEach((x) => x.StartModule(this));

    // Mark SPA as initialized & and make some info available in the global context
    this._initialized = InitStatus.Initialized;

    if (executionContext.isDebugActive) {
      ctx.EpiserverSpa.serviceContainer = this._serviceContainer;
      ctx.EpiserverSpa.modules = this._modules;
      ctx.EpiserverSpa.eventEngine = eventEngine;
    }
  }

  private getInitialState(hydrateData: ServerContext): ContentAppState {
    const state: ContentAppState = {};
    if (state.OptiContentCloud == undefined) {
      state.OptiContentCloud = {};
    }
    console.warn('Creating preloaded state > after if ', JSON.stringify(state));
    if (hydrateData) {
      state.OptiContentCloud.currentLanguage = (hydrateData?.Language as string) ?? '';
      state.OptiContentCloud.iContent = (hydrateData?.IContent as IContent) ?? undefined;
      state.OptiContentCloud.initialState = hydrateData;
    }

    console.warn('Creating preloaded state > after filling ', JSON.stringify(state.OptiContentCloud.currentLanguage));
    return state;
  }

  private _initRedux(hydrateData?: ServerContext): void {
    const reducers: { [key: string]: Reducer<any, Action> } = {};
    this._modules.forEach((x) => {
      const ri = x.GetStateReducer();
      if (ri) {
        reducers[ri.stateKey] = ri.reducer;
      }
    });
    if (hydrateData) {
      console.warn('Preloading store');
      console.warn('reducers', reducers);

      this._state = configureStore({
        reducer: reducers,
        preloadedState: { OptiContentCloud: { value: this.getInitialState(hydrateData) } },
      });
    } else {
      this._state = configureStore({ reducer: reducers });
    }
    this._state.dispatch({ type: '@@EPI/INIT' });
  }

  private _initEditMode(): void {
    if (this.isDebugActive())
      console.debug(`Initializing edit mode in ${this.initialEditMode() ? 'enabled' : 'disabled'} state`);
    if (!this.isServerSideRendering() && this.initialEditMode()) {
      this.serviceContainer.getService<IContentDeliveryApiV2>(DefaultServices.ContentDeliveryAPI_V2).InEditMode = true;
      this.serviceContainer.getService<ContentDeliveryAPI>(DefaultServices.ContentDeliveryApi).setInEditMode(true);
    }
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

  protected enforceInitialized(): void {
    const initializedStatuses: InitStatus[] = [InitStatus.ContainerReady, InitStatus.Initialized];
    if (initializedStatuses.indexOf(this._initialized) < 0) {
      throw new Error('The Episerver SPA Context has not yet been initialized');
    }
  }

  public dispatch<T>(action: AnyAction): T {
    this.enforceInitialized();
    return this._state.dispatch(action) as unknown as T;
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

  public getContentByGuid(): IContent | null {
    throw new Error('Synchronous content loading is no longer supported');
  }

  public loadContentByGuid(id: string): Promise<IContent> {
    this.enforceInitialized();
    const repo = this._serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    return repo.load(id).then((iContent) => {
      if (!iContent) throw new Error('Content not resolved!');
      return iContent;
    });
  }

  public getContentById(): IContent | null {
    throw new Error('Synchronous content loading is no longer supported');
  }

  public loadContentById(id: ContentApiId): Promise<IContent> {
    this.enforceInitialized();
    const repo = this._serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    return repo.load(id).then((iContent) => {
      if (!iContent) throw new Error('Content not resolved!');
      return iContent;
    });
  }

  public getContentByRef(): IContent | null {
    throw new Error('Synchronous content loading is no longer supported');
  }

  public loadContentByRef(ref: string): Promise<IContent> {
    this.enforceInitialized();
    const repo = this._serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    return repo.getByReference(ref).then((iContent) => {
      if (!iContent) throw new Error('Content not resolved!');
      return iContent;
    });
  }

  public getContentByPath(): IContent | null {
    throw new Error('Synchronous content loading is no longer supported');
  }

  public loadContentByPath(path: string): Promise<IContent> {
    this.enforceInitialized();
    const repo = this._serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    return repo.getByRoute(path).then((iContent) => {
      if (!iContent) throw new Error('Content not resolved!');
      return iContent;
    });
  }

  public injectContent(): void {
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
      if (typeof ctx?.epi?.inEditMode === 'boolean' && ctx.epi.inEditMode) return true;
    } catch (e) {
      // Ignore errors on purpose to go to next test
    }
    try {
      if (typeof ctx?.epi?.beta?.inEditMode === 'boolean' && ctx.epi.beta.inEditMode) return true;
    } catch (e) {
      // Ignore errors on purpose to go to next test
    }
    try {
      if (this._cachedEditModeUrl === undefined) {
        this._cachedEditModeUrl =
          new URLSearchParams(window.location.search.toLowerCase()).get('epieditmode') === 'true';
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

  public getEpiserverUrl(path: ContentReference = '', action?: string): string {
    let itemPath = '';
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

    const itemUrl: URL = new URL(itemPath, this.config()?.epiBaseUrl);
    return StringUtils.TrimRight('/', itemUrl.href);
  }

  public getSpaRoute(path: ContentReference): string {
    let newPath = '';
    if (ContentLinkService.referenceIsString(path)) {
      newPath = path;
    } else if (ContentLinkService.referenceIsIContent(path)) {
      newPath = path.contentLink.url;
    } else if (ContentLinkService.referenceIsContentLink(path)) {
      newPath = path.url;
    }

    return '/' + StringUtils.TrimLeft('/', this.config().basePath + newPath);
  }

  /**
   *
   * @param content   The content item load, by path, content link or IContent
   * @param action    The action to invoke on the content controller
   */
  public buildPath(content: ContentReference, action = ''): string {
    let newPath = '';
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
      newPath = newPath.substr(-1, 1) === '/' ? newPath + action + '/' : newPath + '/' + action + '/';
    }

    return newPath;
  }

  public navigateTo(path: ContentReference): void {
    let newPath = '';
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
    const website = this.serviceContainer.getService<IContentDeliveryApiV2>(
      DefaultServices.ContentDeliveryAPI_V2,
    ).CurrentWebsite;
    if (!website) throw new Error('The Current website has not been set');
    return website;
  }

  public async loadCurrentWebsite(): Promise<Website> {
    let domain = '';
    const repo = this.serviceContainer.getService<IIContentRepositoryV2>(DefaultServices.IContentRepository_V2);
    try {
      domain = window.location.hostname;
    } catch (e) {
      // Ignored on purpose
    }
    const website = await repo.getWebsite(domain);
    if (!website) throw new Error('Current website not loadable');
    this.serviceContainer.getService<IContentDeliveryApiV2>(DefaultServices.ContentDeliveryAPI_V2).CurrentWebsite =
      website;
    return website;
  }

  public getCurrentPath(): string {
    const state = this._state.getState();
    return state.ViewContext.currentPath;
  }

  public getRoutedContent(): IContent {
    if (!this._routedContent) {
      throw new Error("There's no currently routed content");
    }
    return this._routedContent;
  }

  public setRoutedContent(iContent?: IContent): IEpiserverContext {
    this._routedContent = iContent;
    return this;
  }

  public hasRoutedContent(): boolean {
    return this._routedContent ? true : false;
  }

  public getContentByContentRef(): IContent | null {
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
