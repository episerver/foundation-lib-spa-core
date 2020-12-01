import React, { ReactNode, ComponentType } from 'react';
import IContent from '../Models/IContent';
import { ComponentProps } from '../EpiComponent';
import ComponentNotFound from '../Components/Errors/ComponentNotFound';
import CoreIComponentLoader from './CoreIComponentLoader';

/**
 * The variable containing the pre-loaded modules, as injected by the
 * server side rendering process.
 */
declare let PreLoad: LoadedModuleList<any>;

export type TComponentType<T extends unknown = ComponentProps<IContent>> = ComponentType<T>;
export type TComponentTypePromise<T extends unknown = ComponentProps<IContent>> = Promise<TComponentType<T>>;

/**
 * Type defintiion to allow access to the pre-loaded modules
 */
export type LoadedModuleList<T = ComponentProps<IContent>> = {
    [key: string]: TComponentType<T>
}
export type LoadingModuleList<T = ComponentProps<IContent>> = {
    [key: string]: TComponentTypePromise<T>
}
export type IComponentLoaderList = IComponentLoader[];
export type IComponentLoaderConfig = (IComponentLoader | IComponentLoaderType)[] & { debug?: boolean }
export const isIComponentLoader : (toTest : IComponentLoader | IComponentLoaderType) => toTest is IComponentLoader = (toTest : IComponentLoader | IComponentLoaderType) : toTest is IComponentLoader => {
    return typeof(toTest) === 'object' && typeof(toTest.load) === 'function';
}

export interface IComponentLoader {
    order: number
    canLoad: (componentName: string) => boolean
    load: <T extends unknown = ComponentProps<IContent>>(componentName: string) => TComponentTypePromise<T>
    setDebug: (debug: boolean) => void
}
export type IComponentLoaderType = new() => IComponentLoader

/**
 * Helper class that ensures components can be pre-loaded for server side
 * rendering whilest loading them asynchronously in browser to minimize the
 * initially included JavaScript.
 * 
 * For this script to work, the application must have the app/Components/ path
 * specified and all loadable components must reside within this path.
 */
export class ComponentLoader
{
    /**
     * The cache of components already pre-loaded by this loader
     */
    protected cache : LoadedModuleList<any> = {};

    /**
     * The list of promises currenlty being awaited by this loader, prior
     * to adding them to the cache.
     */
    protected loading : LoadingModuleList<any> = {};

    /**
     * The list of IComponent Loaders
     */
    protected loaders : IComponentLoaderList = [];

    /**
     * State of the debug
     */
    protected debug : boolean = false;

    /**
     * Create a new instance and populate the cache with the data prepared
     * by the server side rendering.
     */
    public constructor() 
    {
        this.loaders = [ new CoreIComponentLoader() ]
        try {
            this.cache = PreLoad || {};
        } catch (e) {
            this.cache = {};
        }
    }

    public addLoader(loader: IComponentLoader)
    {
        loader.setDebug(this.debug);
        this.loaders.push(loader);
        this.loaders.sort((a, b) => a.order - b.order);
    }

    public addLoaders(loaders: IComponentLoaderList)
    {
        const me = this;
        loaders.forEach(x => { x.setDebug(me.debug); me.loaders.push(x); });
        this.loaders.sort((a, b) => a.order - b.order);
    }

    public createLoader(loaderType : IComponentLoaderType, add : boolean = true) : IComponentLoader
    {
        const loader : IComponentLoader = new loaderType();
        if (add) this.addLoader(loader);
        return loader;
    }

    public setDebug(debug: boolean) : void 
    {
        this.debug = debug;
        this.loaders.forEach(x => x.setDebug(debug));
    }

    /**
     * Verify if a component is in the cache
     * 
     * @param   component   The name/path of the component
     */
    public isPreLoaded(component: string): boolean
    {
        try {
            return this.cache[component] ? true : false;
        } catch (e) {
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
    public getPreLoadedType<P = ComponentProps<IContent>>(component: string, throwOnUnknown: boolean = true) : ComponentType<P> | null
    {
        if (this.isPreLoaded(component)) {
            const c : ComponentType<P> = this.cache[component];
            if (!c.displayName) c.displayName = component;
            return c;
        }
        if (throwOnUnknown) {
            throw new Error(`The component ${component} has not been pre-loaded!`);
        }
        return null;
    }

    public getPreLoadedComponent(component: string, props: ComponentProps<IContent>): ReactNode
    {
        if (this.isPreLoaded(component)) {
            const type = this.getPreLoadedType(component);
            return React.createElement(type as TComponentType, props);
        }
        throw new Error(`The component ${component} has not been pre-loaded!`);
    }

    public LoadType<P = ComponentProps<IContent>>(component: string) : Promise<ComponentType<P>>
    {
        if (this.isPreLoaded(component)) {
            return Promise.resolve<ComponentType<P>>(this.getPreLoadedType(component) as ComponentType<P>);
        }
        try {
            if (this.loading[component]) {
                return this.loading[component];
            }
        } catch (e) {
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

    protected doLoadComponentType(component: string) : Promise<TComponentType>
    {
        const options = this.loaders.filter(x => x.canLoad(component));
        if (!options || options.length === 0) {
            return Promise.resolve(ComponentNotFound);
        }
        const tryOption = (idx : number) => new Promise<TComponentType>((resolve, reject) => {
            options[idx].load(component).then(c => {
                c.displayName = component;
                resolve(c);
            }).catch(e => {
                if (this.debug) console.debug(`CL: Error loading ${ component }, resulting in error`, e);
                if (options[idx + 1]) {
                    tryOption(idx + 1).then(sc => resolve(sc)).catch(se => reject(se));
                } else {
                    reject(`No loader was able to load ${ component }`);
                }
            })
        });
        return tryOption(0);
    }

    /* protected async doLoadComponent(component: string) : Promise<TComponentType>
    {
        if (EpiserverSpaContext.isDebugActive()) console.debug('Loading component: '+component);
        const type = await (import(
            /* webpackInclude: /\.tsx$/ */
            /* webpackExclude: /\.noimport\.tsx$/ */
            /* webpackChunkName: "components" */
            /* webpackMode: "lazy" */
            /* webpackPrefetch: false */
            /* webpackPreload: false *//*
            "app/Components/" + component)
            .then(exports => {
                const c = exports.default;
                c.displayName = component;
                return c;
            }).catch(reason => {
                if (EpiserverSpaContext.isDebugActive()) {
                    console.error(`Error while importing ${component} due to:`, reason);
                }
                return ComponentNotFound;
            }));
        this.cache[component] = type || ComponentNotFound;
        if (EpiserverSpaContext.isDebugActive()) console.debug('Loaded component: '+component);
        return type;
    }*/

    public async LoadComponent<P = ComponentProps<IContent>>(component: string, props: P): Promise<React.ReactElement<P, any>>
    {
        const type = await this.LoadType<P>(component);
        return React.createElement(type, props);
    }
};
export default ComponentLoader;