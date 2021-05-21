import { EnhancedStore } from '@reduxjs/toolkit';
import React, { useContext, useState } from 'react';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
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

/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
export function useIContentRepository() : IContentRepository {
    const myContext = useContext(Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer.getService<IContentRepository>(DefaultServices.IContentRepository_V2);
}

/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
export function useContentDeliveryAPI() : IContentDeliveryAPI {
    const myContext = useContext(Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer.getService<IContentDeliveryAPI>(DefaultServices.ContentDeliveryAPI_V2);
}

/**
 * create your forceUpdate hook
 */
export function useForceUpdate(){
    const [value, setValue] = useState<number>(0); // integer state
    return () => setValue(value + 1); // update the state to force render
}

export function useServerSideRendering() : IServerContextAccessor {
    const sc = useServiceContainer();
    return sc.getService<IServerContextAccessor>(DefaultServices.ServerContext);
}

export function useEvents() : IEventEngine {
    const sc = useServiceContainer();
    return sc.getService<IEventEngine>(DefaultServices.EventEngine);
}

export function useStore() : EnhancedStore {
    return useEpiserver().getStore();
}

export function useCmsState() : CmsState | undefined {
    const state : ContentAppState = useEpiserver().getStore().getState();
    return state?.OptiContentCloud;
}