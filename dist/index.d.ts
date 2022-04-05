import * as Core from './Library/Core';
import * as ServerSideRendering from './Library/ServerSideRendering';
import ServerContext from './ServerSideRendering/ServerContext';
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
export * as Loaders from './Library/Loaders';
export * as IndexedDB from './Library/IndexedDB';
export * as State from './Library/State';
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
export declare function init<B extends boolean>(config: Core.IConfig, serviceContainer?: Core.IServiceContainer, containerElementId?: string, ssr?: B, hydrateData?: ServerContext): B extends true ? ServerSideRendering.Response : void;
/**
 * Export all hooks in the global scope
 */
export * from './Hooks/Context';
export { default as AppGlobal } from './AppGlobal';
export default init;
