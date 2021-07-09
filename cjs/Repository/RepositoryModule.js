"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Lodash
const merge_1 = require("lodash/merge");
// Core libraries
const IInitializableModule_1 = require("../Core/IInitializableModule");
const IContentSchema_1 = require("../Core/IContentSchema");
const ContentDeliveryAPI_1 = require("../ContentDelivery/ContentDeliveryAPI");
const FetchAdapter_1 = require("../ContentDelivery/FetchAdapter");
// Repository flavours
const IContentRepository_1 = require("./IContentRepository");
const PassthroughIContentRepository_1 = require("./PassthroughIContentRepository");
const ServerSideIContentRepository_1 = require("./ServerSideIContentRepository");
// Authorization
const DefaultAuthService_1 = require("../ContentDelivery/DefaultAuthService");
const BrowserAuthStorage_1 = require("../ContentDelivery/BrowserAuthStorage");
const ServerAuthStorage_1 = require("../ContentDelivery/ServerAuthStorage");
function isFetchApiAvailable() {
    try {
        return fetch && typeof (fetch) === 'function';
    }
    catch (e) {
        return false;
    }
}
class RepositoryModule extends IInitializableModule_1.BaseInitializableModule {
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
        const context = container.getService("ExecutionContext" /* ExecutionContext */);
        // Build New ContentDeliveryAPI Connector
        const newApiClassicConfig = {
            Adapter: config.networkAdapter || isFetchApiAvailable() ? FetchAdapter_1.default : undefined,
            BaseURL: config.epiBaseUrl,
            AutoExpandAll: config.autoExpandRequests,
            Debug: config.enableDebug,
            EnableExtensions: true,
            Language: config.defaultLanguage
        };
        const newAPI = container.hasService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */) ?
            container.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */) :
            new ContentDeliveryAPI_1.default(config.iContentDelivery ? Object.assign(Object.assign({}, newApiClassicConfig), config.iContentDelivery) : newApiClassicConfig);
        if (!container.hasService("AuthService" /* AuthService */)) {
            const authStorage = context.isServerSideRendering ? new ServerAuthStorage_1.default() : new BrowserAuthStorage_1.default();
            container.addService("AuthService" /* AuthService */, new DefaultAuthService_1.default(newAPI, authStorage));
        }
        if (!container.hasService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */))
            container.addService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */, newAPI);
        if (!container.hasService("IContentRepository_V2" /* IContentRepository_V2 */))
            container.addFactory("IContentRepository_V2" /* IContentRepository_V2 */, (container) => {
                const config = container.getService("Config" /* Config */);
                const defaultRepositoryConfig = {
                    debug: config.enableDebug,
                    policy: "LocalStorageFirst" /* LocalStorageFirst */
                };
                const repositoryConfig = config.iContentRepository ? Object.assign(Object.assign({}, defaultRepositoryConfig), config.iContentRepository) : Object.assign({}, defaultRepositoryConfig);
                return this.IIContentRepositoryFactory(container, repositoryConfig);
            });
        if (!container.hasService("SchemaInfo" /* SchemaInfo */))
            container.addFactory("SchemaInfo" /* SchemaInfo */, (container) => {
                return new IContentSchema_1.IContentSchemaInfo(container.getService("Config" /* Config */));
            });
    }
    IIContentRepositoryFactory(container, config) {
        const ssr = container.getService("ServerContext" /* ServerContext */);
        const context = container.getService("ExecutionContext" /* ExecutionContext */);
        const api = container.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
        if (context.isServerSideRendering)
            return new ServerSideIContentRepository_1.default(api, config, ssr);
        if (context.isInEditMode)
            return new PassthroughIContentRepository_1.default(api, config);
        return new IContentRepository_1.default(api, config, ssr);
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
                context.serviceContainer.getService("ExecutionContext" /* ExecutionContext */).isEditable = windowName !== 'compareView';
                context.serviceContainer.getService("ExecutionContext" /* ExecutionContext */).isInEditMode = true;
                context.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */).InEditMode = true;
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
                    merge_1.default(item, propertyData);
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
exports.default = RepositoryModule;
//# sourceMappingURL=RepositoryModule.js.map