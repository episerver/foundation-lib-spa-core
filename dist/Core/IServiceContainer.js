export var DefaultServices;
(function (DefaultServices) {
    DefaultServices["ExecutionContext"] = "ExecutionContext";
    DefaultServices["EventEngine"] = "EventEngine";
    DefaultServices["Router"] = "Router";
    DefaultServices["Config"] = "Config";
    DefaultServices["Context"] = "Context";
    /**
     * The service that loads components into the SPA, enabling
     * dynamic loading of the components that build the SPA.
     */
    DefaultServices["ComponentLoader"] = "ComponentLoader";
    DefaultServices["ServerContext"] = "ServerContext";
    // Depricated V1 Services
    /**
     * @deprecated Upgrade to V2 API
     */
    DefaultServices["IContentRepository"] = "IContentRepository";
    /**
     * @deprecated Upgrade to V2 API
     */
    DefaultServices["ContentDeliveryApi"] = "ContentDeliveryAPI";
    // V2 Services
    /**
     * The wrapper for the Episerver ContentDelivery API, use this as a
     * low level library to connect with the ContentDelivery API
     */
    DefaultServices["ContentDeliveryAPI_V2"] = "IContentDeliveryAPI";
    /**
     * The high level icontent (and website) repository, this will be
     * configured to match the execution context of the SPA and may or
     * may not include caching / local storage.
     */
    DefaultServices["IContentRepository_V2"] = "IContentRepository_V2";
    /**
     * The TypeMapper provides specific class instances for the iContent
     * data retrieved through the ContentDeliveryAPI and/or
     * IContentRepository.
     */
    DefaultServices["TypeMapper"] = "TypeMapper";
    /**
     * Authorization services
     */
    DefaultServices["AuthService"] = "AuthService";
})(DefaultServices || (DefaultServices = {}));
