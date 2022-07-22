// Lodash
import merge from 'lodash/merge';
import clone from 'lodash/cloneDeep';

// Core libraries
import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer, { DefaultServices } from '../Core/IServiceContainer';
import IEpiserverContext from '../Core/IEpiserverContext';
import IEventEngine from '../Core/IEventEngine';
import IExecutionContext from '../Core/IExecutionContext';

// Data model
import IContent from '../Models/IContent';
import IContentProperty from '../Property';

// Configuration
import AppConfig from '../AppConfig';

// Legacy & depricated classes
import ContentDeliveryAPI from '../ContentDeliveryAPI';

// Module resources
import { IRepositoryConfig, IRepositoryPolicy } from './IRepository';
import IIContentRepository from './IIContentRepository';
import ContentDeliveryApiV2 from '../ContentDelivery/ContentDeliveryAPI';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import IContentDeliveryConfig from '../ContentDelivery/Config';
import FetchAdapter from '../ContentDelivery/FetchAdapter';

// Repository flavours
import IContentRepositoryV2 from './IContentRepository';
import EditIContentRepositoryV2 from './PassthroughIContentRepository';
import SSRIContentRepository from './ServerSideIContentRepository';

// Authorization
import DefaultAuthService from '../ContentDelivery/DefaultAuthService';
import IAuthStorage from '../ContentDelivery/IAuthStorage';
import BrowserAuthStorage from '../ContentDelivery/BrowserAuthStorage';
import ServerAuthStorage from '../ContentDelivery/ServerAuthStorage';

// Server side rendering support
import IServerContextAccessor from '../ServerSideRendering/IServerContextAccessor';

// Private types
type EpiReadyEvent = {
    isEditable: boolean
}
type EpiContentSavedEvent = {
    successful: boolean
    contentLink: string
    hasContentLinkChanged: boolean
    savedContentLink: string
    publishedContentLink: string
    properties: {
        name: string;
        successful: boolean;
        validationErrors: unknown;
        value: unknown;
    }[]
    validationErrors: unknown[]
    oldContentLink: string
}

function isFetchApiAvailable() : boolean
{
    try {
        return fetch && typeof(fetch) === 'function';
    } catch (e) {
        return false;
    }
}

export default class RepositoryModule extends BaseInitializableModule implements IInitializableModule
{
    protected name = "Episerver Content Delivery & Repository";
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
        const context = container.getService<IExecutionContext>(DefaultServices.ExecutionContext);

        // Build New ContentDeliveryAPI Connector
        const newApiClassicConfig : Partial<IContentDeliveryConfig> = {
            Adapter: config.networkAdapter || (isFetchApiAvailable() ? FetchAdapter : undefined),
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
        const repository = this.IIContentRepositoryFactory(container, newAPI, repositoryConfig);
        if (config.enableDebug && newAPI.InEpiserverShell) this.log(`${ this.name }: Detected Episerver Shell - Disabling IndexedDB`);

        // Configure Authentication
        const authStorage : IAuthStorage = context.isServerSideRendering ? new ServerAuthStorage() : new BrowserAuthStorage();
        container.addService(DefaultServices.AuthService, new DefaultAuthService(newAPI, authStorage));

        // Add Services to container
        container.addService(DefaultServices.ContentDeliveryApi, oldAPI);
        container.addService(DefaultServices.ContentDeliveryAPI_V2, newAPI);
        container.addService(DefaultServices.IContentRepository_V2, repository);
    }

    protected IIContentRepositoryFactory(container: IServiceContainer, api: IContentDeliveryAPI, config: Partial<IRepositoryConfig>) : IIContentRepository
    {
        const ssr = container.getService<IServerContextAccessor>(DefaultServices.ServerContext);
        const context = container.getService<IExecutionContext>(DefaultServices.ExecutionContext);
        if (context.isServerSideRendering)
            return new SSRIContentRepository(api, config, ssr);
        if (context.isInEditMode)
            return new EditIContentRepositoryV2(api, config);
        return new IContentRepositoryV2(api, config, ssr);
    }

