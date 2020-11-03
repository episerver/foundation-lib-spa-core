"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultServices = void 0;
var DefaultServices;
(function (DefaultServices) {
    // V1 Services
    /**
     * @deprecated Upgrade to V2 API
     */
    DefaultServices["ContentDeliveryApi"] = "ContentDeliveryAPI";
    DefaultServices["ExecutionContext"] = "ExecutionContext";
    DefaultServices["EventEngine"] = "EventEngine";
    DefaultServices["Router"] = "Router";
    DefaultServices["Config"] = "Config";
    DefaultServices["Context"] = "Context";
    DefaultServices["ComponentLoader"] = "ComponentLoader";
    /**
     * @deprecated Upgrade to V2 API
     */
    DefaultServices["IContentRepository"] = "IContentRepository";
    // V2 Services
    DefaultServices["ContentDeliveryAPI_V2"] = "ContentDeliveryAPI_V2";
    DefaultServices["IContentRepository_V2"] = "IContentRepository_V2";
})(DefaultServices = exports.DefaultServices || (exports.DefaultServices = {}));
