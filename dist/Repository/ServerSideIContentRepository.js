var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Import libraries
import EventEmitter from 'eventemitter3';
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
        var _a;
        if (StringUtils.TrimRight("/", this._context.Path || '-') === StringUtils.TrimRight("/", route))
            return Promise.resolve(this._context.IContent);
        if (StringUtils.TrimRight("/", ((_a = this._context.IContent) === null || _a === void 0 ? void 0 : _a.url) || '-') === StringUtils.TrimRight("/", route))
            return Promise.resolve(this._context.IContent);
        return Promise.resolve(null);
    }
    getByReference(reference, website) {
        return __awaiter(this, void 0, void 0, function* () {
            const w = website || (yield this.getCurrentWebsite());
            if (!w)
                throw new Error('Website not resolved');
            if (!w.contentRoots[reference])
                return null;
            return this.load(w.contentRoots[reference]);
        });
    }
    getWebsites() {
        return Promise.resolve([this._context.Website].filter(x => x));
    }
    getWebsite(hostname, language) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.getWebsites();
            return list.filter(ws => hostnameFilter(ws, hostname, language, true) && languageFilter(ws, language)).shift() || null;
        });
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
    has(itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const x = yield this.load(itemId);
            return x !== null;
        });
    }
}
export default ServerSideIContentRepository;
//# sourceMappingURL=ServerSideIContentRepository.js.map