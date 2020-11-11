import EventEmitter from 'eventemitter3';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IRepositoryItem, IPatchableRepository, IRepositoryConfig } from './IRepository';
import { NetworkErrorData } from '../ContentDeliveryAPI';
import IndexedDB from '../IndexedDB/IndexedDB';
import SchemaUpgrade from '../IndexedDB/SchemaUpgrade';
import Store from '../IndexedDB/Store';
import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
/**
 * The data structure stored within the iContent repository
 */
export declare type IContentRepositoryItem<T extends IContent = IContent> = IRepositoryItem<T> & {
    apiId: string;
    contentId: string;
    type: string;
    route: string | null;
};
export interface IReadonlyRepositoryEvents<KeyType extends unknown = any, DataType extends unknown = any> {
    'beforeGet': [item: Readonly<KeyType>];
    'afterGet': [item: Readonly<KeyType>, value: DataType | null];
}
export interface IPatchableRepositoryEvents<KeyType extends unknown = any, DataType extends unknown = any> extends IReadonlyRepositoryEvents<KeyType, DataType> {
    'beforePatch': [item: Readonly<KeyType>, value: DataType];
    'afterPatch': [item: Readonly<KeyType>, newValue: DataType, oldValue: Readonly<DataType>];
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
export declare type WebsiteRepositoryItem<T extends Website = Website> = IRepositoryItem<T>;
export interface IIContentRepository extends IPatchableRepository<ContentReference, IContent>, IEventingRepository<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> {
    /**
     * Get the IContent from the client repository, if it's not present there, go to the Episerver Instance
     * to load the data
     *
     * @param   { ContentReference }    itemId      The reference to the content that must be loaded
     * @param   { boolean }             recursive   Marker to indicate if the content must be laoded recursively (e.g. resolve all related content items)
     * @returns The loaded data or null if not found or accessible
     */
    load: (itemId: ContentReference, recursive?: boolean) => Promise<IContent | null>;
    /**
     * Force loading the IContent from Episerver and update the reference in the local repository
     */
    update: (reference: ContentReference, recursive?: boolean) => Promise<IContent | null>;
    /**
     * Retrieve content by the Episerver ContentId, using the index on the local repository
     *
     * @param { string } contentId  The Episerver ContentID (using format: {number}__{provider})
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByContentId: (contentId: string) => Promise<IContent | null>;
    /**
     * Retrieve content by the Episerver route (URL), using the index on the local repository
     *
     * @param { string } route
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByRoute(route: string): Promise<IContent | null>;
    /**
     * Load content by the reference name from the website
     *
     * @param { string } reference The name of the page, as registered on the Website
     * @param { Website } website The website to get the registrations from, if omitted it takes the current website from the ContentDelivery API
     * @returns { Promise<IContent | null> } The content from the index or null otherwise
     */
    getByReference(reference: string, website?: Website): Promise<IContent | null>;
    /**
     * Retrieve a list of all websites stored within Episerver
     */
    getWebsites(): Promise<WebsiteList>;
    /**
     * Retrieve a single website, as stored within Episerver
     *
     * @param   { string }  hostname    The hostname to match when retrieving the website
     * @param   { string }  language    The language to match when retrieving the website
     * @returns The matching website or null if none found or error
     */
    getWebsite(hostname: string, language?: string): Promise<Website | null>;
}
export declare type IIContentRepositoryType = new (api: IContentDeliveryAPI, config?: Partial<IRepositoryConfig>) => IIContentRepository;
/**
 * A wrapper for IndexedDB offering an Asynchronous API to load/fetch content items from the database
 * and underlying Episerver ContentDelivery API.
 */
export declare class IContentRepository extends EventEmitter<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> implements IIContentRepository {
    protected _api: IContentDeliveryAPI;
    protected _storage: IndexedDB;
    protected _loading: {
        [key: string]: Promise<IContent | NetworkErrorData<any> | null>;
    };
    protected _config: IRepositoryConfig;
    /**
     * Create a new instance
     *
     * @param { IContentDeliveryAPI } api The ContentDelivery API wrapper to use within this IContent Repository
     */
    constructor(api: IContentDeliveryAPI, config?: Partial<IRepositoryConfig>);
    /**
     * Load the IContent, first try IndexedDB, if not found in the IndexedDB load it from the
     * ContentDelivery API
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    load(reference: ContentReference, recursive?: boolean): Promise<IContent | null>;
    /**
     * Force reloading of the content and return the fresh content
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    update(reference: ContentReference, recursive?: boolean): Promise<IContent | null>;
    /**
     * Validate if the current item is still valid or must be refreshed from the server
     *
     * @param   { IContentRepositoryItem }  item    The item to be tested
     * @returns The validity of the stored item
     */
    protected isValid(item: IContentRepositoryItem): boolean;
    protected updateInBackground(item: IContentRepositoryItem): void;
    /**
     * Return whether or not the referenced iContent is available in the IndexedDB
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @returns { Promise<boolean> }
     */
    has(reference: ContentReference): Promise<boolean>;
    /**
     * Retrieve the iContent item from the IndexedDB, or null if the item is
     * not found in the IndexedDB
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @returns { Promise<IContent | null> }
     */
    get(reference: ContentReference): Promise<IContent | null>;
    getByContentId(contentId: string): Promise<IContent | null>;
    /**
     * Resolve an IContent | null from a route via the index
     *
     * @param { string } route The route to resolve to an iContent item trough the index
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    getByRoute(route: string): Promise<IContent | null>;
    getByReference(reference: string, website?: Website): Promise<IContent | null>;
    patch(reference: ContentReference, patch: (item: Readonly<IContent>) => IContent): Promise<IContent | null>;
    getWebsites(): Promise<WebsiteList>;
    getWebsite(hostname: string, language?: string): Promise<Website | null>;
    /**
     * Get the underlying table in IndexedDB
     *
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    protected getTable(): Promise<Store<IContentRepositoryItem>>;
    protected getWebsiteTable(): Promise<Store<WebsiteRepositoryItem>>;
    protected buildWebsiteRepositoryItem(website: Website): WebsiteRepositoryItem;
    protected buildRepositoryItem(iContent: IContent): IContentRepositoryItem;
    protected recursiveLoad(iContent: IContent, recurseDown?: boolean): Promise<void>;
    protected schemaUpgrade: SchemaUpgrade;
}
export default IContentRepository;
