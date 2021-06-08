"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IInitializableModule_1 = require("../Core/IInitializableModule");
const ComponentLoader_1 = require("./ComponentLoader");
class LoadersModule extends IInitializableModule_1.BaseInitializableModule {
    constructor() {
        super(...arguments);
        /**
         * The relative sequence number of the module
         */
        this.SortOrder = 30;
        /**
         * The name of the module, as reported by the SPA
         *
         * @var { string }
         */
        this.name = "Episerver Type & Component Loaders";
    }
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    ConfigureContainer(container) {
        // Get Application Config
        const config = container.getService("Config" /* Config */);
        // Register loaders
        this.addComponentLoaderToContainer(container, config);
        this.addTypeMapperToContainer(container, config);
    }
    addTypeMapperToContainer(container, config) {
        if (config.typeMapper) {
            const tm = new config.typeMapper();
            container.addService("TypeMapper" /* TypeMapper */, tm);
        }
    }
    addComponentLoaderToContainer(container, config) {
        var _a, _b;
        const cl = new ComponentLoader_1.default();
        const clDebug = (typeof ((_a = config.componentLoaders) === null || _a === void 0 ? void 0 : _a.debug) === 'undefined' ? config.enableDebug : (_b = config.componentLoaders) === null || _b === void 0 ? void 0 : _b.debug) || false;
        cl.setDebug(clDebug);
        if (config.componentLoaders) {
            config.componentLoaders.forEach(loader => ComponentLoader_1.isIComponentLoader(loader) ? cl.addLoader(loader) : cl.createLoader(loader, true));
        }
        container.addService("ComponentLoader" /* ComponentLoader */, cl);
    }
}
exports.default = LoadersModule;
//# sourceMappingURL=LoadersModule.js.map