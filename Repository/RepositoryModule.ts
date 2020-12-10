// Core libraries
import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer, { DefaultServices } from '../Core/IServiceContainer';
import IEpiserverContext from '../Core/IEpiserverContext';
import IEventEngine from '../Core/IEventEngine';
import IExecutionContext from '../Core/IExecutionContext';

// Configuration
import AppConfig from '../AppConfig';

// Legacy & depricated classes
import ContentDeliveryAPI from '../ContentDeliveryAPI';

// Module resources
import { IRepositoryConfig, IRepositoryPolicy } from './IRepository';
import IContentRepositoryV2 from './IContentRepository';
import IIContentRepository from './IIContentRepository';
import EditIContentRepositoryV2 from './PassthroughIContentRepository';
import ContentDeliveryApiV2 from '../ContentDelivery/ContentDeliveryAPI';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import IContentDeliveryConfig from '../ContentDelivery/Config';

// Authorization
import DefaultAuthService from '../ContentDelivery/DefaultAuthService';
import IAuthStorage from '../ContentDelivery/IAuthStorage';
import BrowserAuthStorage from '../ContentDelivery/BrowserAuthStorage';
import ServerAuthStorage from '../ContentDelivery/ServerAuthStorage';

// Server side rendering support
import ServerContextAccessor from '../ServerSideRendering/ServerContextAccessor';

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
        const epiContext = container.getService<IEpiserverContext>(DefaultServices.Context);
        const ssr = container.getService<ServerContextAccessor>(DefaultServices.ServerContext);
        const context = container.getService<IExecutionContext>(DefaultServices.ExecutionContext);

        // Build New ContentDeliveryAPI Connector
        const newApiClassicConfig : Partial<IContentDeliveryConfig> = {
            Adapter: config.networkAdapter,
            BaseURL: config.epiBaseUrl,
            AutoExpandAll: config.autoExpandRequests,
            Debug: config.enableDebug,
            EnableExtensions: true,
            Language: config.defaultLanguage
        };
        const newAPI = new ContentDeliveryApiV2(config.iContentDelivery ? { ...newApiClassicConfig, ...config.iContentDelivery } : newApiClassicConfig);
        
        // Build Old ContentDeliveryAPI Connector
        const oldAPI = new ContentDeliveryAPI(epiContext, config);
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

        // Configure Authentication
        const authStorage : IAuthStorage = context.isServerSideRendering ? new ServerAuthStorage() : new BrowserAuthStorage();
        container.addService(DefaultServices.AuthService, new DefaultAuthService(newAPI, authStorage));

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
                context.serviceContainer.getService<IExecutionContext>(DefaultServices.ExecutionContext).isEditable = true;
                context.serviceContainer.getService<IExecutionContext>(DefaultServices.ExecutionContext).isInEditMode = true;
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