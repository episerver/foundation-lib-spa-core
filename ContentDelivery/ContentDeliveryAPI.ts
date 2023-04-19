import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosStatic, AxiosTransformer, Method } from 'axios';
import * as UUID from 'uuid';
import IContentDeliveryAPi, {
  IContentDeliveryResponse,
  IContentDeliveryResponseContext,
  IContentDeliverySearchResults,
  isNetworkError,
} from './IContentDeliveryAPI';
import ContentDeliveryApiConfig, { DefaultConfig } from './Config';
import Website from '../Models/Website';
import WebsiteList, { hostnameFilter } from '../Models/WebsiteList';
import IContent from '../Models/IContent';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import { PathResponse, NetworkErrorData } from '../ContentDeliveryAPI';
import ActionResponse, { ResponseType } from '../Models/ActionResponse';
import { IOAuthRequest, IOAuthResponse, networkErrorToOAuthError } from './IAuthService';
import IAuthTokenProvider from './IAuthTokenProvider';

export class ContentDeliveryAPI implements IContentDeliveryAPi {
  public readonly ContentService: string = 'api/haldex/v1.0/cda/v3/content/';
  public readonly SiteService: string = 'api/haldex/v1.0/cda/v3/site/';
  public readonly MethodService: string = 'api/haldex/v1.0/cda/v3/action/';
  public readonly AuthService: string = 'api/episerver/auth/token';
  public readonly ModelService: string = 'api/haldex/v1.0/cda/v3/model/';
  public readonly SearchService: string = 'api/haldex/v1.0/cda/v3/search/content';

  private _config: ContentDeliveryApiConfig;
  private _axios: AxiosInstance;
  private _axiosStatic: AxiosStatic;

  public constructor(config: Partial<ContentDeliveryApiConfig>) {
    this._config = { ...DefaultConfig, ...config };
    this._axiosStatic = Axios;
    this._axios = Axios.create(this.getDefaultRequestConfig());
  }

  protected get Axios(): AxiosInstance {
    return this._axios;
  }

  public CurrentWebsite?: Website;

  /**
   * If set, this is the token to be used when authorizing requests
   */
  public TokenProvider?: IAuthTokenProvider;

  public get InEditMode(): boolean {
    return this._config.InEditMode;
  }

  public set InEditMode(value: boolean) {
    this._config.InEditMode = value;
  }

  public get Language(): string {
    return this._config.Language;
  }
  public set Language(value: string) {
    this._config.Language = value;
  }

  public get BaseURL(): string {
    return this._config.BaseURL.endsWith('/') ? this._config.BaseURL : this._config.BaseURL + '/';
  }

  public get OnLine(): boolean {
    // Do not invalidate while we're off-line
    try {
      if (navigator && !navigator.onLine) return false;
    } catch (e) {
      // There's no navigator object with onLine property...
    }
    return true;
  }

  public get InEpiserverShell(): boolean {
    try {
      return window !== window?.top && window?.name === 'sitePreview';
    } catch (e) {
      // Ignored on purpose
    }
    return false;
  }

  public login(username: string, password: string): Promise<IOAuthResponse> {
    const params: IOAuthRequest = {
      client_id: 'Default',
      grant_type: 'password',
      username,
      password,
    };

    return this.doOAuthRequest(params);
  }

