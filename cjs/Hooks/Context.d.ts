import { EnhancedStore } from '@reduxjs/toolkit';
import { Context } from 'react';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IIContentSchemaInfo } from '../Core/IContentSchema';
import IEpiserverContext from '../Core/IEpiserverContext';
import IEventEngine from '../Core/IEventEngine';
import IServiceContainer from '../Core/IServiceContainer';
import IContentRepository from '../Repository/IContentRepository';
import IServerContextAccessor from '../ServerSideRendering/IServerContextAccessor';
import CmsState from '../State/CmsState';
/**
 * The React Context object for the Episerver context
 *
 * @constant { Context<IEpiserverContext | undefined> } Episerver
 */
export declare const Episerver: Context<IEpiserverContext | undefined>;
export default Episerver;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { IEpiserverContext }
 */
export declare function useEpiserver(): IEpiserverContext;
/**
 * React Hook (for functional components) to retrieve the Episerver Service Container
 * from the nearest Provider in the virtual dom.
 *
 * @returns  { IServiceContainer }
 */
export declare function useServiceContainer(): IServiceContainer;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
export declare function useIContentRepository(): IContentRepository;
/**
 * Allow access to the current schema definition
 *
 * @returns The current schema descriptor
 */
export declare function useIContentSchema(): IIContentSchemaInfo;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
export declare function useContentDeliveryAPI(): IContentDeliveryAPI;
/**
 * Force update hook, returns a force-update method, which
 * will trigger a state change of the component.
 */
export declare function useForceUpdate(): () => void;
/**
 * Obtain access to the Server Context, either as static information for hydrating the
 * page client side or rendering it on the server side.
 *
 * @returns The Server Context of the current environment
 */
export declare function useServerSideRendering(): IServerContextAccessor;
/**
 * Allow access to the global event engine, for globally distributed events.
 *
 * @returns The event engine
 */
export declare function useEvents(): IEventEngine;
export declare function useStore(): EnhancedStore;
export declare function useCmsState(): CmsState | undefined;
