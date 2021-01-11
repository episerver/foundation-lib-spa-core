import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer from '../Core/IServiceContainer';
import IEpiserverContext from '../Core/IEpiserverContext';
import IIContentRepository from './IIContentRepository';
declare type EpiContentSavedEvent = {
    successful: boolean;
    contentLink: string;
    hasContentLinkChanged: boolean;
    savedContentLink: string;
    publishedContentLink: string;
    properties: {
        name: string;
        successful: boolean;
        validationErrors: any;
        value: any;
    }[];
    validationErrors: any[];
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
    StartModule(context: IEpiserverContext): void;
    protected patchContentRepository(repo: IIContentRepository, baseId: string, event: EpiContentSavedEvent, debug?: boolean): void;
    protected log(...args: any[]): void;
    protected warn(...args: any[]): void;
}
export {};
