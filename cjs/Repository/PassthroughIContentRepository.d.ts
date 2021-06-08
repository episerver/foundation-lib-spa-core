import EventEmitter from 'eventemitter3';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IRepositoryConfig } from './IRepository';
import IIContentRepository, { IPatchableRepositoryEvents } from './IIContentRepository';
import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
export declare class PassthroughIContentRepository extends EventEmitter<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> implements IIContentRepository {
    protected _api: IContentDeliveryAPI;
    protected _config: IRepositoryConfig;
    constructor(api: IContentDeliveryAPI, config?: Partial<IRepositoryConfig>);
    get(reference: ContentReference): Promise<IContent | null>;
    has(reference: ContentReference): Promise<boolean>;
    load<IContentType extends IContent = IContent>(itemId: ContentReference, recursive?: boolean): Promise<IContentType | null>;
    update<IContentType extends IContent = IContent>(reference: ContentReference, recursive?: boolean): Promise<IContentType | null>;
    patch(reference: ContentReference, patch: (item: Readonly<IContent>) => IContent): Promise<IContent | null>;
    getByContentId<IContentType extends IContent = IContent>(contentId: string): Promise<IContentType | null>;
    getByRoute<IContentType extends IContent = IContent>(route: string): Promise<IContentType | null>;
    getByReference<IContentType extends IContent = IContent>(reference: string, website?: Website): Promise<IContentType | null>;
    getWebsites(): Promise<WebsiteList>;
    getWebsite(hostname: string, language?: string): Promise<Website | null>;
    getCurrentWebsite(): Promise<Readonly<Website> | null>;
}
export default PassthroughIContentRepository;
