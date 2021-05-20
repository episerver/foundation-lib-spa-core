import EventEmitter from 'eventemitter3';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IRepositoryItem, IPatchableRepository, IRepositoryConfig } from './IRepository';
import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
/**
 * The data structure stored within the iContent repository
 */
export declare type IContentRepositoryItem<T extends IContent = IContent> = IRepositoryItem<T> & {
    apiId: string;
    guid: string;
    contentId: string;
    type: string;
    route: string | null;
};
export interface IReadonlyRepositoryEvents<KeyType extends unknown = any, DataType extends unknown = any> {
    'beforeGet': [item: Readonly<KeyType>];
    'afterGet': [item: Readonly<KeyType>, value: DataType | null];
    'beforeAdd': [item: Readonly<DataType>];
    'afterAdd': [item: Readonly<DataType> | null];
    'beforeUpdate': [newValue: DataType, oldValue: Readonly<DataType>];
    'afterUpdate': [item: Readonly<DataType> | null];
}
export interface IPatchableRepositoryEvents<KeyType extends unknown = any, DataType extends unknown = any> extends IReadonlyRepositoryEvents<KeyType, DataType> {
    'beforePatch': [item: Readonly<KeyType>, value: DataType];
    'afterPatch': [item: Readonly<KeyType>, oldValue: Readonly<DataType>, newValue: DataType];
}
export interface IEventingRepository<EventTypes extends EventEmitter.ValidEventTypes = string | symbol, Context extends unknown = any> {
    /**
     * Return the listeners registered for a given event.
     */
    listeners<T extends EventEmitter.EventNames<EventTypes>>(event: T): EventEmitter.EventListener<EventTypes, T>[];
    /**
     * Return the number of listeners listening to a given event.
     */
    listenerCount(event: EventEmitter.EventNames<EventTypes>): number;
    /**
     * Add the listener to a given event
     */
    on<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn: EventEmitter.EventListener<EventTypes, T>, context?: Context): this;
    addListener<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn: EventEmitter.EventListener<EventTypes, T>, context?: Context): this;
    /**
     * Remove the listeners of a given event.
     */
    removeListener<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn?: EventEmitter.EventListener<EventTypes, T>, context?: Context, once?: boolean): this;
    off<T extends EventEmitter.EventNames<EventTypes>>(event: T, fn?: EventEmitter.EventListener<EventTypes, T>, context?: Context, once?: boolean): this;
}
export declare type WebsiteRepositoryItem<T extends Website = Website> = IRepositoryItem<T> & {
    hosts: string;
};
export interface IIContentRepository extends IPatchableRepository<ContentReference, IContent>, IEventingRepository<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> {
    /**
     * Get the IContent from the client repository, if it's not present there, go to the Episerver Instance
     * to load the data
     *
     * @param   { ContentReference }    itemId      The reference to the content that must be loaded
     * @param   { boolean }             recursive   Marker to indicate if the content must be laoded recursively (e.g. resolve all related content items)
     * @returns The loaded data or null if not found or accessible
     */
    load: <IContentType extends IContent = IContent>(itemId: ContentReference, recursive?: boolean) => Promise<IContentType | null>;
    /**
     * Force loading the IContent from Episerver and update the reference in the local repository
     */
    update: <IContentType extends IContent = IContent>(reference: ContentReference, recursive?: boolean) => Promise<IContentType | null>;
    /**
     * Retrieve content by the Episerver ContentId, using the index on the local repository
     *
     * @param { string } contentId  The Episerver ContentID (using format: {number}__{provider})
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByContentId: <IContentType extends IContent = IContent>(contentId: string) => Promise<IContentType | null>;
    /**
     * Retrieve content by the Episerver route (URL), using the index on the local repository
     *
     * @param { string } route
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByRoute: <IContentType extends IContent = IContent>(route: string) => Promise<IContentType | null>;
    /**
     * Load content by the reference name from the website
     *
     * @param { string } reference The name of the page, as registered on the Website
     * @param { Website } website The website to get the registrations from, if omitted it takes the current website from the ContentDelivery API
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByReference: <IContentType extends IContent = IContent>(reference: string, website?: Website) => Promise<IContentType | null>;
    /**
     * Retrieve a list of all websites stored within Episerver
     */
    getWebsites: () => Promise<WebsiteList>;
    /**
     * Retrieve a single website, as stored within Episerver
     *
     * @param   { string }  hostname    The hostname to match when retrieving the website
     * @param   { string }  language    The language to match when retrieving the website
     * @returns The matching website or null if none found or error
     */
    getWebsite: (hostname: string, language?: string) => Promise<Website | null>;
    getCurrentWebsite: () => Promise<Readonly<Website> | null>;
}
export declare type IIContentRepositoryType = new (api: IContentDeliveryAPI, config?: Partial<IRepositoryConfig>) => IIContentRepository;
export default IIContentRepository;
