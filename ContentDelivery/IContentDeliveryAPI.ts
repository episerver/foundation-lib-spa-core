// import { ContentDelivery, Taxonomy } from '@episerver/spa-core';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
import IContent from '../Models/IContent';
import { ContentReference } from '../Models/ContentLink';
import { PathResponse, NetworkErrorData } from '../ContentDeliveryAPI';


/**
 * Service definition for the Episerver Content Delivery API. This is a
 * straight wrapper for the ContentDeliveryAPI and does not implement any
 * form of Client Side caching, that should be added at a higher level.
 */
export default interface IContentDeliveryAPI {
    /**
     * Flag to get/set whether or not the requests to the ContentDeliveryAPI
     * should be done with the Edit Mode flag present.
     */
    InEditMode: boolean

    /**
     * The language to use when connecting to the ContentDeliveryAPI. This
     * should normally dictate which language branch will be used by Episerver
     * when loading the content.
     */
    Language: string

    /**
     * The BaseURL for requests to the Episerver ContentDeliveryAPI, this is
     * where Episerver is installed.
     */
    readonly BaseURL: string

    /**
     * If set, this is the website used for resolving routes. This requires the
     * site to have the extensions to be installed and enabled in the configuration
     * of the ContentDelivery API.
     */
    CurrentWebsite?: Website;

    /**
     * Authenticate a user using the Username and Password provided
     * 
     * @param {string}  username    The username provided
     * @param {string}  password    The password provided
     * @returns {boolean} A boolean result,
     */
    login(username: string, password: string) : Promise<boolean>

    /**
     * Retrieve the list of all websites registered within Episerver CMS
     */
    getWebsites() : Promise<WebsiteList>

    /**
     * Get the website for the specified host
     * 
     * @param { string | URL } hostname The hostname to get the website for
     * @returns { Promise<Website | undefined> }
     */
    getWebsite(hostname ?: string | URL) : Promise<Website | undefined>

    /**
     * Execute a routing request to resolve a path to IContent item
     * 
     * @param { string } path The path to resolve to an IContent item
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent | undefined> } The referenced IContent item, or undefined if not found
     */
    resolveRoute<T = any, C extends IContent = IContent>(path : string, select ?: string[], expand ?: string[]) : Promise<PathResponse<T, C | NetworkErrorData>>

    /**
     * Retrieve a single piece of content from Episerver
     * 
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent | undefined> } The referenced IContent item, or undefined if not found
     */
    getContent<C extends IContent = IContent>(id : ContentReference, select ?: string[], expand ?: string[]) : Promise<C | NetworkErrorData>

    /**
     * Retrieve a list content-items from Episerver in one round-trip
     * 
     * @param { ContentReference[] } ids The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent[]> } The referenced IContent items
     */
    getContents<C extends IContent = IContent>(ids : ContentReference[], select ?: string[], expand ?: string[]) : Promise<C[] | NetworkErrorData[]>;

    /**
     * Retrieve the parents in the Episerver content tree for the referenced
     * content item
     * 
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent[] | undefined> } The parents of the referenced IContent item, or undefined if not found
     */
    getAncestors(id : ContentReference, select ?: string[], expand ?: string[]) : Promise<IContent[]>

    /**
     * Retrieve the children in the Episerver content tree for the referenced
     * content item
     * 
     * @param { ContentReference } id The content to fetch from Episerver
     * @param { string[] } select The fields that are needed in the response, defaults to all if not provided
     * @param { string[] } expand The list of fields that need to be expanded, defaults to none if not provided, set to ['*'] for all
     * @returns { Promise<IContent[]|undefined> } The children of the referenced IContent item, or undefined if not found
     */
    getChildren(id : ContentReference, select ?: string[], expand ?: string[]) : Promise<IContent[]>

    /**
     * Verify if the provided URL is one the ContentDeliveryAPI services, it
     * thus does not checks if the URL is routeable by Episerver.
     * 
     * @param { string | URL } url The URL to test
     * @returns { boolean } True when the URL is a ContentDeliveryAPI service, False otherwise
     */
    isServiceURL(url: string | URL) : boolean
}