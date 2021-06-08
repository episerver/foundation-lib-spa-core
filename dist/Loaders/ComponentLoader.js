import { createElement } from 'react';
import ComponentNotFound from '../Components/Errors/ComponentNotFound';
import CoreIComponentLoader from './CoreIComponentLoader';
export const isIComponentLoader = (toTest) => {
    return typeof (toTest) === 'object' && typeof (toTest.load) === 'function';
};
/**
 * Helper class that ensures components can be pre-loaded for server side
 * rendering whilest loading them asynchronously in browser to minimize the
 * initially included JavaScript.
 *
 * For this script to work, the application must have the app/Components/ path
 * specified and all loadable components must reside within this path.
 */
export class ComponentLoader {
    /**
     * Create a new instance and populate the cache with the data prepared
     * by the server side rendering.
     */
    constructor() {
        /**
         * The cache of components already pre-loaded by this loader
         */
        this.cache = {};
        /**
         * The list of promises currenlty being awaited by this loader, prior
         * to adding them to the cache.
         */
        this.loading = {};
        /**
         * The list of IComponent Loaders
         */
        this.loaders = [];
        /**
         * State of the debug
         */
        this.debug = false;
        this.loaders = [new CoreIComponentLoader()];
        try {
            this.cache = PreLoad || {};
        }
        catch (e) {
            this.cache = {};
        }
    }
    addLoader(loader) {
        loader.setDebug(this.debug);
        this.loaders.push(loader);
        this.loaders.sort((a, b) => a.order - b.order);
        return loader;
    }
    addLoaders(loaders) {
        loaders.forEach(x => { x.setDebug(this.debug); this.loaders.push(x); });
        this.loaders.sort((a, b) => a.order - b.order);
    }
    createLoader(loaderType, add = true) {
        const loader = new loaderType();
        if (add)
            this.addLoader(loader);
        return loader;
    }
    setDebug(debug) {
        this.debug = debug;
        this.loaders.forEach(x => x.setDebug(debug));
    }
    /**
     * Verify if a component is in the cache
     *
     * @param   component   The name/path of the component
     */
    isPreLoaded(component) {
        try {
            return this.cache[component] ? true : false;
        }
        catch (e) {
            // Ignore exception
        }
        return false; // An exception occured, so not pre-loaded
    }
    /**
     * Load a component type synchronously from the cache
     *
     * @param   component       The name/path of the component
     * @param   throwOnUnknown  Wether or not an error must be thrown if the component is not in the cache
     */
    getPreLoadedType(component, throwOnUnknown = true) {
        if (this.isPreLoaded(component)) {
            const c = this.cache[component];
            if (!c.displayName)
                c.displayName = component;
            return c;
        }
        if (throwOnUnknown) {
            throw new Error(`The component ${component} has not been pre-loaded!`);
        }
        return null;
    }
    getPreLoadedComponent(component, props) {
        if (this.isPreLoaded(component)) {
            const type = this.getPreLoadedType(component);
            return createElement(type, props);
        }
        throw new Error(`The component ${component} has not been pre-loaded!`);
    }
    LoadType(component) {
        if (this.isPreLoaded(component))
            return Promise.resolve(this.getPreLoadedType(component));
        try {
            if (this.loading[component]) {
                return this.loading[component];
            }
        }
        catch (e) {
            // Ignored on purpose
        }
        this.loading[component] = this.doLoadComponentType(component).then(c => {
            this.cache[component] = c;
            delete this.loading[component];
            return c;
        }).catch(() => {
            this.cache[component] = ComponentNotFound;
            delete this.loading[component];
            return this.cache[component];
        });
        return this.loading[component];
    }
    doLoadComponentType(component) {
        const options = this.loaders.filter(x => x.canLoad(component));
        if (!options || options.length === 0)
            return Promise.resolve(ComponentNotFound);
        const tryOption = (idx) => new Promise((resolve, reject) => {
            options[idx].load(component).then(c => {
                c.displayName = component;
                resolve(c);
            }).catch(e => {
                if (this.debug)
                    console.debug(`CL: Error loading ${component}, resulting in error`, e);
                if (options[idx + 1]) {
                    tryOption(idx + 1).then(sc => resolve(sc)).catch(se => reject(se));
                }
                else {
                    reject(`No loader was able to load ${component}`);
                }
            });
        });
        return tryOption(0);
    }
    async LoadComponent(component, props) {
        const type = await this.LoadType(component);
        return createElement(type, props);
    }
}
export default ComponentLoader;
//# sourceMappingURL=ComponentLoader.js.map