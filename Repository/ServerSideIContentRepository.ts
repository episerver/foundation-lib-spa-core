// Import libraries
import EventEmitter from 'eventemitter3';

// Import framework
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import { IRepositoryConfig } from './IRepository';
import IIContentRepository, { IPatchableRepositoryEvents } from './IIContentRepository';
import IServerContextAccessor from '../ServerSideRendering/IServerContextAccessor';
import StringUtils from '../Util/StringUtils';

// Import Taxonomy
import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList, { languageFilter, hostnameFilter } from '../Models/WebsiteList';

export class ServerSideIContentRepository extends EventEmitter<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> implements IIContentRepository
{
    private _api : IContentDeliveryAPI;
    private _config : Readonly<Partial<IRepositoryConfig>>
    private _context : IServerContextAccessor

    public constructor(api: IContentDeliveryAPI, config: Partial<IRepositoryConfig>, serverContext: IServerContextAccessor)
    {
        super();
        this._api = api;
        this._config = config;
        this._context = serverContext;
    }
    
    public load <IContentType extends IContent = IContent>(itemId: ContentReference) : Promise<IContentType | null> 
    {
        return Promise.resolve(this._context.getIContent<IContentType>(itemId) || null);
    }

    public update <IContentType extends IContent = IContent>(reference: ContentReference) : Promise<IContentType | null> 
    {
        return this.load(reference);
    }

    public getByContentId <IContentType extends IContent = IContent>(contentId: string) : Promise<IContentType | null> 
    {
        return this.load(contentId);
    }
    
    public getByRoute<IContentType extends IContent = IContent>(route: string) : Promise<IContentType | null>
    {
        if (StringUtils.TrimRight("/", this._context.Path || '-') === StringUtils.TrimRight("/", route)) return Promise.resolve(this._context.IContent as IContentType | null);
        if (StringUtils.TrimRight("/", this._context.IContent?.url || '-') === StringUtils.TrimRight("/", route)) return Promise.resolve(this._context.IContent as IContentType | null);
        return Promise.resolve(null);
    }

    public async getByReference<IContentType extends IContent = IContent>(reference: string, website?: Website | undefined) : Promise<IContentType | null>
    {
        const w = website || await this.getCurrentWebsite();
        if (!w) throw new Error('Website not resolved');
        if (!w.contentRoots[reference]) return null;
        return this.load(w.contentRoots[reference]);
    }

    public getWebsites() : Promise<WebsiteList>
    {
        return Promise.resolve([ this._context.Website ].filter(x => x) as WebsiteList);
    }

    public async getWebsite(hostname: string, language?: string | undefined) : Promise<Website | null>
    {
        const list = await this.getWebsites();
        return list.filter(ws => hostnameFilter(ws, hostname, language, true) && languageFilter(ws, language)).shift() || null;
    }

    public getCurrentWebsite() : Promise<Readonly<Website> | null>
    {
        return Promise.resolve(this._context.Website)
    }

    public patch () : Promise<IContent | null>
    {
        return Promise.reject("ServerSideIContentRepository.patch is not supported");
    }

    public get (itemId: ContentReference) : Promise<IContent | null> 
    {
        return this.load(itemId);
    }

    public async has (itemId: ContentReference) : Promise<boolean>
    {
        const x = await this.load(itemId);
        return x !== null;
    }
}

export default ServerSideIContentRepository;