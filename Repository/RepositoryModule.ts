// Core libraries
import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer, { DefaultServices } from '../Core/IServiceContainer';
import IEpiserverContext from '../Core/IEpiserverContext';
import IEventEngine from '../Core/IEventEngine';

// Configuration
import AppConfig from '../AppConfig';

// Legacy & depricated classes
import ContentDeliveryAPI from '../ContentDeliveryAPI';

// Module resources
import IContentRepositoryV2 from './IContentRepository';
import EditIContentRepositoryV2 from './PassthroughIContentRepository';
import ContentDeliveryApiV2 from '../ContentDelivery/ContentDeliveryAPI';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import IIContentRepository from './IIContentRepository';
import ServerContextAccessor from '../ServerSideRendering/ServerContextAccessor';
import { IRepositoryConfig, IRepositoryPolicy } from './IRepository';

// Private types
type EpiReadyEvent = {
    isEditable: boolean
}

export default class RepositoryModule extends BaseInitializableModule implements IInitializableModule
{
    protected name : string = "Episerver Content Delivery & Repository";
    private _shellActive : boolean = false;
    public readonly SortOrder : number = 10;

    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     * 
     * @param {IServiceContainer} container The Service Container to update
     */
    public ConfigureContainer(container: IServiceContainer) : void
    {
        // Get Application Config
        const config = container.getService<AppConfig>(DefaultServices.Config);
        const context = container.getService<IEpiserverContext>(DefaultServices.Context);
        const ssr = container.getService<ServerContextAccessor>(DefaultServices.ServerContext);

        // Build New ContentDeliveryAPI Connector
        const newAPI = new ContentDeliveryApiV2({
            Adapter: config.networkAdapter,
            BaseURL: config.epiBaseUrl,
            AutoExpandAll: config.autoExpandRequests,
            Debug: config.enableDebug,
            EnableExtensions: true,
            Language: config.defaultLanguage
        });
        
        // Build Old ContentDeliveryAPI Connector
        const oldAPI = new ContentDeliveryAPI(context, config);
        oldAPI.setInEditMode(newAPI.InEpiserverShell);

        // Build repository configuration
        const defaultRepositoryConfig : Partial<IRepositoryConfig> = {
            debug: config.enableDebug,
            policy: IRepositoryPolicy.LocalStorageFirst
        }
        const repositoryConfig = config.iContentRepository ? { ...defaultRepositoryConfig, ...config.iContentRepository } : { ...defaultRepositoryConfig }

        // Create repository
        const repository : IIContentRepository = newAPI.InEpiserverShell ?
                                new EditIContentRepositoryV2(newAPI, repositoryConfig) :
                                new IContentRepositoryV2(newAPI, repositoryConfig, ssr);
        if (config.enableDebug && newAPI.InEpiserverShell) console.info(`${ this.name }: Detected Episerver Shell - Disabling IndexedDB`);

        // Configure module
        this._shellActive = newAPI.InEpiserverShell;

        // Add Services to container
        container.addService(DefaultServices.ContentDeliveryApi, oldAPI);
        container.addService(DefaultServices.ContentDeliveryAPI_V2, newAPI);
        container.addService(DefaultServices.IContentRepository_V2, repository);
    }

    public StartModule(context: IEpiserverContext)
    {
        super.StartModule(context);

        // Define event listeners
        const onEpiReady : (eventData: EpiReadyEvent) => void = (eventData) =>
        {
            if (context.isDebugActive()) console.log(`${ this.name }: OnEpiReady`, eventData);
            if (!this._shellActive && eventData.isEditable) {
                this._shellActive = true;
                context.serviceContainer.getService<IContentDeliveryAPI>(DefaultServices.ContentDeliveryAPI_V2).InEditMode = true;
                context.serviceContainer.getService<ContentDeliveryAPI>(DefaultServices.ContentDeliveryApi).setInEditMode(true);
            }
        }

        // Bind event listener
        const eventEngine = context.serviceContainer.getService<IEventEngine>(DefaultServices.EventEngine);
        eventEngine.addListener('beta/epiReady', 'onBetaEpiReady', onEpiReady, true);
        eventEngine.addListener('epiReady', 'onEpiReady', onEpiReady, true);
    }
}