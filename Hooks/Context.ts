import { EnhancedStore } from '@reduxjs/toolkit';
import { useContext, useState, createContext, Context } from 'react';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IIContentSchemaInfo } from '../Core/IContentSchema';
import IEpiserverContext from '../Core/IEpiserverContext';
import IEventEngine from '../Core/IEventEngine';
import IServiceContainer, { DefaultServices } from '../Core/IServiceContainer';
import IContentRepository from '../Repository/IContentRepository';
import IServerContextAccessor from '../ServerSideRendering/IServerContextAccessor';
import CmsState from '../State/CmsState'
import { ContentAppState } from '../State/Reducer';

/**
 * The React Context object for the Episerver context
 * 
 * @constant { Context<IEpiserverContext | undefined> } Episerver
 */
export const Episerver : Context<IEpiserverContext | undefined> = createContext<IEpiserverContext | undefined>(undefined);
export default Episerver;

/**
 * React Hook (for functional components) to retrieve the Episerver Context from 
 * the nearest Provider in the virtual dom.
 * 
 * @returns  { IEpiserverContext }
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
 * @returns  { IServiceContainer }
 */
export function useServiceContainer() : IServiceContainer {
    return useEpiserver().serviceContainer;
}

/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
export function useIContentRepository() : IContentRepository {
    return useServiceContainer().getService<IContentRepository>(DefaultServices.IContentRepository_V2);
}

/**
 * Allow access to the current schema definition
 * 
 * @returns The current schema descriptor
 */
export function useIContentSchema() : IIContentSchemaInfo
{
    return useServiceContainer().getService<IIContentSchemaInfo>(DefaultServices.SchemaInfo);
}

/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
export function useContentDeliveryAPI() : IContentDeliveryAPI {
    return useServiceContainer().getService<IContentDeliveryAPI>(DefaultServices.ContentDeliveryAPI_V2);
}

/**
 * Force update hook, returns a force-update method, which
 * will trigger a state change of the component.
 */
export function useForceUpdate() : () => void {
    const [value, setValue] = useState<number>(0); // integer state
    return () => setValue(value + 1); // update the state to force render
}

/**
 * Obtain access to the Server Context, either as static information for hydrating the
 * page client side or rendering it on the server side.
 * 
 * @returns The Server Context of the current environment
 */
export function useServerSideRendering() : IServerContextAccessor {
    return useServiceContainer().getService<IServerContextAccessor>(DefaultServices.ServerContext);
}

/**
 * Allow access to the global event engine, for globally distributed events.
 * 
 * @returns The event engine
 */
export function useEvents() : IEventEngine {
    return useServiceContainer().getService<IEventEngine>(DefaultServices.EventEngine);
}

export function useStore() : EnhancedStore {
    return useEpiserver().getStore();
}

export function useCmsState() : CmsState | undefined {
    const state : ContentAppState = useEpiserver().getStore().getState();
    return state?.OptiContentCloud;
}