"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ContentDeliveryAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const UUID = __importStar(require("uuid"));
const Config_1 = require("./Config");
const ContentLink_1 = require("../Models/ContentLink");
class ContentDeliveryAPI {
    constructor(config) {
        this.ContentService = 'api/episerver/v2.0/content/'; // Stick to V2 as V3 doesn't support refs
        this.SiteService = 'api/episerver/v2.0/site/'; // Stick to V2 as V3 doesn't report hosts
        this.MethodService = 'api/episerver/v3/action/';
        this.AuthService = 'api/episerver/auth/token';
        this.RouteService = 'api/episerver/v3/route/';
        this.ModelService = 'api/episerver/v3/model/';
        this.errorCounter = 0;
        this._config = Object.assign(Object.assign({}, Config_1.DefaultConfig), config);
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
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('username', username);
            params.append('password', password);
            params.append('client_id', 'Default');
            this.doRequest(this.AuthService, {
                method: "POST",
                data: params,
                headers: this.getHeaders({
                    "Content-Type": "application/x-www-form-urlencoded"
                })
            });
            return Promise.resolve(true);
        });
    }
    getWebsites() {
        return this.doRequest(this.SiteService).catch(() => []);
    }
    getWebsite(hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (typeof (hostname)) {
                case 'undefined':
                    hostname = '';
                    break;
                case 'string':
                    hostname = hostname;
                    break;
                default:
                    hostname = hostname.hostname;
                    break;
            }
            return this.getWebsites().then(websites => {
                let website;
                let starWebsite;
                websites.forEach(w => {
                    if (w.hosts)
                        w.hosts.forEach(h => {
                            website = website || h.name === hostname ? w : undefined;
                            starWebsite = starWebsite || h.name === '*' ? w : undefined;
                        });
                });
                return website || starWebsite;
            });
        });
    }
    resolveRoute(path, select, expand) {
        if (this._config.EnableExtensions) {
            const serviceUrl = new URL(this.RouteService, this.BaseURL);
            if (this.CurrentWebsite)
                serviceUrl.searchParams.set('siteId', this.CurrentWebsite.id);
            serviceUrl.searchParams.set('route', path);
            return this.doRequest(serviceUrl).then(r => this.getContent(r.contentLink)).catch(e => this.createNetworkErrorResponse(e));
        }
        const url = new URL(path.startsWith('/') ? path.substr(1) : path, this.BaseURL);
        // Handle additional parameters
        if (select)
            url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));
        // Perform request
        return this.doRequest(url); // .catch(e => this.createNetworkErrorResponse(e));
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
        const apiId = ContentLink_1.ContentLinkService.createApiId(id, true);
        const url = new URL(this.ContentService + apiId, this.BaseURL);
        // Handle additional parameters
        if (select)
            url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));
        // Perform request
        return this.doRequest(url).catch(e => this.createNetworkErrorResponse(e));
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
        ids === null || ids === void 0 ? void 0 : ids.forEach(id => {
            const apiId = ContentLink_1.ContentLinkService.createApiId(id, true);
            if (this.apiIdIsGuid(apiId)) {
                guids.push(apiId);
            }
            else {
                refs.push(apiId);
            }
        });
        const url = new URL(this.ContentService, this.BaseURL);
        if (refs)
            url.searchParams.set('references', refs.map(s => encodeURIComponent(s)).join(','));
        if (guids)
            url.searchParams.set('guids', guids.map(s => encodeURIComponent(s)).join(','));
        if (select)
            url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));
        return this.doRequest(url).catch(e => [this.createNetworkErrorResponse(e)]);
        ;
    }
    getAncestors(id, select, expand) {
        // Create base URL
        const apiId = ContentLink_1.ContentLinkService.createApiId(id, true);
        const url = new URL(this.ContentService + apiId + '/ancestors', this.BaseURL);
        // Handle additional parameters
        if (select)
            url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));
        // Perform request
        return this.doRequest(url).catch(e => [this.createNetworkErrorResponse(e)]);
    }
    getChildren(id, select, expand) {
        // Create base URL
        const apiId = ContentLink_1.ContentLinkService.createApiId(id, true);
        const url = new URL(this.ContentService + apiId + '/children', this.BaseURL);
        // Handle additional parameters
        if (select)
            url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand)
            url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));
        // Perform request
        return this.doRequest(url).catch(e => [this.createNetworkErrorResponse(e)]);
    }
    isServiceURL(url) {
        const reqUrl = typeof (url) === 'string' ? new URL(url) : url;
        const serviceUrls = [
            new URL(this.AuthService, this.BaseURL),
            new URL(this.ContentService, this.BaseURL),
            new URL(this.MethodService, this.BaseURL),
            new URL(this.SiteService, this.BaseURL)
        ];
        let isServiceURL = false;
        serviceUrls === null || serviceUrls === void 0 ? void 0 : serviceUrls.forEach(u => isServiceURL = isServiceURL || reqUrl.href.startsWith(u.href));
        return isServiceURL;
    }
    apiIdIsGuid(apiId) {
        const guidRegex = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/;
        return apiId.match(guidRegex) ? true : false;
    }
    doRequest(url, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // Pre-process URL
            const requestUrl = typeof (url) === "string" ? new URL(url.toLowerCase(), this.BaseURL) : url;
            if (this.InEditMode) {
                requestUrl.searchParams.set('epieditmode', 'True');
                requestUrl.searchParams.set('preventcache', Math.round(Math.random() * 100000000).toString());
            }
            if (requestUrl.pathname.indexOf(this.ContentService) && this._config.AutoExpandAll && !requestUrl.searchParams.has('expand')) {
                requestUrl.searchParams.set('expand', '*');
            }
            // Create request configuration
            const requestConfig = Object.assign(Object.assign({}, this.getDefaultRequestConfig()), options);
            requestConfig.url = requestUrl.href;
            // Add the token if needed
            /*if (this.Token) {
                requestConfig.headers = requestConfig.headers || {};
                requestConfig.headers['Authorization'] = `Bearer ${ this.Token}`;
            }*/
            // Execute request
            try {
                if (this._config.Debug)
                    console.info('ContentDeliveryAPI Requesting', requestConfig.method + ' ' + requestConfig.url, requestConfig.data);
                const response = yield axios_1.default.request(requestConfig);
                if (response.status >= 400) {
                    if (this._config.Debug)
                        console.info(`ContentDeliveryAPI Error ${response.status}: ${response.statusText}`, requestConfig.method + ' ' + requestConfig.url);
                    throw new Error(`${response.status}: ${response.statusText}`);
                }
                const data = response.data;
                if (this._config.Debug)
                    console.info('ContentDeliveryAPI Response', requestConfig.method + ' ' + requestConfig.url, data);
                return data;
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
            method: "GET",
            baseURL: this.BaseURL,
            withCredentials: true,
            headers: this.getHeaders(),
            responseType: "json"
        };
        // Set the adapter if needed
        if (this._config.Adapter && typeof (this._config.Adapter) === 'function') {
            config.adapter = this._config.Adapter;
        }
        return config;
    }
    getHeaders(customHeaders) {
        const defaultHeaders = {
            'Accept': 'application/json',
            'Accept-Language': this.Language,
            'Content-Type': 'application/json',
        };
        if (!customHeaders)
            return defaultHeaders;
        return Object.assign(Object.assign({}, defaultHeaders), customHeaders);
    }
    createNetworkErrorResponse(e) {
        const errorId = ++this.errorCounter;
        return {
            contentLink: {
                guidValue: UUID.v4(),
                id: errorId,
                providerName: 'EpiserverSPA',
                workId: 0,
                url: ''
            },
            name: 'Network error',
            error: e,
            contentType: ['Errors', 'NetworkError']
        };
    }
}
exports.ContentDeliveryAPI = ContentDeliveryAPI;
exports.default = ContentDeliveryAPI;
