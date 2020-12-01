import getGlobal from '../AppGlobal';
import { ContentLinkService } from '../Models/ContentLink';
import { isSerializedIContent, isSerializedWebsite } from './ServerContext';
/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering.
 */
export class ServerContextAccessor {
    constructor() {
        const ctx = getGlobal();
        this._context = ctx.__INITIAL_DATA__;
    }
    get IsAvailable() {
        return this.hasContext();
    }
    get IContent() {
        if (!this._context)
            return null;
        if (isSerializedIContent(this._context.IContent)) {
            return JSON.parse(this._context.IContent);
        }
        return this._context.IContent;
    }
    get Website() {
        if (!this._context)
            return null;
        if (isSerializedWebsite(this._context.Website)) {
            return JSON.parse(this._context.Website);
        }
        return this._context.Website;
    }
    get StartPage() {
        if (!this._context)
            return null;
        if (isSerializedIContent(this._context.StartPageData)) {
            return JSON.parse(this._context.StartPageData);
        }
        return this._context.StartPageData;
    }
    get Path() {
        if (!this._context)
            return null;
        return this._context.Path;
    }
    hasContext() {
        return this._context ? true : false;
    }
    getIContent(ref) {
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