    public StartModule(context: IEpiserverContext) : void
    {
        super.StartModule(context);
        const debug = context.isDebugActive();

        // Define event listeners
        const onEpiReady : (eventData: EpiReadyEvent) => void = (eventData) =>
        {
            if (debug) this.log(`${ this.name }: OnEpiReady`, eventData);
            if (eventData.isEditable) {
                // Determine window name
                let windowName = 'server';
                try {
                    windowName = window?.name || 'server';
                } catch (e) {
                    windowName = 'server';
                }

                // Set editable / editmode values
                context.serviceContainer.getService<IExecutionContext>(DefaultServices.ExecutionContext).isEditable = windowName !== 'compareView';
                context.serviceContainer.getService<IExecutionContext>(DefaultServices.ExecutionContext).isInEditMode = true;
                context.serviceContainer.getService<IContentDeliveryAPI>(DefaultServices.ContentDeliveryAPI_V2).InEditMode = true;
                context.serviceContainer.getService<ContentDeliveryAPI>(DefaultServices.ContentDeliveryApi).setInEditMode(true);

            }
        }

        const onEpiContentSaved : (eventData : EpiContentSavedEvent) => void = (event) =>
        {
            if (debug) this.log('EpiContentSaved: Received updated content from the Episerver Shell', event);
            if (event.successful) {
                if (debug) this.log('EpiContentSaved: Epi reported success, starting patching process');
                const repo = context.serviceContainer.getService<IIContentRepository>(DefaultServices.IContentRepository_V2);
                const baseId = event.savedContentLink;
                this.patchContentRepository(repo, baseId, event, debug);
            }
        }

        // Bind event listener
        const eventEngine = context.serviceContainer.getService<IEventEngine>(DefaultServices.EventEngine);
        eventEngine.addListener('beta/epiReady', 'onBetaEpiReady', onEpiReady.bind(this), true);
        eventEngine.addListener('epiReady', 'onEpiReady', onEpiReady.bind(this), true);
        eventEngine.addListener('beta/contentSaved', 'BetaEpiContentSaved', onEpiContentSaved.bind(this), true);
        eventEngine.addListener('contentSaved', 'EpiContentSaved', onEpiContentSaved.bind(this), true);
    }

    protected patchContentRepository(repo : IIContentRepository, baseId : string , event : EpiContentSavedEvent, debug = false) : void
    {
        function isStringProperty<T extends Record<string, unknown>, K extends keyof T>(toTest: T, propName: K) : boolean {
            try {
                return toTest[propName] && typeof toTest[propName] === 'string' ? true : false;
            } catch (e) { /* Empty on purpose */ }
            return false;
        }

        repo.patch(baseId, (item) => {
            event.properties.forEach(property => {
                if (property.successful) {
                    const propertyData : { [key: string ]: Partial<IContentProperty> | string } = { };
                    if (property.name.substr(0, 9) === 'icontent_') {
                        switch (property.name.substr(9)) {
                        case 'name':
                            if (debug) this.log('EpiContentSaved: Received updated name');
                            propertyData.name = isStringProperty(item, 'name') ? property.value as string : { expandedValue: undefined, value: property.value };
                            break;
                        default:
                            if (debug) this.warn('EpiContentSaved: Received unsupported property ', property);
                            break;
                        }
                    } else {
                        if (debug) this.log(`EpiContentSaved: Received updated ${ property.name }`);
                        propertyData[property.name] = {
                            expandedValue: undefined,
                            value: property.value
                        }
                    }
                    merge(item, propertyData);
                }
            });
            if (debug) this.log('EpiContentSaved: Patched iContent', item);
            return item;
        })
    }

    protected log(...args : unknown[]) : void { console.debug( ...args ) }
    protected warn (...args : unknown[]) : void { console.warn( ...args) }
}