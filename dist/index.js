// Core SPA Libray
import * as Core from './Library/Core';
import initServer from './InitServer';
import initBrowser from './InitBrowser';
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
export function init(config, serviceContainer, containerElementId, ssr) {
    serviceContainer = serviceContainer || new Core.DefaultServiceContainer();
    if (ssr) {
        return initServer(config, serviceContainer);
    }
    else {
        return initBrowser(config, containerElementId, serviceContainer);
    }
}
/**
 * Export all hooks in the global scope
 */
export * from './Hooks/Context';
export { default as AppGlobal } from './AppGlobal';
export default init;
//# sourceMappingURL=index.js.map