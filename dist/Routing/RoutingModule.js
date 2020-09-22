"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Core interfaces
const IInitializableModule_1 = require("../Core/IInitializableModule");
const IServiceContainer_1 = require("../Core/IServiceContainer");
const RoutedComponent_1 = __importDefault(require("../Components/RoutedComponent"));
class RoutingModule extends IInitializableModule_1.BaseInitializableModule {
    constructor() {
        super(...arguments);
        this.name = "Episerver CMS Routing";
    }
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    ConfigureContainer(container) {
        const config = container.getService(IServiceContainer_1.DefaultServices.Config);
        let haveStar = false;
        config.routes = config.routes || [];
        config.routes.forEach(c => haveStar = haveStar || c.path === "*");
        if (!haveStar)
            config.routes.push({
                path: "*",
                component: RoutedComponent_1.default
            });
    }
}
exports.default = RoutingModule;
