import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer from '../Core/IServiceContainer';
import IEpiserverContext from '../Core/IEpiserverContext';
export default class RepositoryModule extends BaseInitializableModule implements IInitializableModule {
    protected name: string;
    private _shellActive;
    readonly SortOrder: number;
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    ConfigureContainer(container: IServiceContainer): void;
    StartModule(context: IEpiserverContext): void;
}
