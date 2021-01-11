import React, { useContext, useState } from 'react';
import { DefaultServices } from '../Core/IServiceContainer';
/**
 * The React Context object for the Episerver context
 *
 * @constant { React.Context<IEpiserverContext | undefined> } Episerver
 */
export const Episerver = React.createContext(undefined);
export default Episerver;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IEpiserverContext }
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
 * @returns  { Core.IServiceContainer }
 */
export function useServiceContainer() {
    const myContext = useContext(Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer;
}
/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
export function useIContentRepository() {
    const myContext = useContext(Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer.getService(DefaultServices.IContentRepository_V2);
}
/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
export function useContentDeliveryAPI() {
    const myContext = useContext(Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer.getService(DefaultServices.ContentDeliveryAPI_V2);
}
/**
 * create your forceUpdate hook
 */
export function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value + 1); // update the state to force render
}
export function useServerSideRendering() {
    const sc = useServiceContainer();
    return sc.getService(DefaultServices.ServerContext);
}
export function useEvents() {
    const sc = useServiceContainer();
    return sc.getService(DefaultServices.EventEngine);
}
