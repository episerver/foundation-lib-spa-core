"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Core interfaces
const IInitializableModule_1 = require("../Core/IInitializableModule");
const RoutedComponent_1 = require("../Components/RoutedComponent");
class RoutingModule extends IInitializableModule_1.BaseInitializableModule {
    constructor() {
        super(...arguments);
        this.name = "Episerver CMS Routing";
        this.SortOrder = 20;
    }
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    ConfigureContainer(container) {
        const config = container.getService("Config" /* Config */);
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
//# sourceMappingURL=RoutingModule.js.map