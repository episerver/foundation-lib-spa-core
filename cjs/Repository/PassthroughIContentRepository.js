"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassthroughIContentRepository = void 0;
const tslib_1 = require("tslib");
// Import libraries
const eventemitter3_1 = require("eventemitter3");
const cloneDeep_1 = require("lodash/cloneDeep");
const PathResponse_1 = require("../ContentDelivery/PathResponse");
class PassthroughIContentRepository extends eventemitter3_1.EventEmitter {
    constructor(api, config) {
        super();
        this._config = {
            debug: false,
            maxAge: 0,
            policy: "LocalStorageFirst" /* LocalStorageFirst */
        };
        this._api = api;
        this._config = Object.assign(Object.assign({}, this._config), config);
    }
    get(reference) {
        return Promise.resolve(null);
    }
    has(reference) {
        return Promise.resolve(false);
    }
    load(itemId, recursive) {
        return this._api.getContent(itemId);
    }
    update(reference, recursive) {
        return this._api.getContent(reference);
    }
    patch(reference, patch) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield this.load(reference);
                if (!item)
                    return null;
                if (((_a = item.contentLink) === null || _a === void 0 ? void 0 : _a.workId) && ((_b = item.contentLink) === null || _b === void 0 ? void 0 : _b.workId) > 0) {
                    if (this._config.debug)
                        console.debug('PassthroughIContentRepository: Skipping patch to content item', reference, item);
                    this.emit('beforePatch', item.contentLink, item);
                    this.emit('afterPatch', item.contentLink, item, item);
                    return item;
                }
                if (this._config.debug)
                    console.debug('PassthroughIContentRepository: Will apply patch to content item', reference, item, patch);
                this.emit('beforePatch', item.contentLink, item);
                const patchedItem = patch(cloneDeep_1.default(item));
                this.emit('afterPatch', patchedItem.contentLink, item, patchedItem);
                if (this._config.debug)
                    console.debug('PassthroughIContentRepository: Applied patch to content item', reference, item, patchedItem);
                return patchedItem;
            }
            catch (e) {
                return null;
            }
        });
    }
    getByContentId(contentId) {
        return this._api.getContent(contentId);
    }
    getByRoute(route) {
        return this._api.resolveRoute(route).then(r => (PathResponse_1.PathResponseIsIContent(r) ? r : r.currentContent));
    }
    getByReference(reference, website) {
        let hostname = '*';
        try {
            hostname = window.location.hostname;
        }
        catch (e) { /* Ignored on purpose */ }
        if (this._config.debug)
            console.debug(`Passthrough IContent Repository: Resolving ${reference} for ${website ? website.name : hostname}`);
        const websitePromise = website ? Promise.resolve(website) : this.getWebsite(hostname);
        return websitePromise.then(w => {
            if (w && w.contentRoots[reference]) {
                if (this._config.debug)
                    console.debug(`Passthrough IContent Repository: Loading ${reference} (${w.contentRoots[reference].guidValue}) for ${website ? website.name : hostname}`);
                return this._api.getContent(w.contentRoots[reference]).then(c => {
                    if (this._config.debug)
                        console.debug(`Passthrough IContent Repository: Laoded ${reference} (${w.contentRoots[reference].guidValue}) for ${website ? website.name : hostname}`);
                    return c;
                });
            }
            return null;
        });
    }
    getWebsites() {
        return this._api.getWebsites();
    }
    getWebsite(hostname, language) {
        return this._api.getWebsite(hostname).then(w => w ? w : null);
    }
    getCurrentWebsite() {
        let hostname = '*';
        try {
            hostname = window.location.hostname;
        }
        catch (e) { /* Ignored on purpose */ }
        return this.getWebsite(hostname, undefined).then(w => w ? w : this.getWebsite(hostname, undefined));
    }
}
exports.PassthroughIContentRepository = PassthroughIContentRepository;
exports.default = PassthroughIContentRepository;
//# sourceMappingURL=PassthroughIContentRepository.js.map