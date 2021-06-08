import React, { ReactNode, ComponentType } from 'react';
import IContent from '../Models/IContent';
import { ComponentProps } from '../EpiComponent';
export declare type TComponentType<T extends unknown = ComponentProps<IContent>> = ComponentType<T>;
export declare type TComponentTypePromise<T extends unknown = ComponentProps<IContent>> = Promise<TComponentType<T>>;
/**
 * Type defintiion to allow access to the pre-loaded modules
 */
export declare type LoadedModuleList = {
    [key: string]: ComponentType;
};
export declare type LoadingModuleList = {
    [key: string]: Promise<ComponentType>;
};
export declare type IComponentLoaderList = IComponentLoader[];
export declare type IComponentLoaderConfig = (IComponentLoader | IComponentLoaderType)[] & {
    debug?: boolean;
};
export declare const isIComponentLoader: (toTest: IComponentLoader | IComponentLoaderType) => toTest is IComponentLoader;
export interface IComponentLoader {
    order: number;
    canLoad: (componentName: string) => boolean;
    load: <T extends unknown = ComponentProps<IContent>>(componentName: string) => TComponentTypePromise<T>;
    setDebug: (debug: boolean) => void;
}
export declare type IComponentLoaderType = new () => IComponentLoader;
/**
 * Helper class that ensures components can be pre-loaded for server side
 * rendering whilest loading them asynchronously in browser to minimize the
 * initially included JavaScript.
 *
 * For this script to work, the application must have the app/Components/ path
 * specified and all loadable components must reside within this path.
 */
export declare class ComponentLoader {
    /**
     * The cache of components already pre-loaded by this loader
     */
    protected cache: LoadedModuleList;
    /**
     * The list of promises currenlty being awaited by this loader, prior
     * to adding them to the cache.
     */
    protected loading: LoadingModuleList;
    /**
     * The list of IComponent Loaders
     */
    protected loaders: IComponentLoaderList;
    /**
     * State of the debug
     */
    protected debug: boolean;
    /**
     * Create a new instance and populate the cache with the data prepared
     * by the server side rendering.
     */
    constructor();
    addLoader(loader: IComponentLoader): IComponentLoader;
    addLoaders(loaders: IComponentLoaderList): void;
    createLoader(loaderType: IComponentLoaderType, add?: boolean): IComponentLoader;
    setDebug(debug: boolean): void;
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
    protected doLoadComponentType(component: string): Promise<ComponentType>;
    LoadComponent<P = ComponentProps<IContent>>(component: string, props: P): Promise<React.ReactElement<P>>;
}
export default ComponentLoader;
