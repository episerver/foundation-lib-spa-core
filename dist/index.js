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
export * as Interfaces from './Library/Interfaces';
export * as Enums from './Library/Enums';
export * as Guards from './Library/Guards';
// Export Hooks
export * from './Hooks/Context';
export * from './Hooks/Utils';
// Export default context
export { default as AppGlobal } from './AppGlobal';
export { default as GlobalContext } from './Spa';
export const __doPreload__ = () => Promise.resolve({});
import DefaultServiceContainer from './Core/DefaultServiceContainer';
import initServer from './InitServer';
import initBrowser from './InitBrowser';
/**
 * Generic initialization function, usable for both Browser & Server side rendering
 *
 * @see     InitServer
 * @see     InitBrowser
 * @param   {IConfig}         config              The main configuration object
 * @param   {IServiceContainer}  serviceContainer    The service container to use, if a specific one is desired
 * @param   {string}            containerElementId  The element that should be populated by React-DOM on the Browser
 * @param   {boolean}           ssr                 Marker to hint Server Side rendering
 * @returns {ServerSideRenderingResponse|void}  The result of the initialization method invoked
 */
export function init(config, serviceContainer, containerElementId, ssr, preload) {
    serviceContainer = serviceContainer || new DefaultServiceContainer();
    if (ssr) {
        return initServer(config, serviceContainer);
    }
    else {
        return initBrowser(config, containerElementId, serviceContainer, preload);
    }
}
export default init;
//# sourceMappingURL=index.js.map