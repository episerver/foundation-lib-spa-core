import Axios, {  AxiosInstance, AxiosRequestConfig, AxiosTransformer, Method } from 'axios';
import * as UUID from 'uuid';
import IContentDeliveryAPi from './IContentDeliveryAPI';
import ContentDeliveryApiConfig, { DefaultConfig } from './Config';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
import IContent from '../Models/IContent';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import { PathResponse, NetworkErrorData } from '../ContentDeliveryAPI';
import ContentRoutingResponse from './ContentRoutingResponse';
import ActionResponse, { ResponseType } from '../Models/ActionResponse';

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

    public async login(username: string, password: string) : Promise<boolean>
    {
        const params = new URLSearchParams();
        params.append('grant_type', 'password')
        params.append('username', username)
        params.append('password', password)
        params.append('client_id', 'Default')

        this.doRequest(this.AuthService, {
            method: "POST",
            data: params,
            headers: this.getHeaders({
                "Content-Type": "application/x-www-form-urlencoded"
            })
        });
        return Promise.resolve(true);
    }

    public getWebsites() : Promise<WebsiteList>
    {
        return this.doRequest<WebsiteList>(this.SiteService).catch(() => []);
    }

    public async getWebsite(hostname ?: string | URL) : Promise<Website | undefined>
    {
        switch (typeof(hostname)) {
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
            let website: Website | undefined;
            let starWebsite: Website | undefined;
            websites.forEach(w => {
                if (w.hosts) w.hosts.forEach(h => {
                    website = website || h.name === hostname ? w : undefined;
                    starWebsite = starWebsite || h.name === '*' ? w : undefined;
                });
            });
            return website || starWebsite;
        });
    }

    public resolveRoute<T = any, C extends IContent = IContent>(path : string, select ?: string[], expand ?: string[]) : Promise<PathResponse<T,C | NetworkErrorData>>
    {
        if (this._config.EnableExtensions && !this.InEditMode) {
            const serviceUrl = new URL(this.RouteService, this.BaseURL);
            if (this.CurrentWebsite) serviceUrl.searchParams.set('siteId', this.CurrentWebsite.id);
            serviceUrl.searchParams.set('route', path);
            return this.doRequest<ContentRoutingResponse>(serviceUrl).then(r => this.getContent<C>(r.contentLink)).catch(e => this.createNetworkErrorResponse(e));
        }

        const url = new URL(path.startsWith('/') ? path.substr(1) : path, this.BaseURL);

        // Handle additional parameters
        if (select) url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand) url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));

        // Perform request
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
        const apiId = ContentLinkService.createApiId(id, true);
        const url = new URL(this.ContentService + apiId, this.BaseURL);

        // Handle additional parameters
        if (select) url.searchParams.set('select', select.map(s => encodeURIComponent(s)).join(','));
        if (expand) url.searchParams.set('expand', expand.map(s => encodeURIComponent(s)).join(','));

        // Perform request
        return this.doRequest<C>(url).catch(e => this.createNetworkErrorResponse(e));
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
            const apiId = ContentLinkService.createApiId(id, true);
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
        const apiId = ContentLinkService.createApiId(id, true);
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
        const apiId = ContentLinkService.createApiId(id, true);
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
        const apiId = ContentLinkService.createApiId(content, true);
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

    protected apiIdIsGuid(apiId : string) : boolean 
    {
        const guidRegex = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/
        return apiId.match(guidRegex) ? true : false;
    }

    protected async doRequest<T>(url: string | URL, options: Partial<AxiosRequestConfig> = {}) : Promise<T>
    {
        // Pre-process URL
        const requestUrl : URL = typeof(url) === "string" ? new URL(url.toLowerCase(), this.BaseURL) : url;
        if (this.InEditMode) {
            requestUrl.searchParams.set('epieditmode', 'True');
            requestUrl.searchParams.set('preventcache', Math.round(Math.random() * 100000000).toString());
        }
        if (requestUrl.pathname.indexOf(this.ContentService) && this._config.AutoExpandAll && !requestUrl.searchParams.has('expand')) {
            requestUrl.searchParams.set('expand', '*');
        }

        // Create request configuration
        const requestConfig : AxiosRequestConfig = { ...this.getDefaultRequestConfig(), ...options }
        requestConfig.url = requestUrl.href;

        // Add the token if needed
        /*if (this.Token) {
            requestConfig.headers = requestConfig.headers || {};
            requestConfig.headers['Authorization'] = `Bearer ${ this.Token}`;
        }*/

        // Execute request
        try {
            if (this._config.Debug) console.info('ContentDeliveryAPI Requesting', requestConfig.method+' '+requestConfig.url, requestConfig.data);
            const response = await this.Axios.request<T>(requestConfig);
            if (response.status >= 400) {
                if (this._config.Debug) console.info(`ContentDeliveryAPI Error ${ response.status }: ${ response.statusText }`, requestConfig.method+' '+requestConfig.url);
                throw new Error(`${ response.status }: ${ response.statusText }`);
            }
            const data = response.data;
            if (this._config.Debug) console.info('ContentDeliveryAPI Response', requestConfig.method+' '+requestConfig.url, data);
            return data;
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