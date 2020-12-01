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
    load(itemId: ContentReference, recursive?: boolean): Promise<IContent | null>;
    update(reference: ContentReference, recursive?: boolean): Promise<IContent | null>;
    patch(reference: ContentReference, patch: (item: Readonly<IContent>) => IContent): Promise<IContent | null>;
    getByContentId(contentId: string): Promise<IContent | null>;
    getByRoute(route: string): Promise<IContent | null>;
    getByReference(reference: string, website?: Website): Promise<IContent | null>;
    getWebsites(): Promise<WebsiteList>;
    getWebsite(hostname: string, language?: string): Promise<Website | null>;
}
export default PassthroughIContentRepository;