  public refreshToken(refreshToken: string): Promise<IOAuthResponse> {
    const params: IOAuthRequest = {
      client_id: 'Default',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    return this.doOAuthRequest(params);
  }

  protected doOAuthRequest(request: IOAuthRequest): Promise<IOAuthResponse> {
    return this.doAdvancedRequest<IOAuthResponse>(
      this.AuthService,
      {
        method: 'POST',
        data: request,
        maxRedirects: 0, // Fail on redirect
        transformRequest: (data: object, headers: AxiosHeaders): string => {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          return Object.entries(data)
            .map((x) => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
            .join('&');
        },
      },
      false,
      true,
    )
      .then((r) => r[0])
      .then((r) => (isNetworkError(r) ? networkErrorToOAuthError(r) : r));
  }

  public getWebsites(): Promise<WebsiteList> {
    return this.doRequest<WebsiteList>(this.SiteService)
      .then((r) => (isNetworkError(r) ? [] : r))
      .catch(() => []);
  }

  public async getWebsite(hostname?: string | URL): Promise<Website | undefined> {
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
    if (this._config.Debug) console.log(`ContentDeliveryAPI: Resolving website for: ${processedHost}`);
    return this.getWebsites().then((websites) => {
      const website: Website | undefined = websites
        .filter((w) => hostnameFilter(w, processedHost, undefined, false))
        .shift();
      const starWebsite: Website | undefined = websites.filter((w) => hostnameFilter(w, '*', undefined, false)).shift();
      const outValue = website || starWebsite;
      if (this._config.Debug)
        console.log(`ContentDeliveryAPI: Resolved website for: ${processedHost} to ${outValue?.name}`);
      return outValue;
    });
  }

  public async getCurrentWebsite(): Promise<Website | undefined> {
    if (this.CurrentWebsite) return this.CurrentWebsite;
    let hostname: undefined | string | URL;
    try {
      hostname = window.location.host;
    } catch (e) {
      /* Ignored on purpose */
    }
    const w = await this.getWebsite(hostname);
    this.CurrentWebsite = w;
    return w;
  }

  public async resolveRoute<T = any, C extends IContent = IContent>(
    path: string,
    select?: string[],
    expand?: string[],
  ): Promise<PathResponse<T, C | NetworkErrorData>> {
    // Try CD-API 2.17+ method first
    const contentServiceUrl = new URL(this.ContentService, this.BaseURL);
    contentServiceUrl.searchParams.set('contentUrl', path);
    if (select) contentServiceUrl.searchParams.set('select', select.join(','));
    if (expand) contentServiceUrl.searchParams.set('expand', expand.join(','));
    const list = await this.doRequest<IContent[]>(contentServiceUrl);
    if (isNetworkError(list)) return list;
    if (list && list.length === 1) return list[0] as C;

    // Fallback to resolving by accessing the URL itself
    const url = new URL(path.startsWith('/') ? path.substr(1) : path, this.BaseURL);
    if (select) url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
    if (expand) url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));
    return this.doRequest<PathResponse<T, C>>(url); // .catch(e => this.createNetworkErrorResponse(e));
  }

