import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import IServiceContainer from './IServiceContainer';
import EpiConfig from '../AppConfig';
import ContentDeliveryAPI from '../ContentDeliveryAPI';
import IEventEngine from './IEventEngine';
import { ContentReference, ContentApiId } from '../Models/ContentLink';
import ComponentLoader from '../Loaders/ComponentLoader';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
/**
 * The context for an Episerver SPA, enabling access to the core logic of the SPA.
 */
export default interface IEpiserverContext {
    readonly serviceContainer: IServiceContainer;
    readonly contentStorage: ContentDeliveryAPI;
    /**
     * Perform the initialization of the context from the configuration of the application
     *
     * @param config
     */
    init(config: EpiConfig, serviceContainer: IServiceContainer, isServerSideRendering?: boolean): void;
    /**
     * Check if the debug mode is active
     */
    isDebugActive(): boolean;
    /**
     * Test if the current context has already been initialized and is now ready for usage
     */
    isInitialized(): boolean;
    /**
     * Return if we're server side rendering
     */
    isServerSideRendering(): boolean;
    /**
     * Dispatch an action to the context (Redux store)
     *
     * @deprecated Use getStore to get the Redux instance and run your logic manually
     * @param action
     */
    dispatch<T extends AnyAction>(action: AnyAction): T;
    /**
     * Invoke a function on the context (Redux store)
     *
     * @deprecated Use getStore to get the Redux instance and run your logic manually
     * @param action
     */
    invoke<T extends AnyAction>(action: AnyAction): T;
    /**
     * Get the store
     */
    getStore(): EnhancedStore;
    /**
     * Get the main EventEngine to use
     */
    events(): IEventEngine;
    /**
     * Retrieve the full configuration
     */
    config(): EpiConfig;
    /**
     * Get the current component loader
     */
    componentLoader(): ComponentLoader;
    /**
     * Get an instance of the ContentDeliveryAPI
     *
     * @deprecated Use the React Hook for functional components
     */
    contentDeliveryApi<API extends ContentDeliveryAPI = ContentDeliveryAPI>(): API;
    /**
     * Navigate to a specific item
     *
     * @deprecated
     * @param item
     */
    navigateTo(item: ContentReference): void;
    /**
     * Transform a path to a full URL that can be used to reference the Episerver instance
     *
     * @param path
     */
    getEpiserverUrl(path: ContentReference, action?: string): string;
    /**
     * Transform a content reference to a SPA Route
     *
     * @param path The content to generate the route within the spa for
     */
    getSpaRoute(path: ContentReference): string;
    /**
     * The path to navigate to, using the history object (using the useHistory hook of react-router)
     *
     * @param {ContentReference} content The content to build the path for
     * @param {string} action  The action to run on the content, if any
     * @returns {string}
     */
    buildPath(content: ContentReference, action?: string): string;
    /**
     * Retrieve an item from the state based upon it's GUID, will return
     * null if the content is not in the state.
     *
     * @deprecated  Use the get method of the IContentRepository_V2 Service instead
     * @param guid The GUID of the content to fetch
     */
    getContentByGuid(guid: string): IContent | null;
    /**
     * Retrieve an item from the state based upon it's GUID, will trigger async
     * fetching of the content by GUID if the content is not in the state
     *
     * @deprecated  Use the load method of the IContentRepository_V2 Service instead
     * @param guid The GUID of the content to fetch
     */
    loadContentByGuid(guid: string): Promise<IContent>;
    /**
     * Retrieve an item from the state based upon it's ID, will return
     * null if the content is not in the state.
     *
     * @deprecated  Use the getByContentId method of the IContentRepository_V2 Service instead
     * @param id The API ID (combination of ContentProvider & ID) of the content to fetch
     */
    getContentById(id: ContentApiId): IContent | null;
    /**
     * Retrieve an item from the state based upon it's GUID, will trigger async
     * fetching of the content by GUID if the content is not in the state
     *
     * @deprecated  Use the getByContentId method of the IContentRepository_V2 Service instead
     * @param id The API ID (combination of ContentProvider & ID) of the content to fetch
     */
    loadContentById(id: ContentApiId): Promise<IContent>;
    /**
     *
     * @deprecated  Use the getByReference method of the IContentRepository_V2 Service instead
     * @param ref
     */
    getContentByRef(ref: string): IContent | null;
    /**
     *
     * @deprecated  Use the getByReference method of the IContentRepository_V2 Service instead
     * @param ref
     */
    loadContentByRef(ref: string): Promise<IContent>;
    /**
     *
     * @deprecated  Use the getByRoute method of the IContentRepository_V2 Service instead
     * @param path
     */
    getContentByPath(path: string): IContent | null;
    /**
     *
     * @deprecated  Use the getByRoute method of the IContentRepository_V2 Service instead
     * @param path
     */
    loadContentByPath(path: string): Promise<IContent>;
    /**
     * Retrieve the website that's currently being rendered by the system, returns null
     * if the website is not yet loaded into the state.
     *
     * @deprecated  Use the getCurrentWebsite method of the IContentRepository_V2 Service instead
     */
    getCurrentWebsite(): Website | null;
    /**
     * Retrieve the website that's currently being rendered by the system, returns null
     * if the website is not yet loaded into the state.
     *
     * @deprecated  Use the getCurrentWebsite method of the IContentRepository_V2 Service instead
     */
    loadCurrentWebsite(): Promise<Website | null>;
    /**
     *
     * @deprecated  No longer needed as the IContentRepository_V2 Service automatically caches content
     * @param iContent
     */
    injectContent(iContent: IContent): void;
    isInEditMode(): boolean;
    isEditable(): boolean;
    /**
     * Retrieve the current path
     */
    getCurrentPath(): string;
    /**
     * Retrieve the currently routed content
     */
    getRoutedContent(): IContent;
    hasRoutedContent(): boolean;
    setRoutedContent(iContent?: IContent): IEpiserverContext;
    /**
     * Get the cached content by ContentReference object
     *
     * @param ref The content reference to load
     */
    getContentByContentRef(ref: ContentReference): IContent | null;
    /**
     * Get the domain where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns: https://example.com
     */
    getSpaDomain(): string;
    getSpaBasePath(): string;
    /**
     * Get the URL where Episerver is running, without trailing slash, so that
     * all paths can start with a traling slash.
     */
    getEpiserverURL(): string;
}
