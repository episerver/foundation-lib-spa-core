import IEpiserverContext from './IEpiserverContext';
export declare const enum DefaultServices {
    ExecutionContext = "ExecutionContext",
    EventEngine = "EventEngine",
    Router = "Router",
    Config = "Config",
    Context = "Context",
    /**
     * The service that loads components into the SPA, enabling
     * dynamic loading of the components that build the SPA.
     */
    ComponentLoader = "ComponentLoader",
    ServerContext = "ServerContext",
    /**
     * @deprecated Upgrade to V2 API
     */
    IContentRepository = "IContentRepository",
    /**
     * @deprecated Upgrade to V2 API
     */
    ContentDeliveryApi = "ContentDeliveryAPI",
    /**
     * The wrapper for the Episerver ContentDelivery API, use this as a
     * low level library to connect with the ContentDelivery API
     */
    ContentDeliveryAPI_V2 = "IContentDeliveryAPI",
    /**
     * The high level icontent (and website) repository, this will be
     * configured to match the execution context of the SPA and may or
     * may not include caching / local storage.
     */
    IContentRepository_V2 = "IContentRepository_V2",
    /**
     * The TypeMapper provides specific class instances for the iContent
     * data retrieved through the ContentDeliveryAPI and/or
     * IContentRepository.
     */
    TypeMapper = "TypeMapper",
    /**
     * Authorization services
     */
    AuthService = "AuthService",
    /**
     *
     */
    SchemaInfo = "SchemaInfo"
}
export interface IContainerAwareService {
    setServiceContainer(container: IServiceContainer): void;
}
export interface IContextAwareService {
    setContext(container: IEpiserverContext): void;
}
export declare function isContainerAwareService(toTest: unknown): toTest is IContainerAwareService;
export declare function isContextAwareService(toTest: unknown): toTest is IContextAwareService;
export interface IServiceContainer {
    /**
     * Add a service to the container if has not been added before
     *
     * @param {string} key      The identifier in the container
     * @param {object} service  The actual service implementation
     */
    addService<T>(key: string, service: T): IServiceContainer;
    /**
     * Add a service factory, enabling the service to be created when
     * used for the first time.
     *
     * @param key The identifier in the container
     * @param factory The service factory, invoked when the service is requested for the first time
     */
    addFactory<T>(key: string, factory: (container: IServiceContainer) => T): IServiceContainer;
    /**
     * Add or update a service to the container
     *
     * @param {string} key      The identifier in the container
     * @param {object} service  The actual service implementation
     */
    setService<T>(key: string, service: T): IServiceContainer;
    /**
     * Set a service factory, enabling the service to be created when
     * used for the first time.
     *
     * @param key The identifier in the container
     * @param factory The service factory, invoked when the service is requested for the first time
     */
    setFactory<T>(key: string, factory: (container: IServiceContainer) => T): IServiceContainer;
    /**
     * Check if a service key has been registered
     *
     * @param {string} key      The identifier of the container
     */
    hasService(key: string): boolean;
    /**
     * Retrieve a service by name
     *
     * @param   {string}    key      The service name
     * @param   {function}  guard    Check function that returns a boolean to indicate if the service meets the criteria
     * @returns {object}    The service (not checked by implementation)
     */
    getService<T>(key: string, guard?: (toTest: unknown) => toTest is T): T;
    /**
     * Extend an existing service by applying the members of the provided
     * object on the existing service. Use carefully as this could overwrite
     * or corrupt the state of an object. If used correctly it can be used
     * to create a runtime object composed from multiple types.
     *
     * @param {string} key          The service name
     * @param {object} extension    The extension to be added to the object
     */
    extendService<T>(key: string, extension: T): IServiceContainer;
}
export default IServiceContainer;
