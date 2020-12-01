// Core libraries
import { BaseInitializableModule } from '../Core/IInitializableModule';
import { DefaultServices } from '../Core/IServiceContainer';
// Legacy & depricated classes
import ContentDeliveryAPI from '../ContentDeliveryAPI';
// Module resources
import IContentRepositoryV2 from './IContentRepository';
import EditIContentRepositoryV2 from './PassthroughIContentRepository';
import ContentDeliveryApiV2 from '../ContentDelivery/ContentDeliveryAPI';
import { IRepositoryPolicy } from './IRepository';
export default class RepositoryModule extends BaseInitializableModule {
    constructor() {
        super(...arguments);
        this.name = "Episerver Content Delivery & Repository";
        this._shellActive = false;
        this.SortOrder = 10;
    }
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    ConfigureContainer(container) {
        // Get Application Config
        const config = container.getService(DefaultServices.Config);
        const context = container.getService(DefaultServices.Context);
        const ssr = container.getService(DefaultServices.ServerContext);
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
        const defaultRepositoryConfig = {
            debug: config.enableDebug,
            policy: IRepositoryPolicy.LocalStorageFirst
        };
        const repositoryConfig = config.iContentRepository ? Object.assign(Object.assign({}, defaultRepositoryConfig), config.iContentRepository) : Object.assign({}, defaultRepositoryConfig);
        // Create repository
        const repository = newAPI.InEpiserverShell ?
            new EditIContentRepositoryV2(newAPI, repositoryConfig) :
            new IContentRepositoryV2(newAPI, repositoryConfig, ssr);
        if (config.enableDebug && newAPI.InEpiserverShell)
            console.info(`${this.name}: Detected Episerver Shell - Disabling IndexedDB`);
        // Configure module
        this._shellActive = newAPI.InEpiserverShell;
        // Add Services to container
        container.addService(DefaultServices.ContentDeliveryApi, oldAPI);
        container.addService(DefaultServices.ContentDeliveryAPI_V2, newAPI);
        container.addService(DefaultServices.IContentRepository_V2, repository);
    }
    StartModule(context) {
        super.StartModule(context);
        // Define event listeners
        const onEpiReady = (eventData) => {
            if (context.isDebugActive())
                console.log(`${this.name}: OnEpiReady`, eventData);
            if (!this._shellActive && eventData.isEditable) {
                this._shellActive = true;
                context.serviceContainer.getService(DefaultServices.ContentDeliveryAPI_V2).InEditMode = true;
                context.serviceContainer.getService(DefaultServices.ContentDeliveryApi).setInEditMode(true);
            }
        };
        // Bind event listener
        const eventEngine = context.serviceContainer.getService(DefaultServices.EventEngine);
        eventEngine.addListener('beta/epiReady', 'onBetaEpiReady', onEpiReady, true);
        eventEngine.addListener('epiReady', 'onEpiReady', onEpiReady, true);
    }
}
