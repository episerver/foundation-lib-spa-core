// Lodash
import merge from 'lodash/merge';
// Core libraries
import { BaseInitializableModule } from '../Core/IInitializableModule';
import { DefaultServices } from '../Core/IServiceContainer';
// Legacy & depricated classes
import ContentDeliveryAPI from '../ContentDeliveryAPI';
// Module resources
import { IRepositoryPolicy } from './IRepository';
import ContentDeliveryApiV2 from '../ContentDelivery/ContentDeliveryAPI';
import FetchAdapter from '../ContentDelivery/FetchAdapter';
// Repository flavours
import IContentRepositoryV2 from './IContentRepository';
import EditIContentRepositoryV2 from './PassthroughIContentRepository';
import SSRIContentRepository from './ServerSideIContentRepository';
// Authorization
import DefaultAuthService from '../ContentDelivery/DefaultAuthService';
import BrowserAuthStorage from '../ContentDelivery/BrowserAuthStorage';
import ServerAuthStorage from '../ContentDelivery/ServerAuthStorage';
function isFetchApiAvailable() {
    try {
        return fetch && typeof (fetch) === 'function';
    }
    catch (e) {
        return false;
    }
}
export default class RepositoryModule extends BaseInitializableModule {
    constructor() {
        super(...arguments);
        this.name = "Episerver Content Delivery & Repository";
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
        const epiContext = container.getService(DefaultServices.Context);
        const context = container.getService(DefaultServices.ExecutionContext);
        // Build New ContentDeliveryAPI Connector
        const newApiClassicConfig = {
            Adapter: config.networkAdapter || (isFetchApiAvailable() ? FetchAdapter : undefined),
            BaseURL: config.epiBaseUrl,
            AutoExpandAll: config.autoExpandRequests,
            Debug: config.enableDebug,
            EnableExtensions: true,
            Language: config.defaultLanguage
        };
        const newAPI = new ContentDeliveryApiV2(config.iContentDelivery ? Object.assign(Object.assign({}, newApiClassicConfig), config.iContentDelivery) : newApiClassicConfig);
        // Build Old ContentDeliveryAPI Connector
        const oldAPI = new ContentDeliveryAPI(epiContext, config);
        oldAPI.setInEditMode(newAPI.InEpiserverShell);
        // Build repository configuration
        const defaultRepositoryConfig = {
            debug: config.enableDebug,
            policy: IRepositoryPolicy.LocalStorageFirst
        };
        const repositoryConfig = config.iContentRepository ? Object.assign(Object.assign({}, defaultRepositoryConfig), config.iContentRepository) : Object.assign({}, defaultRepositoryConfig);
        // Create repository
        const repository = this.IIContentRepositoryFactory(container, newAPI, repositoryConfig);
        if (config.enableDebug && newAPI.InEpiserverShell)
            this.log(`${this.name}: Detected Episerver Shell - Disabling IndexedDB`);
        // Configure Authentication
        const authStorage = context.isServerSideRendering ? new ServerAuthStorage() : new BrowserAuthStorage();
        container.addService(DefaultServices.AuthService, new DefaultAuthService(newAPI, authStorage));
        // Add Services to container
        container.addService(DefaultServices.ContentDeliveryApi, oldAPI);
        container.addService(DefaultServices.ContentDeliveryAPI_V2, newAPI);
        container.addService(DefaultServices.IContentRepository_V2, repository);
    }
    IIContentRepositoryFactory(container, api, config) {
        const ssr = container.getService(DefaultServices.ServerContext);
        const context = container.getService(DefaultServices.ExecutionContext);
        if (context.isServerSideRendering)
            return new SSRIContentRepository(api, config, ssr);
        if (context.isInEditMode)
            return new EditIContentRepositoryV2(api, config);
        return new IContentRepositoryV2(api, config, ssr);
    }
    StartModule(context) {
        super.StartModule(context);
        const debug = context.isDebugActive();
        // Define event listeners
        const onEpiReady = (eventData) => {
            if (debug)
                this.log(`${this.name}: OnEpiReady`, eventData);
            if (eventData.isEditable) {
                // Determine window name
                let windowName = 'server';
                try {
                    windowName = (window === null || window === void 0 ? void 0 : window.name) || 'server';
                }
                catch (e) {
                    windowName = 'server';
                }
                // Set editable / editmode values
                context.serviceContainer.getService(DefaultServices.ExecutionContext).isEditable = windowName !== 'compareView';
                context.serviceContainer.getService(DefaultServices.ExecutionContext).isInEditMode = true;
                context.serviceContainer.getService(DefaultServices.ContentDeliveryAPI_V2).InEditMode = true;
                context.serviceContainer.getService(DefaultServices.ContentDeliveryApi).setInEditMode(true);
            }
        };
        const onEpiContentSaved = (event) => {
            if (debug)
                this.log('EpiContentSaved: Received updated content from the Episerver Shell', event);
            if (event.successful) {
                if (debug)
                    this.log('EpiContentSaved: Epi reported success, starting patching process');
                const repo = context.serviceContainer.getService(DefaultServices.IContentRepository_V2);
                const baseId = event.savedContentLink;
                this.patchContentRepository(repo, baseId, event, debug);
            }
        };
        // Bind event listener
        const eventEngine = context.serviceContainer.getService(DefaultServices.EventEngine);
        eventEngine.addListener('beta/epiReady', 'onBetaEpiReady', onEpiReady.bind(this), true);
        eventEngine.addListener('epiReady', 'onEpiReady', onEpiReady.bind(this), true);
        eventEngine.addListener('beta/contentSaved', 'BetaEpiContentSaved', onEpiContentSaved.bind(this), true);
        eventEngine.addListener('contentSaved', 'EpiContentSaved', onEpiContentSaved.bind(this), true);
    }
    patchContentRepository(repo, baseId, event, debug = false) {
        function isStringProperty(toTest, propName) {
            try {
                return toTest[propName] && typeof toTest[propName] === 'string' ? true : false;
            }
            catch (e) { /* Empty on purpose */ }
            return false;
        }
        repo.patch(baseId, (item) => {
            event.properties.forEach(property => {
                if (property.successful) {
                    const propertyData = {};
                    if (property.name.substr(0, 9) === 'icontent_') {
                        switch (property.name.substr(9)) {
                            case 'name':
                                if (debug)
                                    this.log('EpiContentSaved: Received updated name');
                                propertyData.name = isStringProperty(item, 'name') ? property.value : { expandedValue: undefined, value: property.value };
                                break;
                            default:
                                if (debug)
                                    this.warn('EpiContentSaved: Received unsupported property ', property);
                                break;
                        }
                    }
                    else {
                        if (debug)
                            this.log(`EpiContentSaved: Received updated ${property.name}`);
                        propertyData[property.name] = {
                            expandedValue: undefined,
                            value: property.value
                        };
                    }
                    merge(item, propertyData);
                }
            });
            if (debug)
                this.log('EpiContentSaved: Patched iContent', item);
            return item;
        });
    }
    log(...args) { console.debug(...args); }
    warn(...args) { console.warn(...args); }
}
//# sourceMappingURL=RepositoryModule.js.map