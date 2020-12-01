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
import { IRepositoryPolicy } from './IRepository';
import { PathResponseIsIContent } from '../ContentDeliveryAPI';
export class PassthroughIContentRepository extends EventEmitter {
    constructor(api, config) {
        super();
        this._config = {
            debug: false,
            maxAge: 0,
            policy: IRepositoryPolicy.NetworkFirst
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
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield this.load(reference);
                if (!item)
                    return null;
                if (this._config.debug)
                    console.log('PassthroughIContentRepository: Will apply patch to content item', reference, item, patch);
                this.emit('beforePatch', item.contentLink, item);
                const patchedItem = patch(item);
                this.emit('afterPatch', patchedItem.contentLink, item, patchedItem);
                if (this._config.debug)
                    console.log('PassthroughIContentRepository: Applied patch to content item', reference, item, patchedItem);
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
        return this._api.resolveRoute(route).then(r => PathResponseIsIContent(r) ? r : r.currentContent);
    }
    getByReference(reference, website) {
        let hostname = '*';
        try {
            hostname = window.location.hostname;
        }
        catch (e) { /* Ignored on purpose */ }
        if (this._config.debug)
            console.log(`Passthrough IContent Repository: Resolving ${reference} for ${website ? website.name : hostname}`);
        const websitePromise = website ? Promise.resolve(website) : this.getWebsite(hostname);
        return websitePromise.then(w => {
            if (w && w.contentRoots[reference]) {
                if (this._config.debug)
                    console.log(`Passthrough IContent Repository: Loading ${reference} (${w.contentRoots[reference].guidValue}) for ${website ? website.name : hostname}`);
                return this._api.getContent(w.contentRoots[reference]).then(c => {
                    if (this._config.debug)
                        console.log(`Passthrough IContent Repository: Laoded ${reference} (${w.contentRoots[reference].guidValue}) for ${website ? website.name : hostname}`);
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
}
export default PassthroughIContentRepository;