  /**
   * Retrieve a single piece of content from Episerver
   *
   * @param { ContentReference } id The content to fetch from Episerver
   * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
   * @param { string[] } expand The list of fields that need to be expanded
   */
  public getContent<C extends IContent = IContent>(
    id: ContentReference,
    select?: string[],
    expand?: string[],
  ): Promise<C | NetworkErrorData> {
    // Create base URL
    const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
    const url = new URL(this.ContentService + apiId, this.BaseURL);

    // Handle additional parameters
    if (select) url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
    if (expand) url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));

    // Perform request
    return this.doAdvancedRequest<C>(url)
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
  public getContents<C extends IContent = IContent>(
    ids: ContentReference[],
    select?: string[],
    expand?: string[],
  ): Promise<C[] | NetworkErrorData[]> {
    const refs: string[] = [];
    const guids: string[] = [];
    ids?.forEach((id) => {
      const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
      if (this.apiIdIsGuid(apiId)) {
        guids.push(apiId);
      } else {
        refs.push(apiId);
      }
    });

    const url: URL = new URL(this.ContentService, this.BaseURL);
    if (refs) url.searchParams.set('references', refs.map((s) => encodeURIComponent(s)).join(','));
    if (guids) url.searchParams.set('guids', guids.map((s) => encodeURIComponent(s)).join(','));
    if (select) url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
    if (expand) url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));

    return this.doRequest<C[]>(url)
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
  public async basicSearch<T extends IContent = IContent>(
    query: string,
    orderBy?: string,
    skip?: number,
    top?: number,
    personalized?: boolean,
    select?: string[],
    expand?: string[],
  ): Promise<IContentDeliverySearchResults<T>> {
    if (!this.OnLine) return Promise.resolve({ TotalMatching: 0, Results: [] });

    const params = new URLSearchParams();
    params.set('query', query);
    if (orderBy) params.set('orderBy', orderBy);
    if (skip) params.set('skip', skip.toString());
    if (top) params.set('top', top.toString());
    if (select) params.set('select', select.join(','));
    if (expand) params.set('expand', expand.join(','));
    if (personalized) params.set('personalize', 'true');

    const url = this.SearchService + '?' + params.toString();
    const data = await this.doAdvancedRequest<IContentDeliverySearchResults<T>>(url, {}, true, false).then((r) => {
      if (isNetworkError(r[0])) {
        const errorResponse: IContentDeliverySearchResults<T> = {
          TotalMatching: 0,
          Results: [],
        };
        return errorResponse;
      } else return r[0];
    });
    return data;
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
  public search<T extends IContent = IContent>(
    query: string,
    orderBy: string,
    skip?: number,
    top?: number,
    personalized?: boolean,
    select?: string[],
    expand?: string[],
  ): Promise<IContentDeliverySearchResults<T>> {
    return Promise.resolve({ TotalMatching: 0, Results: [] });
  }

  public getAncestors(id: ContentReference, select?: string[], expand?: string[]): Promise<IContent[]> {
    // Create base URL
    const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
    const url = new URL(this.ContentService + apiId + '/ancestors', this.BaseURL);

    // Handle additional parameters
    if (select) url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
    if (expand) url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));

    // Perform request
    return this.doRequest<IContent[]>(url)
      .then((r) => (isNetworkError(r) ? [r] : r))
      .catch((e) => [this.createNetworkErrorResponse(e)]);
  }

  public getChildren(id: ContentReference, select?: string[], expand?: string[]): Promise<IContent[]> {
    // Create base URL
    const apiId = ContentLinkService.createApiId(id, !this.InEditMode, this.InEditMode);
    const url = new URL(this.ContentService + apiId + '/children', this.BaseURL);

    // Handle additional parameters
    if (select) url.searchParams.set('select', select.map((s) => encodeURIComponent(s)).join(','));
    if (expand) url.searchParams.set('expand', expand.map((s) => encodeURIComponent(s)).join(','));

    // Perform request
    return this.doRequest<IContent[]>(url)
      .then((r) => (isNetworkError(r) ? [r] : r))
      .catch((e) => [this.createNetworkErrorResponse(e)]);
  }

  public async invoke<TypeOut extends unknown = any, TypeIn extends unknown = any>(
    content: ContentReference,
    method: string,
    verb?: Method,
    data?: TypeIn,
    requestTransformer?: AxiosTransformer,
  ): Promise<ActionResponse<TypeOut | NetworkErrorData, IContent>> {
    if (!this._config.EnableExtensions) return Promise.reject('Extensions must be enabled to use the invoke method');

    // Base configuration
    const apiId = ContentLinkService.createApiId(content, !this.InEditMode, this.InEditMode);
    const url = new URL(this.MethodService + apiId + '/' + method, this.BaseURL);

    // Default JSON Transformer for request data
    const defaultTransformer: AxiosTransformer = (reqData, reqHeaders) => {
      if (reqData) {
        reqHeaders['Content-Type'] = 'application/json';
        return JSON.stringify(reqData);
      }
      return reqData;
    };

    // Axios request config
    const options: Partial<AxiosRequestConfig> = {
      method: verb,
      data,

      transformRequest: requestTransformer || defaultTransformer,
    };

    const createActionErrorResponse = (error: NetworkErrorData): ActionResponse<NetworkErrorData, NetworkErrorData> => {
      const actionResponse: ActionResponse<NetworkErrorData, NetworkErrorData> = {
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
    return this.doRequest<ActionResponse<TypeOut | NetworkErrorData, IContent>>(url, options)
      .then((r) => (isNetworkError(r) ? createActionErrorResponse(r) : r))
      .catch((e: Error) => {
        const errorResponse = this.createNetworkErrorResponse(e);
        return createActionErrorResponse(errorResponse);
      });
  }

  public isServiceURL(url: URL | string): boolean {
    const reqUrl: URL = typeof url === 'string' ? new URL(url) : url;
    const serviceUrls: URL[] = [
      new URL(this.AuthService, this.BaseURL),
      new URL(this.ContentService, this.BaseURL),
      new URL(this.MethodService, this.BaseURL),
      new URL(this.SiteService, this.BaseURL),
    ];
    let isServiceURL = false;
    serviceUrls?.forEach((u) => (isServiceURL = isServiceURL || reqUrl.href.startsWith(u.href)));
    return isServiceURL;
  }

  public raw<TypeOut>(
    url: string | URL,
    options: Partial<AxiosRequestConfig> = {},
    addDefaultQueryParams = true,
  ): Promise<IContentDeliveryResponse<TypeOut | NetworkErrorData>> {
    return this.doAdvancedRequest<TypeOut>(url, options, addDefaultQueryParams, true);
  }

  protected apiIdIsGuid(apiId: string): boolean {
    const guidRegex = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/;
    return apiId.match(guidRegex) ? true : false;
  }

  private async doRequest<T>(
    url: string | URL,
    options: Partial<AxiosRequestConfig> = {},
    addDefaultQueryParams = true,
  ): Promise<T | NetworkErrorData> {
    const [responseData, responseInfo] = await this.doAdvancedRequest<T>(url, options, addDefaultQueryParams);
    return responseData;
  }

  protected async doAdvancedRequest<T>(
    url: string | URL,
    options: Partial<AxiosRequestConfig> = {},
    addDefaultQueryParams = true,
    returnOnError = false,
  ): Promise<IContentDeliveryResponse<T | NetworkErrorData>> {
    // Pre-process URL
    const requestUrl: URL = typeof url === 'string' ? new URL(url, this.BaseURL) : url;
    if (addDefaultQueryParams) {
      if (this.InEditMode) {
        requestUrl.searchParams.set('epieditmode', 'True');
        requestUrl.searchParams.set('preventcache', Math.round(Math.random() * 100000000).toString());

        // Propagate the view configurations
        try {
          const windowSearchParams = new URLSearchParams(window?.location?.search);
          const toTransfer = ['visitorgroupsByID', 'epiprojects', 'commondrafts', 'epichannel'];
          toTransfer.forEach((param) => {
            if (!requestUrl.searchParams.has(param) && windowSearchParams.has(param)) {
              requestUrl.searchParams.set(param, windowSearchParams.get(param) as string);
            }
          });
        } catch (e) {
          // Ignore on purpose
        }
      }
      if (
        requestUrl.pathname.indexOf(this.ContentService) &&
        this._config.AutoExpandAll &&
        !requestUrl.searchParams.has('expand')
      ) {
        requestUrl.searchParams.set('expand', '*');
      }
    }

    // Create request configuration
    const requestConfig: AxiosRequestConfig = { ...this.getDefaultRequestConfig(), ...options };
    requestConfig.url = requestUrl.href;

    // Add the token if needed
    if (requestUrl.href.indexOf(this.AuthService) < 0) {
      // Do not add for the auth service itself
      const currentToken = this.TokenProvider ? await this.TokenProvider.getCurrentToken() : undefined;
      if (currentToken) {
        // Only if we have a current token
        requestConfig.headers = requestConfig.headers || {};
        requestConfig.headers.Authorization = `Bearer ${currentToken.access_token}`;
      }
    }

    // Execute request
    try {
      if (this._config.Debug)
        console.info(
          'ContentDeliveryAPI Requesting',
          requestConfig.method + ' ' + requestConfig.url,
          requestConfig.data,
        );
      const response = await this.Axios.request<T>(requestConfig);
      if (response.status >= 400 && !returnOnError && response.status !== 401) {
        if (this._config.Debug)
          console.info(
            `ContentDeliveryAPI Error ${response.status}: ${response.statusText}`,
            requestConfig.method + ' ' + requestConfig.url,
          );
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      if (response.status == 301 || response.status == 302) {
        window.location.href = response.headers["redirectUrl"];
      }

      const data = response.data || this.createNetworkErrorResponse('Empty response', response);
      const ctx: IContentDeliveryResponseContext = {
        status: response.status,
        statusText: response.statusText,
        method: requestConfig.method?.toLowerCase() || 'default',
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
            ctx.cacheControl = (response.headers['cache-control'] as string).split(',').map((s) => s.trim());
            break;
          default:
            // Do Nothing
            break;
        }
      }
      if (this._config.Debug)
        console.info(
          'ContentDeliveryAPI Response',
          requestConfig.method + ' ' + requestConfig.url,
          data,
          response.headers,
        );
      return [data, ctx];
    } catch (e) {
      if (this._config.Debug)
        console.info('ContentDeliveryAPI Error', requestConfig.method + ' ' + requestConfig.url, e);
      throw e;
    }
  }

  protected getDefaultRequestConfig(): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
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

  protected getHeaders(customHeaders?: AxiosHeaders): AxiosHeaders {
    const defaultHeaders: AxiosHeaders = {
      Accept: 'application/json', // Requested response data format
      'Accept-Language': this.Language, // Requested language branch
      'Content-Type': 'application/json', // Request data format
      'X-IContent-Language': this.Language, // Requested language branch
    };
    if (!customHeaders) return defaultHeaders;

    return {
      ...defaultHeaders,
      ...customHeaders,
    };
  }

  protected errorCounter = 0;

  protected createNetworkErrorResponse<T extends unknown = any>(
    error: T,
    response?: AxiosResponse,
  ): NetworkErrorData<T> {
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
export type AxiosHeaders = { [key: string]: string };
export default ContentDeliveryAPI;
