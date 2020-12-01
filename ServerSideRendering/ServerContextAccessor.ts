import getGlobal from '../AppGlobal';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import ServerContext, { isSerializedIContent, isSerializedWebsite } from './ServerContext';

export type IServerContextAccessor = new() => ServerContextAccessor;

/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering.
 */
export class ServerContextAccessor
{
    private _context ?: ServerContext;

    constructor() 
    {
        const ctx = getGlobal();
        this._context = ctx.__INITIAL__DATA__;
    }

    public get IsAvailable() : boolean
    {
        return this.hasContext();
    }

    public get IContent() : IContent | null
    {
        if (!this._context) return null;
        if (isSerializedIContent(this._context.IContent)) {
            return JSON.parse(this._context.IContent);
        }
        return this._context.IContent;
    }

    public get Website() : Website | null
    {
        if (!this._context) return null;
        if (isSerializedWebsite(this._context.Website)) {
            return JSON.parse(this._context.Website);
        }
        return this._context.Website;
    }

    public get StartPage() : IContent | null
    {
        if (!this._context) return null;
        if (isSerializedIContent(this._context.StartPageData)) {
            return JSON.parse(this._context.StartPageData);
        }
        return this._context.StartPageData;
    }

    public get Path() : string | null
    {
        if (!this._context) return null;
        return this._context.Path;
    }

    public hasContext() : boolean
    {
        return this._context ? true : false;
    }

    public getIContent(ref : ContentReference) : IContent | null 
    {
        const refId = ContentLinkService.createApiId(ref || 'args.ref');
        if (ContentLinkService.createApiId(this.IContent || 'this.icontent') === refId) {
            return this.IContent;
        }
        if (ContentLinkService.createApiId(this.StartPage || 'this.startpage') === refId) {
            return this.StartPage;
        }
        return null;
    }
}
export default ServerContextAccessor;