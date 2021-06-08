"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGlobal = exports.init = exports.GlobalContext = exports.Guards = exports.Enums = exports.Interfaces = exports.State = exports.IndexedDB = exports.Loaders = exports.Tracking = exports.ServerSideRendering = exports.ComponentTypes = exports.Components = exports.Services = exports.Taxonomy = exports.Routing = exports.Layout = exports.ContentDelivery = exports.Core = void 0;
const tslib_1 = require("tslib");
// Core SPA Libray
const Core = require("./Library/Core");
const InitServer_1 = require("./InitServer");
const InitBrowser_1 = require("./InitBrowser");
// Namespace exports
exports.Core = require("./Library/Core");
exports.ContentDelivery = require("./Library/ContentDelivery");
exports.Layout = require("./Library/Layout");
exports.Routing = require("./Library/Routing");
exports.Taxonomy = require("./Library/Taxonomy");
exports.Services = require("./Library/Services");
exports.Components = require("./Library/Components");
exports.ComponentTypes = require("./Library/ComponentTypes");
exports.ServerSideRendering = require("./Library/ServerSideRendering");
exports.Tracking = require("./Library/Tracking");
exports.Loaders = require("./Library/Loaders");
exports.IndexedDB = require("./Library/IndexedDB");
exports.State = require("./Library/State");
exports.Interfaces = require("./Library/Interfaces");
exports.Enums = require("./Library/Enums");
exports.Guards = require("./Library/Guards");
// Export default context
var Spa_1 = require("./Spa");
Object.defineProperty(exports, "GlobalContext", { enumerable: true, get: function () { return Spa_1.default; } });
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
/**
 * Export all hooks in the global scope
 */
tslib_1.__exportStar(require("./Hooks/Context"), exports);
var AppGlobal_1 = require("./AppGlobal");
Object.defineProperty(exports, "AppGlobal", { enumerable: true, get: function () { return AppGlobal_1.default; } });
exports.default = init;
//# sourceMappingURL=index.js.map