"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEpiserver = void 0;
// Core SPA Libray
var Core = __importStar(require("./Library/Core"));
var InitServer_1 = __importDefault(require("./InitServer"));
var InitBrowser_1 = __importDefault(require("./InitBrowser"));
var Spa_1 = __importDefault(require("./Spa"));
// Namespace exports
exports.Core = __importStar(require("./Library/Core"));
exports.ContentDelivery = __importStar(require("./Library/ContentDelivery"));
exports.Layout = __importStar(require("./Library/Layout"));
exports.Routing = __importStar(require("./Library/Routing"));
exports.Taxonomy = __importStar(require("./Library/Taxonomy"));
exports.Services = __importStar(require("./Library/Services"));
exports.Components = __importStar(require("./Library/Components"));
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
function init(config, serviceContainer, containerElementId, ssr) {
    if (ssr === void 0) { ssr = false; }
    serviceContainer = serviceContainer || new Core.DefaultServiceContainer();
    if (ssr) {
        return InitServer_1.default(config, serviceContainer);
    }
    else {
        return InitBrowser_1.default(config, containerElementId, serviceContainer);
    }
}
exports.default = init;
/**
 * React Hook for function components to expose the Episerver context.
 *
 * @returns {IEpiserverContext} The current context instance
 */
function useEpiserver() {
    return Spa_1.default;
}
exports.useEpiserver = useEpiserver;
