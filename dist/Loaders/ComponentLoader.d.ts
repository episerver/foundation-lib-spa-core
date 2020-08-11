import React, { ReactNode, ComponentType } from 'react';
import IContent from '../Models/IContent';
import { ComponentProps } from '../EpiComponent';
export declare type TComponentType = ComponentType<ComponentProps<IContent>>;
export declare type TComponentTypePromise = Promise<TComponentType>;
/**
 * Type defintiion to allow access to the pre-loaded modules
 */
interface PreLoadedModuleList {
    [key: string]: any;
}
/**
 * Helper class that ensures components can be pre-loaded for server side
 * rendering whilest loading them asynchronously in browser to minimize the
 * initially included JavaScript.
 *
 * For this script to work, the application must have the app/Components/ path
 * specified and all loadable components must reside within this path.
 */
export default class ComponentLoader {
    /**
     * The cache of components already pre-loaded by this loader
     */
    protected cache: PreLoadedModuleList;
    /**
     * The list of promises currenlty being awaited by this loader, prior
     * to adding them to the cache.
     */
    protected loading: {
        [component: string]: Promise<ComponentType<any>>;
    };
    /**
     * Create a new instance and populate the cache with the data prepared
     * by the server side rendering.
     */
    constructor();
    /**
     * Verify if a component is in the cache
     *
     * @param   component   The name/path of the component
     */
    isPreLoaded(component: string): boolean;
    /**
     * Load a component type synchronously from the cache
     *
     * @param   component       The name/path of the component
     * @param   throwOnUnknown  Wether or not an error must be thrown if the component is not in the cache
     */
    getPreLoadedType<P = ComponentProps<IContent>>(component: string, throwOnUnknown?: boolean): ComponentType<P> | null;
    getPreLoadedComponent(component: string, props: ComponentProps<IContent>): ReactNode;
    LoadType<P = ComponentProps<IContent>>(component: string): Promise<ComponentType<P>>;
    protected doLoadComponent(component: string): Promise<TComponentType>;
    LoadComponent<P = ComponentProps<IContent>>(component: string, props: P): Promise<React.ReactElement<P, any>>;
}
export {};
