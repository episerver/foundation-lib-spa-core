import { ReactNode, ComponentType, createElement, ReactElement } from 'react';
import IContent from '../Models/IContent';
import { ComponentProps } from '../EpiComponent';
import ComponentNotFound from '../Components/Errors/ComponentNotFound';
import CoreIComponentLoader from './CoreIComponentLoader';

/**
 * The variable containing the pre-loaded modules, as injected by the
 * server side rendering process.
 */
declare let PreLoad: LoadedModuleList;

export type TComponentType<T extends unknown = ComponentProps<IContent>> = ComponentType<T>;
export type TComponentTypePromise<T extends unknown = ComponentProps<IContent>> = Promise<TComponentType<T>>;

/**
 * Type defintiion to allow access to the pre-loaded modules
 */
export type LoadedModuleList = {
    [key: string]: ComponentType<unknown>
}
export type LoadingModuleList = {
    [key: string]: Promise<ComponentType>
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
    protected cache : LoadedModuleList = {};

    /**
     * The list of promises currenlty being awaited by this loader, prior
     * to adding them to the cache.
     */
    protected loading : LoadingModuleList = {};

    /**
     * The list of IComponent Loaders
     */
    protected loaders : IComponentLoaderList = [];

    /**
     * State of the debug
     */
    protected debug = false;

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

    public addLoader(loader: IComponentLoader) : IComponentLoader
    {
        loader.setDebug(this.debug);
        this.loaders.push(loader);
        this.loaders.sort((a, b) => a.order - b.order);
        return loader;
    }

    public addLoaders(loaders: IComponentLoaderList) : void
    {
        loaders.forEach(x => { x.setDebug(this.debug); this.loaders.push(x); });
        this.loaders.sort((a, b) => a.order - b.order);
    }

    public createLoader(loaderType : IComponentLoaderType, add = true) : IComponentLoader
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
    public getPreLoadedType<P = ComponentProps<IContent>>(component: string, throwOnUnknown = true) : ComponentType<P> | null
    {
        if (this.isPreLoaded(component)) {
            const c = this.cache[component];
            if (!c.displayName) c.displayName = component;
            return c as ComponentType<P>;
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
            return createElement(type as TComponentType, props);
        }
        throw new Error(`The component ${component} has not been pre-loaded!`);
    }

    /**
     * Inject a pre-loaded component into the ComponentLoader class
     * 
     * @param componentKey The key of the component, e.g. the module path used to load the component.
     * @param componentObject The loaded component
     * @returns true if added to cache, false otherwise
     */
    public InjectType<T = ComponentProps<IContent>, P extends ComponentType<T> = ComponentType<T>>(componentKey: string, componentObject: P) : boolean
    {
        if (this.cache[componentKey])
            return false;
        this.cache[componentKey] = componentObject as ComponentType<unknown>;
        return true;
    }

    public LoadType<P = ComponentProps<IContent>>(component: string) : Promise<ComponentType<P>>
    {
        if (this.isPreLoaded(component)) 
            return Promise.resolve(this.getPreLoadedType(component) as ComponentType<P>);
        
        try {
            if (this.loading[component]) {
                return this.loading[component] as Promise<ComponentType<P>>;
            }
        } catch (e) {
            // Ignored on purpose
        }

        this.loading[component] = this.doLoadComponentType<P>(component).then(c => {
            this.cache[component] = c as ComponentType<unknown>;
            delete this.loading[component];
            return c;
        }).catch(() => {
            this.cache[component] = ComponentNotFound;
            delete this.loading[component];
            return this.cache[component];
        }) as Promise<ComponentType<unknown>>;
        return this.loading[component] as Promise<ComponentType<P>>;
    }

    protected doLoadComponentType<PropsType = unknown>(component: string) : Promise<ComponentType<PropsType>>
    {
        const options = this.loaders.filter(x => x.canLoad(component));
        if (!options || options.length === 0)
            return Promise.resolve(ComponentNotFound as unknown as ComponentType<PropsType>);
        
        const tryOption = (idx : number) => new Promise<ComponentType<PropsType>>((resolve, reject) => {
            options[idx].load(component).then(c => {
                c.displayName = component;
                resolve(c as unknown as ComponentType<PropsType>);
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

    public async LoadComponent<P = ComponentProps<IContent>>(component: string, props: P): Promise<ReactElement<P>>
    {
        const type = await this.LoadType<P>(component);
        return createElement(type, props);
    }
}

export default ComponentLoader;