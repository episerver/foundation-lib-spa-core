import React from 'react';
import IEpiserverContext from '../Core/IEpiserverContext';
import IServiceContainer from '../Core/IServiceContainer';
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
