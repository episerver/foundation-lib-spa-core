import { Method, AxiosTransformer, AxiosRequestConfig } from 'axios';
import ActionResponse from '../Models/ActionResponse';
import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
import { PathResponse, NetworkErrorData } from '../ContentDeliveryAPI';
import { IOAuthResponse } from './IAuthService';
import IAuthTokenProvider from './IAuthTokenProvider';
export declare function isNetworkError(content: any): content is NetworkErrorData;
export declare type IContentDeliverySearchResults<T extends IContent = IContent> = {
    TotalMatching: number;
    Results: T[];
};
export declare type IContentDeliveryResponse<T> = [T, IContentDeliveryResponseContext];
export declare type IContentDeliveryResponseContext = {
    etag?: string;
    date?: string;
    cacheControl?: string[];
    status: number;
    statusText: string;
    method: string;
};
/**
 * Service definition for the Episerver Content Delivery API. This is a
 * straight wrapper for the ContentDeliveryAPI and does not implement any
 * form of Client Side caching, that should be added at a higher level.
 *
 * If desired it is possible to override the AxiosAdapter to add low-level
 * request/response caching, however that may or may not be desired for your
 * use case.
 */
export declare type IContentDeliveryAPI = {
    /**
     * Flag to get if the page is running in the Episerver Shell, or related
     * views.
     */
    readonly InEpiserverShell: boolean;
    /**
     * Flag to get/set whether or not the requests to the ContentDeliveryAPI
     * should be done with the Edit Mode flag present.
     */
    InEditMode: boolean;
    /**
     * The language to use when connecting to the ContentDeliveryAPI. This
     * should normally dictate which language branch will be used by Episerver
     * when loading the content.
     */
    Language: string;
    /**
     * The BaseURL for requests to the Episerver ContentDeliveryAPI, this is
     * where Episerver is installed.
     */
    readonly BaseURL: string;
    /**
     * If set, this is the website used for resolving routes. This requires the
     * site to have the extensions to be installed and enabled in the configuration
     * of the ContentDelivery API.
     */
    CurrentWebsite?: Website;
    /**
     * The provider that grants access to the current authentication token
     */
    TokenProvider?: IAuthTokenProvider;
    /**
     * Check if we're currenlty online, if this returns false the browser is aware of an off-line status, if it returns true
     * network connectivity might still fail.
     *
     * @returns { boolean } False if the browser knows the network is down, True otherwise
     */
    readonly OnLine: boolean;
    /**
     * Authenticate a user using the Username and Password provided
     *
     * @param {string}  username    The username provided
     * @param {string}  password    The password provided
     * @returns {boolean} A boolean result,
     */
    login(username: string, password: string): Promise<IOAuthResponse>;
    /**
     * Prolongate the current session
     *
     * @param {string} token The current session prolongation token
     */
    refreshToken(token: string): Promise<IOAuthResponse>;
    /**
     * Retrieve the list of all websites registered within Episerver CMS
     */
    getWebsites(): Promise<WebsiteList>;
    /**
     * Get the website for the specified host
     *
     * @param { string | URL } hostname The hostname to get the website for
     * @returns { Promise<Website | undefined> }
     */
    getWebsite(hostname?: string | URL): Promise<Website | undefined>;
    /**
     * Get the current website
     *
     * @param { string | URL } hostname The hostname to get the website for
     * @returns { Promise<Website | undefined> }
     */
    getCurrentWebsite(): Promise<Website | undefined>;
    /**
     * Execute a routing request to resolve a path to IContent item
     *
     * @param { string } path The path to resolve to an IContent item
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent | undefined> } The referenced IContent item, or undefined if not found
     */
    resolveRoute<T = any, C extends IContent = IContent>(path: string, select?: string[], expand?: string[]): Promise<PathResponse<T, C | NetworkErrorData>>;
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
    /**
     * Retrieve a single piece of content from Episerver
     *
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent | undefined> } The referenced IContent item, or undefined if not found
     */
    getContent<C extends IContent = IContent>(id: ContentReference, select?: string[], expand?: string[]): Promise<C | NetworkErrorData>;
    /**
     * Retrieve a list content-items from Episerver in one round-trip
     *
     * @param { ContentReference[] } ids The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent[]> } The referenced IContent items
     */
    getContents<C extends IContent = IContent>(ids: ContentReference[], select?: string[], expand?: string[]): Promise<C[] | NetworkErrorData[]>;
    /**
     * Retrieve the parents in the Episerver content tree for the referenced
     * content item
     *
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent[] | undefined> } The parents of the referenced IContent item, or undefined if not found
     */
    getAncestors(id: ContentReference, select?: string[], expand?: string[]): Promise<IContent[]>;
    /**
     * Retrieve the children in the Episerver content tree for the referenced
     * content item
     *
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent[]|undefined> } The children of the referenced IContent item, or undefined if not found
     */
    getChildren(id: ContentReference, select?: string[], expand?: string[]): Promise<IContent[]>;
    /**
     * Verify if the provided URL is one the ContentDeliveryAPI services, it
     * thus does not checks if the URL is routeable by Episerver.
     *
     * @param { string | URL } url The URL to test
     * @returns { boolean } True when the URL is a ContentDeliveryAPI service, False otherwise
     */
    isServiceURL(url: string | URL): boolean;
    /**
     * Invoke a method on the controller for the content type referenced. This method will
     * throw an exception if the Extensions are not marked as being avaialble in the
     * configuration.
     *
     * @param   { ContentReference }    content     The content item to invoke the method on
     * @param   { string }              method      The method name
     * @param   { Method }              verb        The verb to use when connecting to Episerver, defaults to GET
     * @param   { TypeIn }              data        The data to post, undefined when there's no data to send
     * @param   { AxiosTransformer }    requestTransformer  The transformer to add the data to the request, defaults to JSON Serialization
     * @returns { Promise<ActionResponse<TypeOut>> }    The response from the service
     */
    invoke<TypeOut extends unknown = any, TypeIn extends unknown = any>(content: ContentReference, method: string, verb?: Method, data?: TypeIn, requestTransformer?: AxiosTransformer): Promise<ActionResponse<TypeOut | NetworkErrorData>>;
    /**
     * Enable raw access to the Episerver installation to perform authenticated calls to the system
     *
     * @param { string | URL }                  url                     The URL to invoke, if provided as string, this will be relative to the configured base URL
     * @param { Partial<AxiosRequestConfig> }   [options]               The request options to override, this is a shallow override, so if you provide headers, these will override all header set by the API
     * @param { boolean }                       [addDefaultQueryParams] Episerver supports a number of query string parameters that allow it to understand which content to load, if set to false, these will not be added
     * @returns { Promise<IContentDeliveryResponse<TypeOut>> }          Both the returned data as well as part of the response headers
     */
    raw<TypeOut>(url: string | URL, options?: Partial<AxiosRequestConfig>, addDefaultQueryParams?: boolean): Promise<IContentDeliveryResponse<TypeOut | NetworkErrorData>>;
};
export default IContentDeliveryAPI;
