import ComponentLoader from './ComponentLoader';
/**
 * Type definition to be used within the main Episerver SPA configuration
 */
export declare type IComponentPreloadList = string[];
/**
 * Helper class to pre-load a list of components to either ensure hydration of a server-side
 * rendered page is going smoothly or it's pre-load components for quick rendering.
 */
export declare class ComponentPreLoader {
    /**
     * Perform the actual pre-loading of components, this is works by filling the cache of the
     * component loader.
     *
     * @param   config      The list of components to pre load
     * @param   loader      The ComponentLoader to use
     */
    static load(config: IComponentPreloadList, loader: ComponentLoader): Promise<boolean>;
    /**
     * Verify if all provided components are pre-loaded
     *
     * @param   config  The list of components to pre-load
     * @param   loader  The ComponentLoader to use
     */
    static isPreLoaded(config: IComponentPreloadList, loader: ComponentLoader): boolean;
}
export default ComponentPreLoader;
