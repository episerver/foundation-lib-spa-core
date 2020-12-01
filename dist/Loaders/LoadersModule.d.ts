import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer from '../Core/IServiceContainer';
export default class LoadersModule extends BaseInitializableModule implements IInitializableModule {
    /**
     * The relative sequence number of the module
     */
    readonly SortOrder = 30;
    /**
     * The name of the module, as reported by the SPA
     *
     * @var { string }
     */
    protected name: string;
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    ConfigureContainer(container: IServiceContainer): void;
    private addTypeMapperToContainer;
    private addComponentLoaderToContainer;
}
