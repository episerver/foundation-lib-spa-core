// Core SPA Libray
import * as Core from './Library/Core';
import * as ContextProvider from './Hooks/Context';
import initServer from './InitServer';
import initBrowser from './InitBrowser';
import AppGlobal from './AppGlobal';
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
export * as ContextProvider from './Hooks/Context';
export * as Loaders from './Library/Loaders';
export * as IndexedDB from './Library/IndexedDB';
/**
 * Generic initialization function, usable for both Browser & Server side rendering
 *
 * @see     InitServer
 * @see     InitBrowser
 * @param   {Core.IConfig}         config              The main configuration object
 * @param   {Core.IServiceContainer}  serviceContainer    The service container to use, if a specific one is desired
 * @param   {string}            containerElementId  The element that should be populated by React-DOM on the Browser
 * @param   {boolean}           ssr                 Marker to hint Server Side rendering
 * @returns {ServerSideRendering.Response|void}  The result of the initialization method invoked
 */
export function init(config, serviceContainer, containerElementId, ssr) {
    serviceContainer = serviceContainer || new Core.DefaultServiceContainer();
    if (ssr) {
        return initServer(config, serviceContainer);
    }
    else {
        return initBrowser(config, containerElementId, serviceContainer);
    }
}
export default init;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IEpiserverContext }
 */
export const useEpiserver = ContextProvider.useEpiserver;
/**
 * React Hook (for functional components) to retrieve the Episerver Service Container
 * from the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IServiceContainer }
 */
export const useServiceContainer = ContextProvider.useServiceContainer;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
export const useIContentRepository = ContextProvider.useIContentRepository;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
export const useContentDeliveryAPI = ContextProvider.useContentDeliveryAPI;
/**
 * Retrieve the accessor for the server side rendering data
 */
export const useServerSideRendering = ContextProvider.useServerSideRendering;
/**
 * Retrieve the events accessor
 */
export const useEvents = ContextProvider.useEvents;
/**
 * Helper method to get the global scope at any location within the SPA, this is either
 * the 'window' or 'global' variable, depending on execution context.
 *
 * @return { Window|any }
 */
export const getGlobalScope = AppGlobal;
