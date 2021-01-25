import Axios, {  AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method } from 'axios';
import * as UUID from 'uuid';
import IContentDeliveryAPi, { IContentDeliveryResponse, IContentDeliveryResponseContext } from './IContentDeliveryAPI';
import ContentDeliveryApiConfig, { DefaultConfig } from './Config';
import Website from '../Models/Website';
import WebsiteList, { hostnameFilter } from '../Models/WebsiteList';
import IContent from '../Models/IContent';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import { PathResponse, NetworkErrorData } from '../ContentDeliveryAPI';
import ContentRoutingResponse from './ContentRoutingResponse';
import ActionResponse, { ResponseType } from '../Models/ActionResponse';
import { IOAuthRequest, IOAuthResponse } from './IAuthService';
import IAuthTokenProvider from './IAuthTokenProvider';

export class ContentDeliveryAPI implements IContentDeliveryAPi
{
    public readonly ContentService: string = 'api/episerver/v2.0/content/'; // Stick to V2 as V3 doesn't support refs
    public readonly SiteService: string    = 'api/episerver/v2.0/site/';    // Stick to V2 as V3 doesn't report hosts
    public readonly MethodService: string  = 'api/episerver/v3/action/';
    public readonly AuthService: string    = 'api/episerver/auth/token';
    public readonly RouteService: string   = 'api/episerver/v3/route/';
    public readonly ModelService: string   = 'api/episerver/v3/model/';

    private _config : ContentDeliveryApiConfig;
    private _axios : AxiosInstance;

    public constructor(config : Partial<ContentDeliveryApiConfig>)
    {
        this._config = { ...DefaultConfig, ...config };
        this._axios = Axios.create(this.getDefaultRequestConfig());
    }

    protected get Axios() : AxiosInstance
    {
        return this._axios;
    }

    public CurrentWebsite?: Website;

    /**
     * If set, this is the token to be used when authorizing requests
     */
    public TokenProvider ?: IAuthTokenProvider;

    public get InEditMode() : boolean
    {
        return this._config.InEditMode;
    }

    public set InEditMode(value: boolean) 
    {
        this._config.InEditMode = value;
    }

    public get Language() : string
    {
        return this._config.Language;
    }
    public set Language(value: string)
    {
        this._config.Language = value;
    }

    public get BaseURL() : string
    {
        return this._config.BaseURL.endsWith('/') ? this._config.BaseURL : this._config.BaseURL + '/';
    }

    public get OnLine() : boolean
    {
        // Do not invalidate while we're off-line
        try {
            if (navigator && !navigator.onLine) return false;
        } catch (e) { 
            // There's no navigator object with onLine property...
        }
        return true;
    }

    public get InEpiserverShell() : boolean
    {
        try {
            return window !== window?.top && window?.name === 'sitePreview';
        } catch (e) {
            // Ignored on purpose
        }
        return false;
    }

    public login(username: string, password: string) : Promise<IOAuthResponse>
    {
        const params : IOAuthRequest = {
            client_id: 'Default',
            grant_type: 'password',
            username,
            password
        }

        return this.doOAuthRequest(params);
    }

    public refreshToken(refreshToken: string) : Promise<IOAuthResponse>
    {
        const params : IOAuthRequest = {
            client_id: 'Default',
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }

        return this.doOAuthRequest(params);
    }

