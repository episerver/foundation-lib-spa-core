import { BaseInitializableModule } from '../Core/IInitializableModule';
import { DefaultServices } from '../Core/IServiceContainer';
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
        const config = container.getService(DefaultServices.Config);
        // Register loaders
        this.addComponentLoaderToContainer(container, config);
        this.addTypeMapperToContainer(container, config);
    }
    addTypeMapperToContainer(container, config) {
        if (config.typeMapper) {
            const tm = new config.typeMapper();
            container.addService(DefaultServices.TypeMapper, tm);
        }
    }
    addComponentLoaderToContainer(container, config) {
        const cl = new ComponentLoader();
        cl.setDebug(config.enableDebug || false);
        if (config.componentLoaders) {
            config.componentLoaders.forEach(loader => {
                var _a, _b;
                if (isIComponentLoader(loader)) {
                    loader.setDebug(((_a = config.componentLoaders) === null || _a === void 0 ? void 0 : _a.debug) || config.enableDebug || false);
                    cl.addLoader(loader);
                }
                else {
                    const loaderInstance = cl.createLoader(loader, true);
                    loaderInstance.setDebug(((_b = config.componentLoaders) === null || _b === void 0 ? void 0 : _b.debug) || config.enableDebug || false);
                }
            });
        }
        container.addService(DefaultServices.ComponentLoader, cl);
    }
}
