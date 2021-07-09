"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentPreLoader = void 0;
const tslib_1 = require("tslib");
/**
 * Helper class to pre-load a list of components to either ensure hydration of a server-side
 * rendered page is going smoothly or it's pre-load components for quick rendering.
 */
class ComponentPreLoader {
    /**
     * Perform the actual pre-loading of components, this is works by filling the cache of the
     * component loader.
     *
     * @param   config      The list of components to pre load
     * @param   loader      The ComponentLoader to use
     */
    static load(config, loader) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (config && config.length > 0) {
                const list = config.map((c) => loader.LoadType(c).catch((e) => e));
                try {
                    yield Promise.all(list);
                    return true;
                }
                catch (e) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * Use the implementation preloader to perform the pre-loading and inject the components into the ComponentLoader
     *
     * @param logic
     * @param loader
     * @returns
     */
    static loadComponents(logic, loader) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return logic ? logic().then(config => {
                for (const modulePath in config)
                    loader.InjectType(modulePath, config[modulePath]);
                return loader;
            }) : Promise.resolve(loader);
        });
    }
    /**
     * Verify if all provided components are pre-loaded
     *
     * @param   config  The list of components to pre-load
     * @param   loader  The ComponentLoader to use
     */
    static isPreLoaded(config, loader) {
        let allPreLoaded = true;
        if (config && config.length > 0) {
            config.forEach((c) => {
                allPreLoaded = allPreLoaded && loader.isPreLoaded(c);
            });
        }
        return allPreLoaded;
    }
}
exports.ComponentPreLoader = ComponentPreLoader;
exports.default = ComponentPreLoader;
//# sourceMappingURL=ComponentPreLoader.js.map