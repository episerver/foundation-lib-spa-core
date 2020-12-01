// Import libraries
import EventEmitter from 'eventemitter3';

// Import framework
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
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
        policy: IRepositoryPolicy.NetworkFirst
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
    public load(itemId: ContentReference, recursive?: boolean): Promise<IContent | null>
    {
        return this._api.getContent(itemId);
    }
    public update(reference: ContentReference, recursive?: boolean): Promise<IContent | null>
    {
        return this._api.getContent(reference);
    }

    public async patch(reference: ContentReference, patch: (item: Readonly<IContent>) => IContent) : Promise<IContent | null>
    {
        try {
            const item = await this.load(reference);
            if (!item) return null;
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
    public getByContentId(contentId: string): Promise<IContent | null>
    {
        return this._api.getContent(contentId);
    }
    public getByRoute(route: string) : Promise<IContent | null>
    {
        return this._api.resolveRoute(route).then(r => PathResponseIsIContent(r) ? r : r.currentContent);
    }
    public getByReference(reference: string, website?: Website) : Promise<IContent | null>
    {
        let hostname = '*';
        try { hostname = window.location.hostname } catch (e) { /* Ignored on purpose */ }
        if (this._config.debug) console.log(`Passthrough IContent Repository: Resolving ${ reference } for ${ website ? website.name : hostname }`);
        const websitePromise = website ? Promise.resolve(website) : this.getWebsite(hostname);
        return websitePromise.then(w => {
            if (w && w.contentRoots[reference]) {
                if (this._config.debug) console.log(`Passthrough IContent Repository: Loading ${ reference } (${ w.contentRoots[reference].guidValue }) for ${ website ? website.name : hostname }`);
                return this._api.getContent(w.contentRoots[reference]).then(c => {
                    if (this._config.debug) console.log(`Passthrough IContent Repository: Laoded ${ reference } (${ w.contentRoots[reference].guidValue }) for ${ website ? website.name : hostname }`);
                    return c;
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
}
export default PassthroughIContentRepository;