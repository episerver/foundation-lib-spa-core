// Lodash
import merge from 'lodash/merge';
// Core libraries
import { BaseInitializableModule } from '../Core/IInitializableModule';
// Legacy & depricated classes
import ContentDeliveryAPI from '../ContentDeliveryAPI';
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
        const config = container.getService("Config" /* Config */);
        const epiContext = container.getService("Context" /* Context */);
        const context = container.getService("ExecutionContext" /* ExecutionContext */);
        // Build New ContentDeliveryAPI Connector
        const newApiClassicConfig = {
            Adapter: config.networkAdapter || isFetchApiAvailable() ? FetchAdapter : undefined,
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
        const defaultRepositoryConfig = {
            debug: config.enableDebug,
            policy: "LocalStorageFirst" /* LocalStorageFirst */
        };
        const repositoryConfig = config.iContentRepository ? { ...defaultRepositoryConfig, ...config.iContentRepository } : { ...defaultRepositoryConfig };
        // Create repository
        const repository = this.IIContentRepositoryFactory(container, newAPI, repositoryConfig);
        if (config.enableDebug && newAPI.InEpiserverShell)
            this.log(`${this.name}: Detected Episerver Shell - Disabling IndexedDB`);
        // Configure Authentication
        const authStorage = context.isServerSideRendering ? new ServerAuthStorage() : new BrowserAuthStorage();
        container.addService("AuthService" /* AuthService */, new DefaultAuthService(newAPI, authStorage));
        // Add Services to container
        container.addService("ContentDeliveryAPI" /* ContentDeliveryApi */, oldAPI);
        container.addService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */, newAPI);
        container.addService("IContentRepository_V2" /* IContentRepository_V2 */, repository);
    }
    IIContentRepositoryFactory(container, api, config) {
        const ssr = container.getService("ServerContext" /* ServerContext */);
        const context = container.getService("ExecutionContext" /* ExecutionContext */);
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
                    windowName = window?.name || 'server';
                }
                catch (e) {
                    windowName = 'server';
                }
                // Set editable / editmode values
                context.serviceContainer.getService("ExecutionContext" /* ExecutionContext */).isEditable = windowName !== 'compareView';
                context.serviceContainer.getService("ExecutionContext" /* ExecutionContext */).isInEditMode = true;
                context.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */).InEditMode = true;
                context.serviceContainer.getService("ContentDeliveryAPI" /* ContentDeliveryApi */).setInEditMode(true);
            }
        };
        const onEpiContentSaved = (event) => {
            if (debug)
                this.log('EpiContentSaved: Received updated content from the Episerver Shell', event);
            if (event.successful) {
                if (debug)
                    this.log('EpiContentSaved: Epi reported success, starting patching process');
                const repo = context.serviceContainer.getService("IContentRepository_V2" /* IContentRepository_V2 */);
                const baseId = event.savedContentLink;
                this.patchContentRepository(repo, baseId, event, debug);
            }
        };
        // Bind event listener
        const eventEngine = context.serviceContainer.getService("EventEngine" /* EventEngine */);
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