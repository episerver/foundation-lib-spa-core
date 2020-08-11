import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer from '../Core/IServiceContainer';
export default class RoutingModule extends BaseInitializableModule implements IInitializableModule {
    protected name: string;
    ConfigureContainer(container: IServiceContainer): void;
}