    protected doOAuthRequest(request: IOAuthRequest) : Promise<IOAuthResponse>
    {
        return this.doAdvancedRequest<IOAuthResponse>(this.AuthService, {
            method: "POST",
            data: request,
            transformRequest: (data: object, headers: AxiosHeaders) : string => {
                headers["Content-Type"] = "application/x-www-form-urlencoded";
                return Object.entries(data).map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`).join('&')
            }
        }, false, true).then(r => r[0]);
    }

    public getWebsites() : Promise<WebsiteList>
    {
        return this.doRequest<WebsiteList>(this.SiteService).catch(() => []);
    }

    public async getWebsite(hostname ?: string | URL) : Promise<Website | undefined>
    {
        let processedHost : string = '';
        switch (typeof(hostname)) {
            case 'undefined':
                processedHost = '';
                break;
            case 'string':
                processedHost = hostname;
                break;
            default:
                processedHost = hostname.hostname;
                break;
        }
        if (this._config.Debug) console.log(`ContentDeliveryAPI: Resolving website for: ${ processedHost }`);
        return this.getWebsites().then(websites => {
            const website: Website | undefined = websites.filter(w => hostnameFilter(w, processedHost, undefined, false)).shift();
            const starWebsite: Website | undefined = websites.filter(w => hostnameFilter(w, '*', undefined, false)).shift();
            const outValue = website || starWebsite;
            if (this._config.Debug) console.log(`ContentDeliveryAPI: Resolved website for: ${ processedHost } to ${ outValue?.name }`);
            return outValue;
        });
    }

    public async getCurrentWebsite() : Promise<Website | undefined>
    {
        if (this.CurrentWebsite) return this.CurrentWebsite;
        let hostname : undefined | string | URL;
        try {
            hostname = window.location.hostname;
        } catch (e) { /* Ignored on purpose */ }
        const w = await this.getWebsite(hostname);
        this.CurrentWebsite = w;
        return w;
    }

    public async resolveRoute<T = any, C extends IContent = IContent>(path : string, select ?: string[], expand ?: string[]) : Promise<PathResponse<T,C | NetworkErrorData>>
    {
        // Try CD-API 2.17 method first
        const contentServiceUrl = new URL(this.ContentService, this.BaseURL);
        contentServiceUrl.searchParams.set('contentUrl', path);
        if (select) contentServiceUrl.searchParams.set('select', select.join(','));
        if (expand) contentServiceUrl.searchParams.set('expand', expand.join(','));
        const list = await this.doRequest<IContent[]>(contentServiceUrl);
        if (list && list.length === 1) {
            return list[0] as C;
        }

        // Then try the extension method
        if (this._config.EnableExtensions && !this.InEditMode) {
            const routeServiceUrl = new URL(this.RouteService, this.BaseURL);
            if (this.CurrentWebsite) routeServiceUrl.searchParams.set('siteId', this.CurrentWebsite.id);
            routeServiceUrl.searchParams.set('route', path);
            try {
                const routeResponse = await this.doRequest<ContentRoutingResponse>(routeServiceUrl);
                if (routeResponse ){
                    const iContent = await this.getContent<C>(routeResponse.contentLink);
                    if (iContent) return iContent;
                }
            } catch (e) {
                // Ignored on purpose
            }
        }

        // Fallback to resolving by accessing the URL itself
        const url = new URL(path.startsWith('/') ? path.substr(1) : path, this.BaseURL);
        if (select) url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand) url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));
        return this.doRequest<PathResponse<T,C>>(url) // .catch(e => this.createNetworkErrorResponse(e));
    }

    /**
     * Retrieve a single piece of content from Episerver
     * 
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded
     */
    public getContent<C extends IContent = IContent>(id : ContentReference, select ?: string[], expand ?: string[]) : Promise<C | NetworkErrorData> {
        // Create base URL
        const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
        const url = new URL(this.ContentService + apiId, this.BaseURL);

        // Handle additional parameters
        if (select) url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand) url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));

        // Perform request
        return this.doAdvancedRequest<C>(url).then(r => { 
            const c = r[0];
            c.serverContext = {
                propertyDataType: 'IContentDeliveryResponseContext',
                value: r[1]
            };
            return c; 
        }).catch(e => this.createNetworkErrorResponse(e));
    }

    /**
     * Retrieve a list content-items from Episerver in one round-trip
     * 
     * @param { ContentReference[] } ids The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded
     */
    public getContents<C extends IContent = IContent>(ids : ContentReference[], select ?: string[], expand ?: string[]) : Promise<C[] | NetworkErrorData[]> {
        const refs : string[] = [];
        const guids : string[] = [];
        ids?.forEach(id => {
            const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
            if (this.apiIdIsGuid(apiId)) {
                guids.push(apiId);
            } else {
                refs.push(apiId);
            }
        });

        const url : URL = new URL(this.ContentService, this.BaseURL);
        if (refs)   url.searchParams.set('references', refs.map(s => encodeURIComponent(s)).join(','));
        if (guids)  url.searchParams.set('guids',      guids.map(s => encodeURIComponent(s)).join(','));
        if (select) url.searchParams.set('select',     select.map(s => encodeURIComponent(s)).join(','));
        if (expand) url.searchParams.set('expand',     expand.map(s => encodeURIComponent(s)).join(','));

        return this.doRequest<C[]>(url).catch(e => [this.createNetworkErrorResponse(e)]);;
    }

    public getAncestors(id : ContentReference, select ?: string[], expand ?: string[]) : Promise<IContent[]>
    {
        // Create base URL
        const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
        const url = new URL(this.ContentService + apiId + '/ancestors', this.BaseURL);

        // Handle additional parameters
        if (select) url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand) url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));

        // Perform request
        return this.doRequest<IContent[]>(url).catch(e => [this.createNetworkErrorResponse(e)]);
    }

    public getChildren(id : ContentReference, select ?: string[], expand ?: string[]) : Promise<IContent[]>
    {
        // Create base URL
        const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
        const url = new URL(this.ContentService + apiId + '/children', this.BaseURL);

        // Handle additional parameters
        if (select) url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand) url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));

        // Perform request
        return this.doRequest<IContent[]>(url).catch(e => [this.createNetworkErrorResponse(e)]);
    }

    public async invoke<TypeOut extends unknown = any, TypeIn extends unknown = any>(content: ContentReference, method: string, verb?: Method, data?: TypeIn, requestTransformer?: AxiosTransformer): Promise<ActionResponse<TypeOut | NetworkErrorData, IContent>>
    {
        if (!this._config.EnableExtensions) return Promise.reject('Extensions must be enabled to use the invoke method');

        // Base configuration
        const apiId = ContentLinkService.createApiId(content, !this.InEditMode, this.InEditMode);
        const url = new URL(this.MethodService + apiId + '/' + method, this.BaseURL);

        // Default JSON Transformer for request data
        const defaultTransformer : AxiosTransformer = (reqData, reqHeaders) => {
            if (reqData) {
                reqHeaders['Content-Type'] = 'application/json';
                return JSON.stringify(reqData);
            }
            return reqData;
        }

        // Axios request config
        const options : Partial<AxiosRequestConfig> = {
            method: verb,
            data,

            transformRequest: requestTransformer || defaultTransformer
        }

        // Run the actual request
        return this.doRequest<ActionResponse<TypeOut | NetworkErrorData, IContent>>(url, options).catch((e : Error) => {
            const errorResponse = this.createNetworkErrorResponse(e);
            const actionResponse : ActionResponse<NetworkErrorData, NetworkErrorData> = {
                actionName: method,
                contentLink: errorResponse.contentLink,
                currentContent: errorResponse,
                responseType: ResponseType.ActionResult,
                data: errorResponse,
                language: this.Language,
                name: typeof(errorResponse.name) === "string" ? errorResponse.name : errorResponse.name.value,
                url: errorResponse.contentLink.url
            }
            return actionResponse;
        });
    }

    public isServiceURL(url : URL|string) : boolean
    {
        const reqUrl : URL = typeof(url) === 'string' ? new URL(url) : url;
        const serviceUrls : URL[] = [
            new URL(this.AuthService, this.BaseURL),
            new URL(this.ContentService, this.BaseURL),
            new URL(this.MethodService, this.BaseURL),
            new URL(this.SiteService, this.BaseURL)
        ];
        let isServiceURL : boolean = false;
        serviceUrls?.forEach(u => isServiceURL = isServiceURL || reqUrl.href.startsWith(u.href));
        return isServiceURL;
    }

    public raw<TypeOut>(url: string | URL, options: Partial<AxiosRequestConfig> = {}, addDefaultQueryParams: boolean = true): Promise<IContentDeliveryResponse<TypeOut>> {
        return this.doAdvancedRequest(url, options, addDefaultQueryParams, true);
    }

    protected apiIdIsGuid(apiId : string) : boolean 
    {
        const guidRegex = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/
        return apiId.match(guidRegex) ? true : false;
    }

    
    private async doRequest<T>(url: string | URL, options: Partial<AxiosRequestConfig> = {}, addDefaultQueryParams : boolean = true) : Promise<T>
    {
        const [ responseData, responseInfo ] = await this.doAdvancedRequest<T>(url, options, addDefaultQueryParams);
        return responseData;
    }

    protected async doAdvancedRequest<T>(url: string | URL, options: Partial<AxiosRequestConfig> = {}, addDefaultQueryParams : boolean = true, returnOnError : boolean = false) : Promise<IContentDeliveryResponse<T>>
    {
        // Pre-process URL
        const requestUrl : URL = typeof(url) === "string" ? new URL(url, this.BaseURL) : url;
        if (addDefaultQueryParams) {
            if (this.InEditMode) {
                requestUrl.searchParams.set('epieditmode', 'True');
                requestUrl.searchParams.set('preventcache', Math.round(Math.random() * 100000000).toString());

                // Propagate the view configurations
                try {
                    const windowSearchParams = new URLSearchParams(window?.location?.search);
                    const toTransfer = ['visitorgroupsByID','epiprojects','commondrafts','epichannel'];
                    toTransfer.forEach(param => {
                        if (!requestUrl.searchParams.has(param) && windowSearchParams.has(param)) {
                            requestUrl.searchParams.set(param, windowSearchParams.get(param) as string);
                        }
                    });
                } catch (e) {
                    // Ignore on purpose
                }
            }
            if (requestUrl.pathname.indexOf(this.ContentService) && this._config.AutoExpandAll && !requestUrl.searchParams.has('expand')) {
                requestUrl.searchParams.set('expand', '*');
            }
        }

        // Create request configuration
        const requestConfig : AxiosRequestConfig = { ...this.getDefaultRequestConfig(), ...options }
        requestConfig.url = requestUrl.href;

        // Add the token if needed
        if (requestUrl.href.indexOf(this.AuthService) < 0) { // Do not add for the auth service itself
            const currentToken = this.TokenProvider ? await this.TokenProvider.getCurrentToken() : undefined;
            if (currentToken) { // Only if we have a current token
                requestConfig.headers = requestConfig.headers || {};
                requestConfig.headers.Authorization = `Bearer ${ currentToken.access_token }`;
            }
        }

        // Execute request
        try {
            if (this._config.Debug) console.info('ContentDeliveryAPI Requesting', requestConfig.method+' '+requestConfig.url, requestConfig.data);
            const response = await this.Axios.request<T>(requestConfig);
            if (response.status >= 400 && !returnOnError) {
                if (this._config.Debug) console.info(`ContentDeliveryAPI Error ${ response.status }: ${ response.statusText }`, requestConfig.method+' '+requestConfig.url);
                throw new Error(`${ response.status }: ${ response.statusText }`);
            }
            const data = response.data;
            const ctx : IContentDeliveryResponseContext = {
                status: response.status,
                statusText: response.statusText,
                method: requestConfig.method?.toLowerCase() || 'default'
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
                        ctx.cacheControl = (response.headers['cache-control'] as string).split(',').map(s => s.trim());
                        break;
                    default:
                        // Do Nothing
                        break;
                }
            }
            if (this._config.Debug) console.info('ContentDeliveryAPI Response', requestConfig.method+' '+requestConfig.url, data, response.headers);
            return [ data, ctx ];
        } catch (e) {
            if (this._config.Debug) console.info('ContentDeliveryAPI Error', requestConfig.method+' '+requestConfig.url, e);
            throw e;
        }
    }

    protected getDefaultRequestConfig() : AxiosRequestConfig
    {
        const config : AxiosRequestConfig = {
            method: "GET",
            baseURL: this.BaseURL,
            withCredentials: true,
            headers: this.getHeaders(),
            responseType: "json"
        };

        // Set the adapter if needed
        if (this._config.Adapter && typeof(this._config.Adapter) === 'function') {
            config.adapter = this._config.Adapter
        }

        return config;
    }

    protected getHeaders(customHeaders?: AxiosHeaders): AxiosHeaders {
        const defaultHeaders : AxiosHeaders = {
            'Accept': 'application/json', // Requested response data format
            'Accept-Language': this.Language, // Requested language branch
            'Content-Type': 'application/json', // Request data format
        };
        if (!customHeaders) return defaultHeaders;

        return {
            ...defaultHeaders,
            ...customHeaders,
        };
    }

    protected errorCounter : number = 0;

    protected createNetworkErrorResponse<T extends unknown = any>(e : T) : NetworkErrorData<T>
    {
        const errorId = ++this.errorCounter;
        return {
            contentLink: {
                guidValue: UUID.v4(),
                id: errorId,
                providerName: 'EpiserverSPA',
                workId: 0,
                url: '#EpiserverSPA__'+errorId
            },
            name: 'Network error',
            error: {
                propertyDataType: 'errorMessage',
                value: e
            },
            contentType: ['Errors', 'NetworkError']
        }
    }
}
export type AxiosHeaders = { [key: string] : string }
export default ContentDeliveryAPI