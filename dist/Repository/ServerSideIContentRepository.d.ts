import { EventEmitter } from 'eventemitter3';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IRepositoryConfig } from './IRepository';
import IIContentRepository, { IPatchableRepositoryEvents } from './IIContentRepository';
import IServerContextAccessor from '../ServerSideRendering/IServerContextAccessor';
import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
export declare class ServerSideIContentRepository extends EventEmitter<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> implements IIContentRepository {
    private _api;
    private _config;
    private _context;
    constructor(api: IContentDeliveryAPI, config: Partial<IRepositoryConfig>, serverContext: IServerContextAccessor);
    load<IContentType extends IContent = IContent>(itemId: ContentReference): Promise<IContentType | null>;
    update<IContentType extends IContent = IContent>(reference: ContentReference): Promise<IContentType | null>;
    getByContentId<IContentType extends IContent = IContent>(contentId: string): Promise<IContentType | null>;
    getByRoute<IContentType extends IContent = IContent>(route: string): Promise<IContentType | null>;
    getByReference<IContentType extends IContent = IContent>(reference: string, website?: Website | undefined): Promise<IContentType | null>;
    getWebsites(): Promise<WebsiteList>;
    getWebsite(hostname: string, language?: string | undefined): Promise<Website | null>;
    getCurrentWebsite(): Promise<Readonly<Website> | null>;
    patch(): Promise<IContent | null>;
    get(itemId: ContentReference): Promise<IContent | null>;
    has(itemId: ContentReference): Promise<boolean>;
}
export default ServerSideIContentRepository;
