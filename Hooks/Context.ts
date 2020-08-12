import React, { useContext } from 'react';
import IEpiserverContext from '../Core/IEpiserverContext';
import IServiceContainer from '../Core/IServiceContainer';

/**
 * The React Context object for the Episerver context
 * 
 * @constant { React.Context<IEpiserverContext | undefined> } Episerver
 */
export const Episerver = React.createContext<IEpiserverContext | undefined>(undefined);
export default Episerver;

/**
 * React Hook (for functional components) to retrieve the Episerver Context from 
 * the nearest Provider in the virtual dom.
 * 
 * @returns  { Core.IEpiserverContext }
 */
export function useEpiserver() : IEpiserverContext {
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
export function useServiceContainer() : IServiceContainer {
    const myContext = useContext(Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer;
}
