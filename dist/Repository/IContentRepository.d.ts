import EventEmitter from 'eventemitter3';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IRepositoryConfig } from './IRepository';
import { IIContentRepository, WebsiteRepositoryItem, IPatchableRepositoryEvents, IContentRepositoryItem } from './IIContentRepository';
import { NetworkErrorData } from '../ContentDeliveryAPI';
import IndexedDB from '../IndexedDB/IndexedDB';
import SchemaUpgrade from '../IndexedDB/SchemaUpgrade';
import Store from '../IndexedDB/Store';
import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
import ServerContextAccessor from '../ServerSideRendering/ServerContextAccessor';
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
    constructor(api: IContentDeliveryAPI, config?: Partial<IRepositoryConfig>, serverContext?: ServerContextAccessor);
    /**
     * Load the IContent, first try IndexedDB, if not found in the IndexedDB load it from the
     * ContentDelivery API
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    load<IContentType extends IContent = IContent>(reference: ContentReference, recursive?: boolean): Promise<IContentType | null>;
    protected createStorageId(reference: ContentReference, preferGuid?: boolean, editModeId?: boolean): string;
    /**
     * Force reloading of the content and return the fresh content
     *
     * @param { ContentReference } reference The reference to the content, e.g. something that can be resolved by the ContentDelivery API
     * @param { boolean } recursive Whether or all referenced content must be loaded as well
     * @returns { Promise<IContent | null> }
     */
    update<IContentType extends IContent = IContent>(reference: ContentReference, recursive?: boolean): Promise<IContentType | null>;
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
    get<IContentType extends IContent = IContent>(reference: ContentReference): Promise<IContentType | null>;
    getByContentId<IContentType extends IContent = IContent>(contentId: string): Promise<IContentType | null>;
    /**
     * Resolve an IContent | null from a route via the index
     *
     * @param { string } route The route to resolve to an iContent item trough the index
     * @returns { Promise<Store<IContentRepositoryItem>> }
     */
    getByRoute<IContentType extends IContent = IContent>(route: string): Promise<IContentType | null>;
    getByReference<IContentType extends IContent = IContent>(reference: string, website?: Website): Promise<IContentType | null>;
    patch(reference: ContentReference, patch: (item: Readonly<IContent>) => IContent): Promise<IContent | null>;
    getWebsites(): Promise<WebsiteList>;
    getWebsite(hostname: string, language?: string, matchWildCard?: boolean): Promise<Readonly<Website> | null>;
    getCurrentWebsite(): Promise<Readonly<Website> | null>;
    protected ingestIContent(iContent: IContent, overwrite?: boolean): Promise<IContent | null>;
    protected ingestWebsite(website: Website): Promise<Website | null>;
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
