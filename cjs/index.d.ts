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
export * from './Hooks/Context';
export * from './Hooks/Utils';
export { default as AppGlobal } from './AppGlobal';
export { default as GlobalContext } from './Spa';
export { ImplementationPreLoader } from './Loaders/ComponentPreLoader';
import { ImplementationPreLoader } from './Loaders/ComponentPreLoader';
export declare const __doPreload__: ImplementationPreLoader;
import IConfig from './AppConfig';
import IServiceContainer from './Core/IServiceContainer';
import ServerSideRenderingResponse from './ServerSideRendering/ServerSideRenderingResponse';
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
export declare function init<B extends boolean>(config: IConfig, serviceContainer?: IServiceContainer, containerElementId?: string, ssr?: B, preload?: ImplementationPreLoader): B extends true ? ServerSideRenderingResponse : Promise<void>;
export default init;
