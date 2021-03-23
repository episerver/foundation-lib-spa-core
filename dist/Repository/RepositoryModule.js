// Lodash
import merge from 'lodash/merge';
import clone from 'lodash/clone';
// Core libraries
import { BaseInitializableModule } from '../Core/IInitializableModule';
import { DefaultServices } from '../Core/IServiceContainer';
// Legacy & depricated classes
import ContentDeliveryAPI from '../ContentDeliveryAPI';
// Module resources
import { IRepositoryPolicy } from './IRepository';
import IContentRepositoryV2 from './IContentRepository';
import EditIContentRepositoryV2 from './PassthroughIContentRepository';
import ContentDeliveryApiV2 from '../ContentDelivery/ContentDeliveryAPI';
import FetchAdapter from '../ContentDelivery/FetchAdapter';
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
        const ssr = container.getService(DefaultServices.ServerContext);
        const context = container.getService(DefaultServices.ExecutionContext);
        // Build New ContentDeliveryAPI Connector
        const newApiClassicConfig = {
            Adapter: config.networkAdapter || isFetchApiAvailable() ? FetchAdapter : undefined,
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
        const repository = newAPI.InEpiserverShell ?
            new EditIContentRepositoryV2(newAPI, repositoryConfig) :
            new IContentRepositoryV2(newAPI, repositoryConfig, ssr);
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
    StartModule(context) {
        super.StartModule(context);
        const debug = context.isDebugActive();
        const _ = this;
        // Define event listeners
        const onEpiReady = (eventData) => {
            if (debug)
                _.log(`${_.name}: OnEpiReady`, eventData);
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
                _.log('EpiContentSaved: Received updated content from the Episerver Shell', event);
            if (event.successful) {
                if (debug)
                    _.log('EpiContentSaved: Epi reported success, starting patching process');
                const repo = context.serviceContainer.getService(DefaultServices.IContentRepository_V2);
                const baseId = event.savedContentLink;
                _.patchContentRepository(repo, baseId, event, debug);
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
        const isStringProperty = (toTest, propName) => {
            try {
                return toTest[propName] && typeof toTest[propName] === 'string';
            }
            catch (e) { /* Empty on purpose */ }
            return false;
        };
        repo.patch(baseId, (item) => {
            const out = clone(item);
            event.properties.forEach(property => {
                if (property.successful) {
                    const propertyData = {};
                    if (property.name.substr(0, 9) === 'icontent_') {
                        switch (property.name.substr(9)) {
                            case 'name':
                                if (debug)
                                    this.log('EpiContentSaved: Received updated name');
                                propertyData.name = isStringProperty(out, 'name') ? property.value : { expandedValue: undefined, value: property.value };
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
                    merge(out, propertyData);
                }
            });
            if (debug)
                this.log('EpiContentSaved: Patched iContent', out);
            return out;
        });
    }
    log(...args) { console.debug(...args); }
    warn(...args) { console.warn(...args); }
}
//# sourceMappingURL=RepositoryModule.js.map