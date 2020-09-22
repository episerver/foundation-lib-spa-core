// Import 3rd Party dependencies
import { Action, AnyAction } from '@reduxjs/toolkit';

// Import from source files
import AppConfig from '../AppConfig';
import DefaultContextBase from '../Spa';
import IServiceContainerBase, { DefaultServices as DefaultServicesBase } from '../Core/IServiceContainer';
import DefaultServiceContainerBase from '../Core/DefaultServiceContainer';
import IEpiserverContextBase from '../Core/IEpiserverContext';
import DefaultEventEngineBase from '../Core/DefaultEventEngine';
import IEventEngineBase from '../Core/IEventEngine';
import IInitializableModuleBase, { BaseInitializableModule as CoreBaseInitializableModule } from '../Core/IInitializableModule';
import IStateReducerInfoBase from '../Core/IStateReducerInfo';

// Re-export Core namespace
export const DefaultEventEngine = DefaultEventEngineBase;
export const DefaultServiceContainer = DefaultServiceContainerBase;
export const DefaultContext = DefaultContextBase;
export const DefaultServices = DefaultServicesBase;
export const BaseInitializableModule = CoreBaseInitializableModule;
export type IEpiserverContext = IEpiserverContextBase;
export type IEventEngine = IEventEngineBase;
export type IInitializableModule = IInitializableModuleBase;
export type IServiceContainer = IServiceContainerBase;
export type IStateReducerInfo<S, A extends Action = AnyAction> = IStateReducerInfoBase<S, A>;
export type IConfig = AppConfig;