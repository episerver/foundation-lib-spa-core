"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIContentFromPathResponse = exports.PathResponseIsActionResponse = exports.PathResponseIsIContent = void 0;
const axios_1 = __importDefault(require("axios"));
const ContentLink_1 = require("./Models/ContentLink");
const ActionResponse_1 = require("./Models/ActionResponse");
function PathResponseIsIContent(iContent) {
    if (iContent.actionName) {
        return false;
    }
    return true;
}
exports.PathResponseIsIContent = PathResponseIsIContent;
function PathResponseIsActionResponse(actionResponse) {
    if (actionResponse.actionName) {
        return true;
    }
    return false;
}
exports.PathResponseIsActionResponse = PathResponseIsActionResponse;
function getIContentFromPathResponse(response) {
    if (PathResponseIsActionResponse(response)) {
        return response.currentContent;
    }
    if (PathResponseIsIContent(response)) {
        return response;
    }
    return null;
}
exports.getIContentFromPathResponse = getIContentFromPathResponse;
class ContentDeliveryAPI {
    constructor(pathProvider, config) {
        this.componentService = '/api/episerver/v2.0/content/';
        this.websiteService = '/api/episerver/v3/site/';
        this.methodService = '/api/episerver/v3/action/';
        this.debug = false;
        /**
         * Marker to keep if we're in edit mode
         */
        this.inEditMode = false;
        this.counter = 0;
        this.pathProvider = pathProvider;
        this.config = config;
        this.debug = this.config.enableDebug === true;
    }
    get currentPathProvider() {
        return this.pathProvider;
    }
    get currentConfig() {
        return this.config;
    }
    isInEditMode() {
        return this.inEditMode;
    }
    setInEditMode(editMode) {
        this.inEditMode = editMode === true;
        return this;
    }
    isDisabled() {
        return this.config.noAjax === true;
    }
    /**
     * Invoke an ASP.Net MVC controller method using the generic content API. This is intended
     * to be used only when attaching a SPA to an existing code-base.
     *
     * @param content The content for which the controller must be loaded
     * @param method  The (case sensitive) method name to invoke on the controller
     * @param verb    The HTTP verb to use when invoking the controller
     * @param data    The data (if any) to send to the controller for the method
     */
    invokeControllerMethod(content, method, verb, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = this.getRequestSettings(verb);
            options.data = data;
            return yield this.doRequest(this.getMethodServiceUrl(content, method), options);
        });
    }
    /**
     * Strongly typed variant of invokeControllerMethod
     *
     * @see   invokeControllerMethod()
     * @param content The content for which the controller must be loaded
     * @param method  The (case sensitive) method name to invoke on the controller
     * @param verb    The HTTP verb to use when invoking the controller
     * @param data    The data (if any) to send to the controller for the method
     */
    invokeTypedControllerMethod(content, method, verb, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = this.getRequestSettings(verb);
            options.data = data;
            return yield this.doRequest(this.getMethodServiceUrl(content, method), options);
        });
    }
    /**
     * Retrieve a list of all websites registered within Episerver
     */
    getWebsites() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.websites) {
                this.websites = yield this.doRequest(this.config.epiBaseUrl + this.websiteService);
            }
            return this.websites;
        });
    }
    /**
     * Retrieve the first website registered within Episerver
     */
    getWebsite() {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.getWebsites();
            return list[0];
        });
    }
    getContent(content, forceGuid = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(content && (content.guidValue || content.url))) {
                if (this.config.enableDebug) {
                    console.warn('Loading content for an empty reference ', content);
                }
                return null;
            }
            let useGuid = content.guidValue ? this.config.preferGuid || forceGuid : false;
            let serviceUrl;
            if (useGuid) {
                serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + content.guidValue);
            }
            else {
                try {
                    serviceUrl = new URL(this.config.epiBaseUrl +
                        (content.url ? content.url : this.componentService + ContentLink_1.ContentLinkService.createApiId(content)));
                }
                catch (e) {
                    serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + ContentLink_1.ContentLinkService.createApiId(content));
                }
            }
            //serviceUrl.searchParams.append('currentPageUrl', this.pathProvider.getCurrentPath());
            if (this.config.autoExpandRequests) {
                serviceUrl.searchParams.append('expand', '*');
            }
            return this.doRequest(serviceUrl.href).catch((r) => {
                return this.buildNetworkError(r);
            }).then(r => getIContentFromPathResponse(r));
        });
    }
    getContentsByRefs(refs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refs || refs.length == 0) {
                return Promise.resolve([]);
            }
            let serviceUrl = new URL(this.config.epiBaseUrl + this.componentService);
            serviceUrl.searchParams.append('references', refs.join(','));
            if (this.config.autoExpandRequests) {
                serviceUrl.searchParams.append('expand', '*');
            }
            return this.doRequest(serviceUrl.href).catch((r) => {
                return [];
            });
        });
    }
    getContentByRef(ref) {
        return __awaiter(this, void 0, void 0, function* () {
            let serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + ref);
            if (this.config.autoExpandRequests) {
                serviceUrl.searchParams.append('expand', '*');
            }
            return this.doRequest(serviceUrl.href).catch((r) => {
                return this.buildNetworkError(r);
            });
        });
    }
    getContentByPath(path) {
        return __awaiter(this, void 0, void 0, function* () {
            let serviceUrl = new URL(this.config.epiBaseUrl + path);
            if (this.config.autoExpandRequests) {
                serviceUrl.searchParams.append('expand', '*');
            }
            //serviceUrl.searchParams.append('currentPageUrl', this.pathProvider.getCurrentPath());
            return this.doRequest(serviceUrl.href).catch((r) => {
                return this.buildNetworkError(r, path);
            });
        });
    }
    getContentChildren(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let itemId = ContentLink_1.ContentLinkService.createApiId(id);
            let serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + itemId + '/children');
            if (this.config.autoExpandRequests) {
                serviceUrl.searchParams.append('expand', '*');
            }
            return this.doRequest(serviceUrl.href).catch((r) => {
                return [];
            });
        });
    }
    getContentAncestors(link) {
        return __awaiter(this, void 0, void 0, function* () {
            let itemId = ContentLink_1.ContentLinkService.createApiId(link);
            let serviceUrl = new URL(`${this.config.epiBaseUrl}${this.componentService}${itemId}/ancestors`);
            if (this.config.autoExpandRequests) {
                serviceUrl.searchParams.append('expand', '*');
            }
            return this.doRequest(serviceUrl.href).catch((r) => {
                return [];
            });
        });
    }
    /**
     * Perform the actual request
     *
     * @param url The URL to request the data from
     * @param options The Request options to use
     */
    doRequest(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isDisabled()) {
                return Promise.reject('The Content Delivery API has been disabled');
            }
            if (this.isInEditMode()) {
                let urlObj = new URL(url);
                urlObj.searchParams.append('epieditmode', 'True');
                //Add channel...
                //Add project...
                urlObj.searchParams.append('preventCache', Math.round(Math.random() * 100000000).toString());
                url = urlObj.href;
            }
            options = options ? options : this.getRequestSettings();
            if (this.debug)
                console.debug('Requesting: ' + url);
            options.url = url;
            return axios_1.default.request(options)
                .then((response) => {
                if (this.debug)
                    console.debug(`Response from ${url}:`, response.data);
                return response.data;
            })
                .catch((reason) => {
                if (this.debug)
                    console.error(`Response from ${url}: HTTP Fetch error `, reason);
                throw reason;
            });
        });
    }
    getMethodServiceUrl(content, method) {
        let contentUrl = this.config.epiBaseUrl;
        contentUrl = contentUrl + this.methodService;
        contentUrl = contentUrl + content.guidValue + '/' + method;
        return contentUrl;
    }
    /**
     * Build the request parameters needed to perform the call to the Content Delivery API
     *
     * @param verb The verb for the generated configuration
     */
    getRequestSettings(verb) {
        let options = {
            method: verb ? verb : 'get',
            baseURL: this.config.epiBaseUrl,
            withCredentials: true,
            headers: Object.assign({}, this.getHeaders()),
            transformRequest: [
                (data, headers) => {
                    if (data) {
                        headers['Content-Type'] = 'application/json';
                        return JSON.stringify(data);
                    }
                    return data;
                },
            ],
            responseType: 'json',
        };
        if (this.config.networkAdapter) {
            options.adapter = this.config.networkAdapter;
        }
        return options;
    }
    getHeaders(customHeaders) {
        let defaultHeaders = {
            Accept: 'application/json',
            'Accept-Language': this.config.defaultLanguage,
        };
        if (!customHeaders)
            return defaultHeaders;
        return Object.assign(Object.assign({}, defaultHeaders), customHeaders);
    }
    static IsActionResponse(response) {
        if (response &&
            response.responseType &&
            response.responseType == ActionResponse_1.ResponseType.ActionResult) {
            return true;
        }
        return false;
    }
    buildNetworkError(reason, path = '') {
        const errorId = ++this.counter;
        return {
            name: {
                propertyDataType: 'String',
                value: 'Error',
            },
            contentType: ['Errors', 'NetworkError'],
            contentLink: {
                guidValue: '',
                id: errorId,
                providerName: 'ContentDeliveryAPI_Errors',
                url: path,
                workId: 0,
            },
            error: {
                propertyDataType: 'Unknown',
                value: '',
            },
        };
    }
}
exports.default = ContentDeliveryAPI;
