import * as Core from './Library/Core';
import SSRResponse from './ServerSideRendering/Response';
export * as Core from './Library/Core';
export * as ContentDelivery from './Library/ContentDelivery';
export * as Layout from './Library/Layout';
export * as Routing from './Library/Routing';
export * as Taxonomy from './Library/Taxonomy';
export * as Services from './Library/Services';
export * as Comments from './Library/Components';
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
export default function init(config: Core.IConfig, serviceContainer?: Core.IServiceContainer, containerElementId?: string, ssr?: boolean): SSRResponse | void;
/**
 * React Hook for function components to expose the Episerver context.
 *
 * @returns {IEpiserverContext} The current context instance
 */
export declare function useEpiserver(): Core.IEpiserverContext;
