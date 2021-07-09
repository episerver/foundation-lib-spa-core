import { useContext, useState, createContext } from 'react';
/**
 * The React Context object for the Episerver context
 *
 * @constant { Context<IEpiserverContext | undefined> } Episerver
 */
export const Episerver = createContext(undefined);
export default Episerver;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { IEpiserverContext }
 */
export function useEpiserver() {
    const myContext = useContext(Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext;
}
/**
 * React Hook (for functional components) to retrieve the Episerver Service Container
 * from the nearest Provider in the virtual dom.
 *
 * @returns  { IServiceContainer }
 */
export function useServiceContainer() {
    return useEpiserver().serviceContainer;
}
/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
export function useIContentRepository() {
    return useServiceContainer().getService("IContentRepository_V2" /* IContentRepository_V2 */);
}
/**
 * Allow access to the current schema definition
 *
 * @returns The current schema descriptor
 */
export function useIContentSchema() {
    return useServiceContainer().getService("SchemaInfo" /* SchemaInfo */);
}
/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
export function useContentDeliveryAPI() {
    return useServiceContainer().getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
}
/**
 * Force update hook, returns a force-update method, which
 * will trigger a state change of the component.
 */
export function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value + 1); // update the state to force render
}
/**
 * Obtain access to the Server Context, either as static information for hydrating the
 * page client side or rendering it on the server side.
 *
 * @returns The Server Context of the current environment
 */
export function useServerSideRendering() {
    return useServiceContainer().getService("ServerContext" /* ServerContext */);
}
/**
 * Allow access to the global event engine, for globally distributed events.
 *
 * @returns The event engine
 */
export function useEvents() {
    return useServiceContainer().getService("EventEngine" /* EventEngine */);
}
export function useStore() {
    return useEpiserver().getStore();
}
export function useCmsState() {
    const state = useEpiserver().getStore().getState();
    return state?.OptiContentCloud;
}
//# sourceMappingURL=Context.js.map