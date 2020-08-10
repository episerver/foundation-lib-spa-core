import React, { ReactNode, ComponentType } from 'react';
import IContent from '../Models/IContent';
import { ComponentProps } from '../EpiComponent';
import ComponentNotFound from '../Components/Errors/ComponentNotFound';
import EpiserverSpaContext from '../Spa';

/**
 * The variable containing the pre-loaded modules, as injected by the
 * server side rendering process.
 */
declare let PreLoad: PreLoadedModuleList;

export type TComponentType = ComponentType<ComponentProps<IContent>>;
export type TComponentTypePromise = Promise<TComponentType>;

/**
 * Type defintiion to allow access to the pre-loaded modules
 */
interface PreLoadedModuleList {
    [key: string]: any
}

/**
 * Helper class that ensures components can be pre-loaded for server side
 * rendering whilest loading them asynchronously in browser to minimize the
 * initially included JavaScript.
 * 
 * For this script to work, the application must have the app/Components/ path
 * specified and all loadable components must reside within this path.
 */
export default class ComponentLoader
{
    /**
     * The cache of components already pre-loaded by this loader
     */
    protected cache : PreLoadedModuleList = {};

    /**
     * The list of promises currenlty being awaited by this loader, prior
     * to adding them to the cache.
     */
    protected loading : {[component: string]: Promise<ComponentType<any>> } = {};

    /**
     * Create a new instance and populate the cache with the data prepared
     * by the server side rendering.
     */
    public constructor() 
    {
        try {
            this.cache = PreLoad;
        } catch (e) {
            //Ignore
        }
    }

    /**
     * Verify if a component is in the cache
     * 
     * @param   component   The name/path of the component
     */
    public isPreLoaded(component: string): boolean
    {
        try {
            return this.cache["app/Components/" + component] ? true : false;
        } catch (e) {
            //Ignore exception
        }
        return false; //An exception occured, so not pre-loaded
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
            let c : ComponentType<P> = this.cache["app/Components/" + component];
            if (!c.displayName) c.displayName = component;
            return c;
        }
        if (throwOnUnknown) {
            throw `The component ${component} has not been pre-loaded!`;
        }
        return null;
    }

    public getPreLoadedComponent(component: string, props: ComponentProps<IContent>): ReactNode
    {
        if (this.isPreLoaded(component)) {
            let type = this.getPreLoadedType(component);
            return React.createElement(type as TComponentType, props);
        }
        throw `The component ${component} has not been pre-loaded!`;
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
            //Ignored on purpose
        }
        this.loading[component] = this.doLoadComponent(component).then(c => {
            delete this.loading[component];
            return c;
        });
        return this.loading[component];
    }

    protected async doLoadComponent(component: string) : Promise<TComponentType>
    {
        if (EpiserverSpaContext.isDebugActive()) console.debug('Loading component: '+component);
        const type = await (import(
            /* webpackInclude: /\.tsx$/ */
            /* webpackExclude: /\.noimport\.tsx$/ */
            /* webpackChunkName: "components" */
            /* webpackMode: "lazy" */
            /* webpackPrefetch: false */
            /* webpackPreload: false */
            "app/Components/" + component)
            .then(exports => {
                let c = exports.default;
                c.displayName = component;
                return c;
            }).catch(reason => {
                if (EpiserverSpaContext.isDebugActive()) {
                    console.error(`Error while importing ${component} due to:`, reason);
                }
                return ComponentNotFound;
            }));
        this.cache["app/Components/" + component] = type || ComponentNotFound;
        if (EpiserverSpaContext.isDebugActive()) console.debug('Loaded component: '+component);
        return type;
    }

    public async LoadComponent<P = ComponentProps<IContent>>(component: string, props: P): Promise<React.ReactElement<P, any>>
    {
        let type = await this.LoadType<P>(component);
        return React.createElement(type, props);
    }
};