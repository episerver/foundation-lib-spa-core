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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalScope = exports.useServiceContainer = exports.useEpiserver = exports.init = exports.ContextProvider = exports.Tracking = exports.ServerSideRendering = exports.ComponentTypes = exports.Components = exports.Services = exports.Taxonomy = exports.Routing = exports.Layout = exports.ContentDelivery = exports.Core = void 0;
// Core SPA Libray
const Core = __importStar(require("./Library/Core"));
const ContextProvider = __importStar(require("./Hooks/Context"));
const InitServer_1 = __importDefault(require("./InitServer"));
const InitBrowser_1 = __importDefault(require("./InitBrowser"));
const AppGlobal_1 = __importDefault(require("./AppGlobal"));
// Namespace exports
exports.Core = __importStar(require("./Library/Core"));
exports.ContentDelivery = __importStar(require("./Library/ContentDelivery"));
exports.Layout = __importStar(require("./Library/Layout"));
exports.Routing = __importStar(require("./Library/Routing"));
exports.Taxonomy = __importStar(require("./Library/Taxonomy"));
exports.Services = __importStar(require("./Library/Services"));
exports.Components = __importStar(require("./Library/Components"));
exports.ComponentTypes = __importStar(require("./Library/ComponentTypes"));
exports.ServerSideRendering = __importStar(require("./Library/ServerSideRendering"));
exports.Tracking = __importStar(require("./Library/Tracking"));
exports.ContextProvider = __importStar(require("./Hooks/Context"));
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
function init(config, serviceContainer, containerElementId, ssr) {
    serviceContainer = serviceContainer || new Core.DefaultServiceContainer();
    if (ssr) {
        return InitServer_1.default(config, serviceContainer);
    }
    else {
        return InitBrowser_1.default(config, containerElementId, serviceContainer);
    }
}
exports.init = init;
exports.default = init;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IEpiserverContext }
 */
exports.useEpiserver = ContextProvider.useEpiserver;
/**
 * React Hook (for functional components) to retrieve the Episerver Service Container
 * from the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IServiceContainer }
 */
exports.useServiceContainer = ContextProvider.useServiceContainer;
/**
 * Helper method to get the global scope at any location within the SPA, this is either
 * the 'window' or 'global' variable, depending on execution context.
 *
 * @return { Window|any }
 */
exports.getGlobalScope = AppGlobal_1.default;
