import * as Core from './Library/Core';
import * as ServerSideRendering from './Library/ServerSideRendering';
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
export declare function init(config: Core.IConfig, serviceContainer?: Core.IServiceContainer, containerElementId?: string, ssr?: boolean): ServerSideRendering.Response | void;
export default init;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IEpiserverContext }
 */
export declare const useEpiserver: () => Core.IEpiserverContext;
/**
 * React Hook (for functional components) to retrieve the Episerver Service Container
 * from the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IServiceContainer }
 */
export declare const useServiceContainer: () => Core.IServiceContainer;
/**
 * Helper method to get the global scope at any location within the SPA, this is either
 * the 'window' or 'global' variable, depending on execution context.
 *
 * @return { Window|any }
 */
export declare const getGlobalScope: () => any;
