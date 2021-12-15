var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Axios from 'axios';
import * as UUID from 'uuid';
import { isNetworkError, } from './IContentDeliveryAPI';
import { DefaultConfig } from './Config';
import { hostnameFilter } from '../Models/WebsiteList';
import { ContentLinkService } from '../Models/ContentLink';
import { ResponseType } from '../Models/ActionResponse';
import { networkErrorToOAuthError } from './IAuthService';
export class ContentDeliveryAPI {
    constructor(config) {
        this.ContentService = 'api/episerver/v3.0/content/';
        this.SiteService = 'api/episerver/v3.0/site/';
        this.MethodService = 'api/episerver/v3/action/';
        this.AuthService = 'api/episerver/auth/token';
        this.ModelService = 'api/episerver/v3/model/';
        this.SearchService = 'api/episerver/v3.0/search/content';
        this.errorCounter = 0;
        this._config = Object.assign(Object.assign({}, DefaultConfig), config);
        this._axiosStatic = Axios;
        this._axios = Axios.create(this.getDefaultRequestConfig());
    }
    get Axios() {
        return this._axios;
    }
    get InEditMode() {
        return this._config.InEditMode;
    }
    set InEditMode(value) {
        this._config.InEditMode = value;
    }
    get Language() {
        return this._config.Language;
    }
    set Language(value) {
        this._config.Language = value;
    }
    get BaseURL() {
        return this._config.BaseURL.endsWith('/') ? this._config.BaseURL : this._config.BaseURL + '/';
    }
    get OnLine() {
        // Do not invalidate while we're off-line
        try {
            if (navigator && !navigator.onLine)
                return false;
        }
        catch (e) {
            // There's no navigator object with onLine property...
        }
        return true;
    }
    get InEpiserverShell() {
        try {
            return window !== (window === null || window === void 0 ? void 0 : window.top) && (window === null || window === void 0 ? void 0 : window.name) === 'sitePreview';
        }
        catch (e) {
            // Ignored on purpose
        }
        return false;
    }
    login(username, password) {
        const params = {
            client_id: 'Default',
            grant_type: 'password',
            username,
            password,
        };
        return this.doOAuthRequest(params);
    }
    refreshToken(refreshToken) {
        const params = {
            client_id: 'Default',
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };
        return this.doOAuthRequest(params);
    }
    doOAuthRequest(request) {
        return this.doAdvancedRequest(this.AuthService, {
            method: 'POST',
            data: request,
            maxRedirects: 0,
            transformRequest: (data, headers) => {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                return Object.entries(data)
                    .map((x) => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
                    .join('&');
            },
        }, false, true)
            .then((r) => r[0])
            .then((r) => (isNetworkError(r) ? networkErrorToOAuthError(r) : r));
    }
    getWebsites() {
        return this.doRequest(this.SiteService)
            .then((r) => (isNetworkError(r) ? [] : r))
            .catch(() => []);
    }
    getWebsite(hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            let processedHost = '';
            switch (typeof hostname) {
                case 'undefined':
                    processedHost = '';
                    break;
                case 'string':
                    processedHost = hostname;
                    break;
                default:
                    processedHost = hostname.host;
                    break;
            }
            if (this._config.Debug)
                console.log(`ContentDeliveryAPI: Resolving website for: ${processedHost}`);
            return this.getWebsites().then((websites) => {
                const website = websites
                    .filter((w) => hostnameFilter(w, processedHost, undefined, false))
                    .shift();
                const starWebsite = websites.filter((w) => hostnameFilter(w, '*', undefined, false)).shift();
                const outValue = website || starWebsite;
                if (this._config.Debug)
                    console.log(`ContentDeliveryAPI: Resolved website for: ${processedHost} to ${outValue === null || outValue === void 0 ? void 0 : outValue.name}`);
                return outValue;
            });
        });
    }
    getCurrentWebsite() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.CurrentWebsite)
                return this.CurrentWebsite;
            let hostname;
            try {
                hostname = window.location.host;
            }
            catch (e) {
                /* Ignored on purpose */
            }
            const w = yield this.getWebsite(hostname);
            this.CurrentWebsite = w;
            return w;
        });
    }
    resolveRoute(path, select, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try CD-API 2.17+ method first
            const contentServiceUrl = new URL(this.ContentService, this.BaseURL);
            contentServiceUrl.searchParams.set('contentUrl', path);
            if (select)
                contentServiceUrl.searchParams.set('select', select.join(','));
            if (expand)
                contentServiceUrl.searchParams.set('expand', expand.join(','));
            const list = yield this.doRequest(contentServiceUrl);
            if (isNetworkError(list))
                return list;
            if (list && list.length === 1)
                return list[0];
            // Fallback to resolving by accessing the URL itself
            const url = new URL(path.startsWith('/') ? path.substr(1) : path, this.BaseURL);
            if (select)
                url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
            if (expand)
                url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));
            return this.doRequest(url); // .catch(e => this.createNetworkErrorResponse(e));
        });
    }
    /**
     * Retrieve a single piece of content from Episerver
     *
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded
     */
    getContent(id, select, expand) {
        // Create base URL
        const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
        const url = new URL(this.ContentService + apiId, this.BaseURL);
        // Handle additional parameters
        if (select)
            url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));
        // Perform request
        return this.doAdvancedRequest(url)
            .then((r) => {
            const c = r[0];
            c.serverContext = {
                propertyDataType: 'IContentDeliveryResponseContext',
                value: r[1],
            };
            return c;
        })
            .catch((e) => this.createNetworkErrorResponse(e));
    }
    /**
     * Retrieve a list content-items from Episerver in one round-trip
     *
     * @param { ContentReference[] } ids The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded
     */
    getContents(ids, select, expand) {
        const refs = [];
        const guids = [];
        ids === null || ids === void 0 ? void 0 : ids.forEach((id) => {
            const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
            if (this.apiIdIsGuid(apiId)) {
                guids.push(apiId);
            }
            else {
                refs.push(apiId);
            }
        });
        const url = new URL(this.ContentService, this.BaseURL);
        if (refs)
            url.searchParams.set('references', refs.map((s) => encodeURIComponent(s)).join(','));
        if (guids)
            url.searchParams.set('guids', guids.map((s) => encodeURIComponent(s)).join(','));
        if (select)
            url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));
        return this.doRequest(url)
            .then((r) => (isNetworkError(r) ? [r] : r))
            .catch((e) => [this.createNetworkErrorResponse(e)]);
    }
    /**
     * Perform a basic search by either a single keyword/phrase or a query string encoded set of constraints.
     *
     * @param { string }    query         Keyword/Phrase or query string
     * @param { string }    orderBy
     * @param { number }    skip
     * @param { number }    top
     * @param { boolean }   personalized  Wether or not personalized results must be returned
     * @param { string }    select
     * @param { string }    expand
     * @returns The search results
     */
    basicSearch(query, orderBy, skip, top, personalized, select, expand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.OnLine)
                return Promise.resolve({ TotalMatching: 0, Results: [] });
            const params = new URLSearchParams();
            params.set('query', query);
            if (orderBy)
                params.set('orderBy', orderBy);
            if (skip)
                params.set('skip', skip.toString());
            if (top)
                params.set('top', top.toString());
            if (select)
                params.set('select', select.join(','));
            if (expand)
                params.set('expand', expand.join(','));
            if (personalized)
                params.set('personalize', 'true');
            const url = this.SearchService + '?' + params.toString();
            const data = yield this.doAdvancedRequest(url, {}, true, false).then((r) => {
                if (isNetworkError(r[0])) {
                    const errorResponse = {
                        TotalMatching: 0,
                        Results: [],
                    };
                    return errorResponse;
                }
                else
                    return r[0];
            });
            return data;
        });
    }
    /**
     * Perform an advanced search by an OData Query
     *
     * @param { string }    query         Keyword/Phrase or query string
     * @param { string }    orderBy
     * @param { number }    skip
     * @param { number }    top
     * @param { boolean }   personalized  Wether or not personalized results must be returned
     * @param { string }    select
     * @param { string }    expand
     * @returns The search results
     */
    search(query, orderBy, skip, top, personalized, select, expand) {
        return Promise.resolve({ TotalMatching: 0, Results: [] });
    }
    getAncestors(id, select, expand) {
        // Create base URL
        const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
        const url = new URL(this.ContentService + apiId + '/ancestors', this.BaseURL);
        // Handle additional parameters
        if (select)
            url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));
        // Perform request
        return this.doRequest(url)
            .then((r) => (isNetworkError(r) ? [r] : r))
            .catch((e) => [this.createNetworkErrorResponse(e)]);
    }
    getChildren(id, select, expand) {
        // Create base URL
        const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
        const url = new URL(this.ContentService + apiId + '/children', this.BaseURL);
        // Handle additional parameters
        if (select)
            url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));
        // Perform request
        return this.doRequest(url)
            .then((r) => (isNetworkError(r) ? [r] : r))
            .catch((e) => [this.createNetworkErrorResponse(e)]);
    }
    invoke(content, method, verb, data, requestTransformer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._config.EnableExtensions)
                return Promise.reject('Extensions must be enabled to use the invoke method');
            // Base configuration
            const apiId = ContentLinkService.createApiId(content, !this.InEditMode, this.InEditMode);
            const url = new URL(this.MethodService + apiId + '/' + method, this.BaseURL);
            // Default JSON Transformer for request data
            const defaultTransformer = (reqData, reqHeaders) => {
                if (reqData) {
                    reqHeaders['Content-Type'] = 'application/json';
                    return JSON.stringify(reqData);
                }
                return reqData;
            };
            // Axios request config
            const options = {
                method: verb,
                data,
                transformRequest: requestTransformer || defaultTransformer,
            };
            const createActionErrorResponse = (error) => {
                const actionResponse = {
                    actionName: method,
                    contentLink: error.contentLink,
                    currentContent: error,
                    responseType: ResponseType.ActionResult,
                    data: error,
                    language: this.Language,
                    name: typeof error.name === 'string' ? error.name : error.name.value,
                    url: error.contentLink.url,
                };
                return actionResponse;
            };
            // Run the actual request
            return this.doRequest(url, options)
                .then((r) => (isNetworkError(r) ? createActionErrorResponse(r) : r))
                .catch((e) => {
                const errorResponse = this.createNetworkErrorResponse(e);
                return createActionErrorResponse(errorResponse);
            });
        });
    }
    isServiceURL(url) {
        const reqUrl = typeof url === 'string' ? new URL(url) : url;
        const serviceUrls = [
            new URL(this.AuthService, this.BaseURL),
            new URL(this.ContentService, this.BaseURL),
            new URL(this.MethodService, this.BaseURL),
            new URL(this.SiteService, this.BaseURL),
        ];
        let isServiceURL = false;
        serviceUrls === null || serviceUrls === void 0 ? void 0 : serviceUrls.forEach((u) => (isServiceURL = isServiceURL || reqUrl.href.startsWith(u.href)));
        return isServiceURL;
    }
    raw(url, options = {}, addDefaultQueryParams = true) {
        return this.doAdvancedRequest(url, options, addDefaultQueryParams, true);
    }
    apiIdIsGuid(apiId) {
        const guidRegex = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/;
        return apiId.match(guidRegex) ? true : false;
    }
    doRequest(url, options = {}, addDefaultQueryParams = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const [responseData, responseInfo] = yield this.doAdvancedRequest(url, options, addDefaultQueryParams);
            return responseData;
        });
    }
    doAdvancedRequest(url, options = {}, addDefaultQueryParams = true, returnOnError = false) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Pre-process URL
            const requestUrl = typeof url === 'string' ? new URL(url, this.BaseURL) : url;
            if (addDefaultQueryParams) {
                if (this.InEditMode) {
                    requestUrl.searchParams.set('epieditmode', 'True');
                    requestUrl.searchParams.set('preventcache', Math.round(Math.random() * 100000000).toString());
                    // Propagate the view configurations
                    try {
                        const windowSearchParams = new URLSearchParams((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.search);
                        const toTransfer = ['visitorgroupsByID', 'epiprojects', 'commondrafts', 'epichannel'];
                        toTransfer.forEach((param) => {
                            if (!requestUrl.searchParams.has(param) && windowSearchParams.has(param)) {
                                requestUrl.searchParams.set(param, windowSearchParams.get(param));
                            }
                        });
                    }
                    catch (e) {
                        // Ignore on purpose
                    }
                }
                if (requestUrl.pathname.indexOf(this.ContentService) &&
                    this._config.AutoExpandAll &&
                    !requestUrl.searchParams.has('expand')) {
                    requestUrl.searchParams.set('expand', '*');
                }
            }
            // Create request configuration
            const requestConfig = Object.assign(Object.assign({}, this.getDefaultRequestConfig()), options);
            requestConfig.url = requestUrl.href;
            // Add the token if needed
            if (requestUrl.href.indexOf(this.AuthService) < 0) {
                // Do not add for the auth service itself
                const currentToken = this.TokenProvider ? yield this.TokenProvider.getCurrentToken() : undefined;
                if (currentToken) {
                    // Only if we have a current token
                    requestConfig.headers = requestConfig.headers || {};
                    requestConfig.headers.Authorization = `Bearer ${currentToken.access_token}`;
                }
            }
            // Execute request
            try {
                if (this._config.Debug)
                    console.info('ContentDeliveryAPI Requesting', requestConfig.method + ' ' + requestConfig.url, requestConfig.data);
                const response = yield this.Axios.request(requestConfig);
                if (response.status >= 400 && !returnOnError) {
                    if (this._config.Debug)
                        console.info(`ContentDeliveryAPI Error ${response.status}: ${response.statusText}`, requestConfig.method + ' ' + requestConfig.url);
                    throw new Error(`${response.status}: ${response.statusText}`);
                }
                const data = response.data || this.createNetworkErrorResponse('Empty response', response);
                const ctx = {
                    status: response.status,
                    statusText: response.statusText,
                    method: ((_b = requestConfig.method) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'default',
                };
                for (const key of Object.keys(response.headers)) {
                    switch (key) {
                        case 'etag':
                            ctx.etag = response.headers[key];
                            break;
                        case 'date':
                            ctx.date = response.headers[key];
                            break;
                        case 'cache-control':
                            ctx.cacheControl = response.headers['cache-control'].split(',').map((s) => s.trim());
                            break;
                        default:
                            // Do Nothing
                            break;
                    }
                }
                if (this._config.Debug)
                    console.info('ContentDeliveryAPI Response', requestConfig.method + ' ' + requestConfig.url, data, response.headers);
                return [data, ctx];
            }
            catch (e) {
                if (this._config.Debug)
                    console.info('ContentDeliveryAPI Error', requestConfig.method + ' ' + requestConfig.url, e);
                throw e;
            }
        });
    }
    getDefaultRequestConfig() {
        const config = {
            method: 'GET',
            baseURL: this.BaseURL,
            withCredentials: true,
            headers: this.getHeaders(),
            responseType: 'json',
        };
        // Set the adapter if needed
        if (this._config.Adapter && typeof this._config.Adapter === 'function') {
            config.adapter = this._config.Adapter;
        }
        return config;
    }
    getHeaders(customHeaders) {
        const defaultHeaders = {
            Accept: 'application/json',
            'Accept-Language': this.Language,
            'Content-Type': 'application/json',
            'X-IContent-Language': this.Language, // Requested language branch
        };
        if (!customHeaders)
            return defaultHeaders;
        return Object.assign(Object.assign({}, defaultHeaders), customHeaders);
    }
    createNetworkErrorResponse(error, response) {
        const errorId = ++this.errorCounter;
        return {
            contentLink: {
                guidValue: UUID.v4(),
                id: errorId,
                providerName: 'EpiserverSPA',
                workId: 0,
                url: '',
            },
            name: 'Network error',
            error: {
                propertyDataType: 'errorMessage',
                value: error,
            },
            contentType: ['Errors', 'NetworkError'],
        };
    }
}
export default ContentDeliveryAPI;
//# sourceMappingURL=ContentDeliveryAPI.js.map