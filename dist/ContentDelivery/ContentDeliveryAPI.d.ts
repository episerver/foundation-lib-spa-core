import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosTransformer, Method } from 'axios';
import IContentDeliveryAPi, { IContentDeliveryResponse, IContentDeliverySearchResults } from './IContentDeliveryAPI';
import ContentDeliveryApiConfig from './Config';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
import IContent from '../Models/IContent';
import { ContentReference } from '../Models/ContentLink';
import { PathResponse, NetworkErrorData } from '../ContentDeliveryAPI';
import ActionResponse from '../Models/ActionResponse';
import { IOAuthRequest, IOAuthResponse } from './IAuthService';
import IAuthTokenProvider from './IAuthTokenProvider';
export declare class ContentDeliveryAPI implements IContentDeliveryAPi {
    readonly ContentService: string;
    readonly SiteService: string;
    readonly MethodService: string;
    readonly AuthService: string;
    readonly ModelService: string;
    readonly SearchService: string;
    private _config;
    private _axios;
    private _axiosStatic;
    constructor(config: Partial<ContentDeliveryApiConfig>);
    protected get Axios(): AxiosInstance;
    CurrentWebsite?: Website;
    /**
     * If set, this is the token to be used when authorizing requests
     */
    TokenProvider?: IAuthTokenProvider;
    get InEditMode(): boolean;
    set InEditMode(value: boolean);
    get Language(): string;
    set Language(value: string);
    get BaseURL(): string;
    get OnLine(): boolean;
    get InEpiserverShell(): boolean;
    login(username: string, password: string): Promise<IOAuthResponse>;
    refreshToken(refreshToken: string): Promise<IOAuthResponse>;
    protected doOAuthRequest(request: IOAuthRequest): Promise<IOAuthResponse>;
    getWebsites(): Promise<WebsiteList>;
    getWebsite(hostname?: string | URL): Promise<Website | undefined>;
    getCurrentWebsite(): Promise<Website | undefined>;
    resolveRoute<T = any, C extends IContent = IContent>(path: string, select?: string[], expand?: string[]): Promise<PathResponse<T, C | NetworkErrorData>>;
    /**
     * Retrieve a single piece of content from Episerver
     *
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded
     */
    getContent<C extends IContent = IContent>(id: ContentReference, select?: string[], expand?: string[]): Promise<C | NetworkErrorData>;
    /**
     * Retrieve a list content-items from Episerver in one round-trip
     *
     * @param { ContentReference[] } ids The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded
     */
    getContents<C extends IContent = IContent>(ids: ContentReference[], select?: string[], expand?: string[]): Promise<C[] | NetworkErrorData[]>;
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
    basicSearch<T extends IContent = IContent>(query: string, orderBy?: string, skip?: number, top?: number, personalized?: boolean, select?: string[], expand?: string[]): Promise<IContentDeliverySearchResults<T>>;
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
    search<T extends IContent = IContent>(query: string, orderBy: string, skip?: number, top?: number, personalized?: boolean, select?: string[], expand?: string[]): Promise<IContentDeliverySearchResults<T>>;
    getAncestors(id: ContentReference, select?: string[], expand?: string[]): Promise<IContent[]>;
    getChildren(id: ContentReference, select?: string[], expand?: string[]): Promise<IContent[]>;
    invoke<TypeOut extends unknown = any, TypeIn extends unknown = any>(content: ContentReference, method: string, verb?: Method, data?: TypeIn, requestTransformer?: AxiosTransformer): Promise<ActionResponse<TypeOut | NetworkErrorData, IContent>>;
    isServiceURL(url: URL | string): boolean;
    raw<TypeOut>(url: string | URL, options?: Partial<AxiosRequestConfig>, addDefaultQueryParams?: boolean): Promise<IContentDeliveryResponse<TypeOut | NetworkErrorData>>;
    protected apiIdIsGuid(apiId: string): boolean;
    private doRequest;
    protected doAdvancedRequest<T>(url: string | URL, options?: Partial<AxiosRequestConfig>, addDefaultQueryParams?: boolean, returnOnError?: boolean): Promise<IContentDeliveryResponse<T | NetworkErrorData>>;
    protected getDefaultRequestConfig(): AxiosRequestConfig;
    protected getHeaders(customHeaders?: AxiosHeaders): AxiosHeaders;
    protected errorCounter: number;
    protected createNetworkErrorResponse<T extends unknown = any>(error: T, response?: AxiosResponse): NetworkErrorData<T>;
}
export declare type AxiosHeaders = {
    [key: string]: string;
};
export default ContentDeliveryAPI;
