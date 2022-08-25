import { EnhancedStore } from '@reduxjs/toolkit';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import IEpiserverContext from '../Core/IEpiserverContext';
import IEventEngine from '../Core/IEventEngine';
import IServiceContainer from '../Core/IServiceContainer';
import IContentRepository from '../Repository/IContentRepository';
import IServerContextAccessor from '../ServerSideRendering/IServerContextAccessor';
import CmsState from '../State/CmsState';
/**
 * The React Context object for the Episerver context
 *
 * @constant { React.Context<IEpiserverContext | undefined> } Episerver
 */
export declare const Episerver: any;
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
export declare function useForceUpdate(): () => any;
export declare function useServerSideRendering(): IServerContextAccessor;
export declare function useEvents(): IEventEngine;
export declare function useStore(): EnhancedStore;
export declare function useCmsState(): CmsState | undefined;
