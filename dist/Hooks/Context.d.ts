import { EnhancedStore } from '@reduxjs/toolkit';
import React from 'react';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import IEpiserverContext from '../Core/IEpiserverContext';
import IEventEngine from '../Core/IEventEngine';
import IServiceContainer from '../Core/IServiceContainer';
import IContentRepository from '../Repository/IContentRepository';
import ServerContextAccessor from '../ServerSideRendering/ServerContextAccessor';
import CmsState from '../State/CmsState';
/**
 * The React Context object for the Episerver context
 *
 * @constant { React.Context<IEpiserverContext | undefined> } Episerver
 */
export declare const Episerver: React.Context<IEpiserverContext | undefined>;
export default Episerver;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IEpiserverContext }
 */
export declare function useEpiserver(): IEpiserverContext;
/**
 * React Hook (for functional components) to retrieve the Episerver Service Container
 * from the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IServiceContainer }
 */
export declare function useServiceContainer(): IServiceContainer;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
export declare function useIContentRepository(): IContentRepository;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
export declare function useContentDeliveryAPI(): IContentDeliveryAPI;
/**
 * create your forceUpdate hook
 */
export declare function useForceUpdate(): () => void;
export declare function useServerSideRendering(): ServerContextAccessor;
export declare function useEvents(): IEventEngine;
export declare function useStore(): EnhancedStore;
export declare function useCmsState(): CmsState | undefined;
