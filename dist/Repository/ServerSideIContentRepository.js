// Import libraries
import { EventEmitter } from 'eventemitter3';
import StringUtils from '../Util/StringUtils';
import { languageFilter, hostnameFilter } from '../Models/WebsiteList';
export class ServerSideIContentRepository extends EventEmitter {
    constructor(api, config, serverContext) {
        super();
        this._api = api;
        this._config = config;
        this._context = serverContext;
    }
    load(itemId) {
        return Promise.resolve(this._context.getIContent(itemId) || null);
    }
    update(reference) {
        return this.load(reference);
    }
    getByContentId(contentId) {
        return this.load(contentId);
    }
    getByRoute(route) {
        if (StringUtils.TrimRight("/", this._context.Path || '-') === StringUtils.TrimRight("/", route))
            return Promise.resolve(this._context.IContent);
        if (StringUtils.TrimRight("/", this._context.IContent?.url || '-') === StringUtils.TrimRight("/", route))
            return Promise.resolve(this._context.IContent);
        return Promise.resolve(null);
    }
    async getByReference(reference, website) {
        const w = website || await this.getCurrentWebsite();
        if (!w)
            throw new Error('Website not resolved');
        if (!w.contentRoots[reference])
            return null;
        return this.load(w.contentRoots[reference]);
    }
    getWebsites() {
        return Promise.resolve([this._context.Website].filter(x => x));
    }
    async getWebsite(hostname, language) {
        const list = await this.getWebsites();
        return list.filter(ws => hostnameFilter(ws, hostname, language, true) && languageFilter(ws, language)).shift() || null;
    }
    getCurrentWebsite() {
        return Promise.resolve(this._context.Website);
    }
    patch() {
        return Promise.reject("ServerSideIContentRepository.patch is not supported");
    }
    get(itemId) {
        return this.load(itemId);
    }
    async has(itemId) {
        const x = await this.load(itemId);
        return x !== null;
    }
}
export default ServerSideIContentRepository;
//# sourceMappingURL=ServerSideIContentRepository.js.map