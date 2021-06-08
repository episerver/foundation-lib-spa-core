import { BaseInitializableModule } from '../Core/IInitializableModule';
import ComponentLoader, { isIComponentLoader } from './ComponentLoader';
export default class LoadersModule extends BaseInitializableModule {
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
        const cl = new ComponentLoader();
        const clDebug = (typeof (config.componentLoaders?.debug) === 'undefined' ? config.enableDebug : config.componentLoaders?.debug) || false;
        cl.setDebug(clDebug);
        if (config.componentLoaders) {
            config.componentLoaders.forEach(loader => isIComponentLoader(loader) ? cl.addLoader(loader) : cl.createLoader(loader, true));
        }
        container.addService("ComponentLoader" /* ComponentLoader */, cl);
    }
}
//# sourceMappingURL=LoadersModule.js.map