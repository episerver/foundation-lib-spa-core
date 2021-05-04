// Import libraries
import EventEmitter from 'eventemitter3';

// Import framework
import IContentDeliveryAPI, { isNetworkError } from '../ContentDelivery/IContentDeliveryAPI';
import { IRepositoryConfig, IRepositoryPolicy } from './IRepository';
import IIContentRepository, { IPatchableRepositoryEvents } from './IIContentRepository';

// Import Taxonomy
import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import WebsiteList from '../Models/WebsiteList';
import { PathResponseIsIContent } from '../ContentDeliveryAPI';

export class PassthroughIContentRepository extends EventEmitter<IPatchableRepositoryEvents<ContentReference, IContent>, IIContentRepository> implements IIContentRepository
{
    protected _api : IContentDeliveryAPI;
    protected _config : IRepositoryConfig = {
        debug: false,
        maxAge: 0,
        policy: IRepositoryPolicy.LocalStorageFirst
    };
    
    public constructor (api: IContentDeliveryAPI, config?: Partial<IRepositoryConfig>)
    {
        super();
        this._api = api;
        this._config = { ...this._config, ...config }
    }

    public get(reference: ContentReference): Promise<IContent | null>
    {
        return Promise.resolve(null);
    }
    public has(reference: ContentReference): Promise<boolean>
    {
        return Promise.resolve(false);
    }
    public load<IContentType extends IContent = IContent>(itemId: ContentReference, recursive?: boolean): Promise<IContentType | null>
    {
        return this._api.getContent<IContentType>(itemId) as Promise<IContentType | null>
    }
    public update<IContentType extends IContent = IContent>(reference: ContentReference, recursive?: boolean): Promise<IContentType | null>
    {
        return this._api.getContent<IContentType>(reference) as Promise<IContentType | null>
    }

    public async patch(reference: ContentReference, patch: (item: Readonly<IContent>) => IContent) : Promise<IContent | null>
    {
        try {
            const item = await this.load(reference);
            if (!item) return null;
            if (item.contentLink?.workId && item.contentLink?.workId > 0) {
                if (this._config.debug) console.log('PassthroughIContentRepository: Skipping patch to content item', reference, item);
                this.emit('beforePatch', item.contentLink, item);
                this.emit('afterPatch', item.contentLink, item, item);
                return item;
            }
            if (this._config.debug) console.log('PassthroughIContentRepository: Will apply patch to content item', reference, item, patch);
            this.emit('beforePatch', item.contentLink, item);
            const patchedItem = patch(item);
            this.emit('afterPatch', patchedItem.contentLink, item, patchedItem)
            if (this._config.debug) console.log('PassthroughIContentRepository: Applied patch to content item', reference, item, patchedItem);
            return patchedItem;
        } catch (e) {
            return null;
        }
    }
    public getByContentId<IContentType extends IContent = IContent>(contentId: string): Promise<IContentType | null>
    {
        return this._api.getContent<IContentType>(contentId) as Promise<IContentType | null>
    }
    public getByRoute<IContentType extends IContent = IContent>(route: string) : Promise<IContentType | null>
    {
        return this._api.resolveRoute<any, IContentType>(route).then(r => (PathResponseIsIContent(r) ? r : r.currentContent) as IContentType);
    }
    public getByReference<IContentType extends IContent = IContent>(reference: string, website?: Website) : Promise<IContentType | null>
    {
        let hostname = '*';
        try { hostname = window.location.hostname } catch (e) { /* Ignored on purpose */ }
        if (this._config.debug) console.log(`Passthrough IContent Repository: Resolving ${ reference } for ${ website ? website.name : hostname }`);
        const websitePromise = website ? Promise.resolve(website) : this.getWebsite(hostname);
        return websitePromise.then(w => {
            if (w && w.contentRoots[reference]) {
                if (this._config.debug) console.log(`Passthrough IContent Repository: Loading ${ reference } (${ w.contentRoots[reference].guidValue }) for ${ website ? website.name : hostname }`);
                return this._api.getContent<IContentType>(w.contentRoots[reference]).then(c => {
                    if (this._config.debug) console.log(`Passthrough IContent Repository: Laoded ${ reference } (${ w.contentRoots[reference].guidValue }) for ${ website ? website.name : hostname }`);
                    return c as IContentType | null;
                });
            }
            return null;
        });
    }
    public getWebsites() : Promise<WebsiteList>
    {
        return this._api.getWebsites();
    }
    public getWebsite(hostname: string, language ?: string) : Promise<Website | null>
    {
        return this._api.getWebsite(hostname).then(w => w ? w : null);
    }
    public getCurrentWebsite() : Promise<Readonly<Website> | null>
    {
        let hostname = '*';
        try {
            hostname = window.location.hostname;
        } catch (e) { /* Ignored on purpose */ }
        return this.getWebsite(hostname, undefined).then(w => w ? w : this.getWebsite(hostname, undefined));
    }
}
export default PassthroughIContentRepository;