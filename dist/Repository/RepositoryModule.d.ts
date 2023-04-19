import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer from '../Core/IServiceContainer';
import IEpiserverContext from '../Core/IEpiserverContext';
import { IRepositoryConfig } from './IRepository';
import IIContentRepository from './IIContentRepository';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
type EpiContentSavedEvent = {
    successful: boolean;
    contentLink: string;
    hasContentLinkChanged: boolean;
    savedContentLink: string;
    publishedContentLink: string;
    properties: {
        name: string;
        successful: boolean;
        validationErrors: unknown;
        value: unknown;
    }[];
    validationErrors: unknown[];
    oldContentLink: string;
};
export default class RepositoryModule extends BaseInitializableModule implements IInitializableModule {
    protected name: string;
    readonly SortOrder: number;
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    ConfigureContainer(container: IServiceContainer): void;
    protected IIContentRepositoryFactory(container: IServiceContainer, api: IContentDeliveryAPI, config: Partial<IRepositoryConfig>): IIContentRepository;
    StartModule(context: IEpiserverContext): void;
    protected patchContentRepository(repo: IIContentRepository, baseId: string, event: EpiContentSavedEvent, debug?: boolean): void;
    protected log(...args: unknown[]): void;
    protected warn(...args: unknown[]): void;
}
export {};
