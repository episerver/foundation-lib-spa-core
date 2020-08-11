
// Core SPA Libray
import * as Core from './Library/Core';
import initServer from './InitServer';
import initBrowser from './InitBrowser';
import SSRResponse from './ServerSideRendering/Response';
import Spa from './Spa';

// Namespace exports
export * as Core from './Library/Core';
export * as ContentDelivery from './Library/ContentDelivery';
export * as Layout from './Library/Layout';
export * as Routing from './Library/Routing';
export * as Taxonomy from './Library/Taxonomy';
export * as Services from './Library/Services';
export * as Components from './Library/Components';
export * as ComponentTypes from './Library/ComponentTypes';
export * as ServerSideRendering from './Library/ServerSideRendering';
export * as Tracking from './Library/Tracking';

/**
 * Generic initialization function, usable for both Browser & Server side rendering
 * 
 * @see     InitServer
 * @see     InitBrowser
 * @param   {Core.IConfig}         config              The main configuration object
 * @param   {ServiceContainer}  serviceContainer    The service container to use, if a specific one is desired
 * @param   {string}            containerElementId  The element that should be populated by React-DOM on the Browser
 * @param   {boolean}           ssr                 Marker to hint Server Side rendering
 * @returns {SSRResponse|void}  The result of the initialization method invoked
 */
export default function init (config: Core.IConfig, serviceContainer?: Core.IServiceContainer, containerElementId?: string, ssr: boolean = false) : SSRResponse | void
{
    serviceContainer = serviceContainer || new Core.DefaultServiceContainer();
    if (ssr) {
        return initServer(config, serviceContainer);
    } else {
        return initBrowser(config, containerElementId, serviceContainer);
    }
}

/**
 * React Hook for function components to expose the Episerver context.
 * 
 * @returns {IEpiserverContext} The current context instance
 */
export function useEpiserver() : Core.IEpiserverContext
{
    return Spa;
}