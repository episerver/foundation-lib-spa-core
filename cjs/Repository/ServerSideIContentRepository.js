"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideIContentRepository = void 0;
const tslib_1 = require("tslib");
// Import libraries
const eventemitter3_1 = require("eventemitter3");
const StringUtils_1 = require("../Util/StringUtils");
const WebsiteList_1 = require("../Models/WebsiteList");
class ServerSideIContentRepository extends eventemitter3_1.EventEmitter {
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
        if (StringUtils_1.default.TrimRight("/", this._context.Path || '-') === StringUtils_1.default.TrimRight("/", route))
            return Promise.resolve(this._context.IContent);
        if (StringUtils_1.default.TrimRight("/", ((_a = this._context.IContent) === null || _a === void 0 ? void 0 : _a.url) || '-') === StringUtils_1.default.TrimRight("/", route))
            return Promise.resolve(this._context.IContent);
        return Promise.resolve(null);
    }
    getByReference(reference, website) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.getWebsites();
            return list.filter(ws => WebsiteList_1.hostnameFilter(ws, hostname, language, true) && WebsiteList_1.languageFilter(ws, language)).shift() || null;
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const x = yield this.load(itemId);
            return x !== null;
        });
    }
}
exports.ServerSideIContentRepository = ServerSideIContentRepository;
exports.default = ServerSideIContentRepository;
//# sourceMappingURL=ServerSideIContentRepository.js.map