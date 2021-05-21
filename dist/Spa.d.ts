import { EnhancedStore, AnyAction } from '@reduxjs/toolkit';
import IEpiserverContext from './Core/IEpiserverContext';
import IServiceContainer from './Core/IServiceContainer';
import ContentDeliveryAPI from './ContentDeliveryAPI';
import IEventEngine from './Core/IEventEngine';
import { ContentReference, ContentApiId } from './Models/ContentLink';
import ComponentLoader from './Loaders/ComponentLoader';
import AppConfig from './AppConfig';
import PathProvider from './PathProvider';
import IContent from './Models/IContent';
import Website from './Models/Website';
import IInitializableModule from './Core/IInitializableModule';
export declare enum InitStatus {
    NotInitialized = 0,
    Initializing = 1,
    CoreServicesReady = 2,
    ContainerReady = 3,
    Initialized = 4
}
export declare class EpiserverSpaContext implements IEpiserverContext, PathProvider {
    protected _initialized: InitStatus;
    protected _state: EnhancedStore;
    protected _componentLoader: ComponentLoader;
    protected _serviceContainer: IServiceContainer;
    protected _modules: IInitializableModule[];
    private _cachedEditModeUrl?;
    private _routedContent?;
    get serviceContainer(): IServiceContainer;
    /**
     * Retrieve an instance of the ContentDeliveryAPI wrapper
     *
     * @deprecated    Use the ContentRepository_V2 service to fetch content and interact with controllers
     */
    get contentStorage(): ContentDeliveryAPI;
    get Language(): string;
    init(config: AppConfig, serviceContainer: IServiceContainer, isServerSideRendering?: boolean): void;
    private _initRedux;
    private _initEditMode;
    isInitialized(): boolean;
    isDebugActive(): boolean;
    isServerSideRendering(): boolean;
    protected enforceInitialized(): void;
    dispatch<T>(action: AnyAction): T;
    invoke<T>(action: AnyAction): T;
    getStore(): EnhancedStore;
    events(): IEventEngine;
    config(): Readonly<AppConfig>;
    componentLoader(): ComponentLoader;
    contentDeliveryApi<API extends ContentDeliveryAPI = ContentDeliveryAPI>(): API;
    getContentByGuid(): IContent | null;
    loadContentByGuid(id: string): Promise<IContent>;
    getContentById(): IContent | null;
    loadContentById(id: ContentApiId): Promise<IContent>;
    getContentByRef(): IContent | null;
    loadContentByRef(ref: string): Promise<IContent>;
    getContentByPath(): IContent | null;
    loadContentByPath(path: string): Promise<IContent>;
    injectContent(): void;
    /**
     * Check whether or not we're in edit mode by looking at the URL. This
     * yields the correct result prior to the onEpiReady event has fired
     *
     * @return {boolean}
     */
    initialEditMode(): boolean;
    isInEditMode(): boolean;
    isEditable(): boolean;
    getEpiserverUrl(path?: ContentReference, action?: string): string;
    getSpaRoute(path: ContentReference): string;
    /**
     *
     * @param content   The content item load, by path, content link or IContent
     * @param action    The action to invoke on the content controller
     */
    buildPath(content: ContentReference, action?: string): string;
    navigateTo(path: ContentReference): void;
    getCurrentWebsite(): Website;
    loadCurrentWebsite(): Promise<Website>;
    getCurrentPath(): string;
    getRoutedContent(): IContent;
    setRoutedContent(iContent?: IContent): IEpiserverContext;
    hasRoutedContent(): boolean;
    getContentByContentRef(): IContent | null;
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
    getSpaBasePath(): string;
    private _sanitizedSpaBasePath;
    /**
     * Get the domain where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns: https://example.com
     */
    getSpaDomain(): string;
    /**
     * Get the location where Episerver is running, whithout a trailing slash.
     */
    getEpiserverURL(): string;
}
declare const _default: IEpiserverContext;
export default _default;
