import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer from '../Core/IServiceContainer';
export default class RoutingModule extends BaseInitializableModule implements IInitializableModule {
    protected name: string;
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param container The Service Container to update
     */
    ConfigureContainer(container: IServiceContainer): void;
}
