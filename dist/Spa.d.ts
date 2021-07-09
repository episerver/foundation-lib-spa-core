import { EnhancedStore } from '@reduxjs/toolkit';
import IEpiserverContext from './Core/IEpiserverContext';
import IServiceContainer from './Core/IServiceContainer';
import IEventEngine from './Core/IEventEngine';
import { ContentReference } from './Models/ContentLink';
import ComponentLoader from './Loaders/ComponentLoader';
import AppConfig from './AppConfig';
import IContent from './Models/IContent';
import IInitializableModule from './Core/IInitializableModule';
export declare const enum InitStatus {
    NotInitialized = 0,
    Initializing = 1,
    CoreServicesReady = 2,
    ContainerReady = 3,
    Initialized = 4
}
export declare class EpiserverSpaContext implements IEpiserverContext {
    private _cachedEditModeUrl?;
    protected _initialized: InitStatus;
    protected _serviceContainer: IServiceContainer;
    protected _modules: IInitializableModule[];
    protected _state: EnhancedStore;
    private _routedContent?;
    get serviceContainer(): IServiceContainer;
    get Language(): string;
    init(config: AppConfig, serviceContainer: IServiceContainer, isServerSideRendering?: boolean): void;
    isInitialized(): boolean;
    isDebugActive(): boolean;
    isServerSideRendering(): boolean;
    getStore(): EnhancedStore;
    events(): IEventEngine;
    config(): Readonly<AppConfig>;
    componentLoader(): ComponentLoader;
    /**
     * Check whether or not we're in edit mode by looking at the URL. This
     * yields the correct result prior to the onEpiReady event has fired
     *
     * @return {boolean}
     */
    initialEditMode(): boolean;
    isInEditMode(): boolean;
    isEditable(): boolean;
    getEpiserverUrl(path?: ContentReference, action?: string): URL;
    buildPath(content: ContentReference, action?: string): string;
    getRoutedContent(): IContent;
    setRoutedContent(iContent?: IContent): IEpiserverContext;
    hasRoutedContent(): boolean;
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
    /**
     * Get the domain where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns: https://example.com
     */
    getSpaDomain(): string;
    get spaBaseUrl(): URL;
    private _spaBaseUrl;
    protected enforceInitialized(): void;
    private _initRedux;
    private _initEditMode;
}
export declare const DefaultContext: IEpiserverContext;
export default DefaultContext;
