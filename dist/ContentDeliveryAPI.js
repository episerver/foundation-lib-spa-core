import Axios from 'axios';
import { ContentLinkService } from './Models/ContentLink';
import { getIContentFromPathResponse } from './ContentDelivery/PathResponse';
/**
 * ContentDelivery API Wrapper
 *
 * @deprecated
 */
export class ContentDeliveryAPI {
    /**
     * ContentDelivery API Wrapper
     *
     * @deprecated
     */
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
    async invokeControllerMethod(content, method, verb, data) {
        let options = this.getRequestSettings(verb);
        options.data = data;
        return await this.doRequest(this.getMethodServiceUrl(content, method), options);
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
    async invokeTypedControllerMethod(content, method, verb, data) {
        let options = this.getRequestSettings(verb);
        options.data = data;
        return await this.doRequest(this.getMethodServiceUrl(content, method), options);
    }
    /**
     * Retrieve a list of all websites registered within Episerver
     */
    async getWebsites() {
        if (!this.websites) {
            this.websites = await this.doRequest(this.config.epiBaseUrl + this.websiteService);
        }
        return this.websites;
    }
    /**
     * Retrieve the first website registered within Episerver
     */
    async getWebsite() {
        const list = await this.getWebsites();
        return list[0];
    }
    async getContent(content, forceGuid = false) {
        if (!(content && (content.guidValue || content.url))) {
            if (this.config.enableDebug) {
                console.warn('Loading content for an empty reference ', content);
            }
            return null;
        }
        const useGuid = content.guidValue ? this.config.preferGuid || forceGuid : false;
        let serviceUrl;
        if (useGuid) {
            serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + content.guidValue);
        }
        else {
            try {
                serviceUrl = new URL(this.config.epiBaseUrl +
                    (content.url ? content.url : this.componentService + ContentLinkService.createApiId(content)));
            }
            catch (e) {
                serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + ContentLinkService.createApiId(content));
            }
        }
        //serviceUrl.searchParams.append('currentPageUrl', this.pathProvider.getCurrentPath());
        if (this.config.autoExpandRequests) {
            serviceUrl.searchParams.append('expand', '*');
        }
        return this.doRequest(serviceUrl.href).catch((r) => {
            return this.buildNetworkError(r);
        }).then(r => getIContentFromPathResponse(r));
    }
    async getContentsByRefs(refs) {
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
    }
    async getContentByRef(ref) {
        let serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + ref);
        if (this.config.autoExpandRequests) {
            serviceUrl.searchParams.append('expand', '*');
        }
        return this.doRequest(serviceUrl.href).catch((r) => {
            return this.buildNetworkError(r);
        });
    }
    async getContentByPath(path) {
        let serviceUrl = new URL(this.config.epiBaseUrl + path);
        if (this.config.autoExpandRequests) {
            serviceUrl.searchParams.append('expand', '*');
        }
        //serviceUrl.searchParams.append('currentPageUrl', this.pathProvider.getCurrentPath());
        return this.doRequest(serviceUrl.href).catch((r) => {
            return this.buildNetworkError(r, path);
        });
    }
    async getContentChildren(id) {
        let itemId = ContentLinkService.createApiId(id);
        let serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + itemId + '/children');
        if (this.config.autoExpandRequests) {
            serviceUrl.searchParams.append('expand', '*');
        }
        return this.doRequest(serviceUrl.href).catch((r) => {
            return [];
        });
    }
    async getContentAncestors(link) {
        let itemId = ContentLinkService.createApiId(link);
        let serviceUrl = new URL(`${this.config.epiBaseUrl}${this.componentService}${itemId}/ancestors`);
        if (this.config.autoExpandRequests) {
            serviceUrl.searchParams.append('expand', '*');
        }
        return this.doRequest(serviceUrl.href).catch((r) => {
            return [];
        });
    }
    /**
     * Perform the actual request
     *
     * @param url The URL to request the data from
     * @param options The Request options to use
     */
    async doRequest(url, options) {
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
        return Axios.request(options)
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
            headers: { ...this.getHeaders() },
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
            'Accept-Language': this.config.defaultLanguage, //@ToDo: Convert to context call, with default
        };
        if (!customHeaders)
            return defaultHeaders;
        return {
            ...defaultHeaders,
            ...customHeaders,
        };
    }
    static IsActionResponse(response) {
        if (response &&
            response.responseType &&
            response.responseType == "ActionResult" /* ActionResult */) {
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
                value: '', //reason,
            },
        };
    }
}
export default ContentDeliveryAPI;
//# sourceMappingURL=ContentDeliveryAPI.js.map