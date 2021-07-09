// External libraries
import { EnhancedStore } from '@reduxjs/toolkit';

// Episerver Application
import IServiceContainer from './IServiceContainer';
import EpiConfig from '../AppConfig';
import IEventEngine from './IEventEngine';
import { ContentReference } from '../Models/ContentLink';
import ComponentLoader from '../Loaders/ComponentLoader';

// Episerver taxonomy
import IContent from '../Models/IContent';

/**
 * The context for an Episerver SPA, enabling access to the core logic of the SPA.
 */
export interface IEpiserverContext {
    readonly serviceContainer: IServiceContainer;

    /**
     * The current language code
     */
    readonly Language : string;

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
     * Transform a path to a full URL that can be used to reference the Episerver instance
     * invoke the method without parameters to retrieve the base URL of the ContentCloud
     * instance.
     *
     * @param   path    The path inside the Content Cloud instance
     * @param   action  The Action to include in the URL
     * @returns The URL for the Content Cloud resource
     */
    getEpiserverUrl(path?: ContentReference, action?: string): URL;

    /**
     * The path for a specific content item, assuming that Content Cloud controls the URLs
     * and routing within the SPA.
     * 
     * @param {ContentReference} content The content to build the path for
     * @param {string} action  The action to run on the content, if any
     * @returns {string}
     */
    buildPath(content: ContentReference, action?: string): string;

    /**
     * Marker to indicate if the page is in edit mode
     * 
     * @returns True when edit mode is active
     */
    isInEditMode(): boolean;

    /**
     * Marker to indicate if the page is in edit mode and the on-page editing is active
     * 
     * @returns True when on-page editing is active
     */
    isEditable(): boolean;

    /**
     * Retrieve the currently routed content
     * 
     * @deprecated Use React-Router instead
     */
    getRoutedContent(): IContent;

    /**
     * @deprecated Use React-Router instead
     */
    hasRoutedContent(): boolean;

    /**
     * @deprecated Use React-Router instead
     */
    setRoutedContent(iContent ?: IContent) : IEpiserverContext;

    /**
     * Get the domain where the SPA is running. If it's configured to be
     * running at https://example.com/spa/, this method returns: https://example.com
     */
    getSpaDomain(): string;

    /*
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
}

export default IEpiserverContext;