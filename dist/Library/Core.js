import DefaultContextBase from '../Spa';
import { DefaultServices as DefaultServicesBase } from '../Core/IServiceContainer';
import DefaultServiceContainerBase from '../Core/DefaultServiceContainer';
import DefaultEventEngineBase from '../Core/DefaultEventEngine';
import { BaseInitializableModule as CoreBaseInitializableModule } from '../Core/IInitializableModule';
// Re-export Core namespace
export const DefaultEventEngine = DefaultEventEngineBase;
export const DefaultServiceContainer = DefaultServiceContainerBase;
export const DefaultContext = DefaultContextBase;
export const DefaultServices = DefaultServicesBase;
export const BaseInitializableModule = CoreBaseInitializableModule;
//# sourceMappingURL=Core.js.map