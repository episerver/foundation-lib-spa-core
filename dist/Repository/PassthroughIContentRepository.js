// Import libraries
import { EventEmitter } from 'eventemitter3';
import cloneDeep from 'lodash/cloneDeep';
import { PathResponseIsIContent } from '../ContentDeliveryAPI';
export class PassthroughIContentRepository extends EventEmitter {
    constructor(api, config) {
        super();
        this._config = {
            debug: false,
            maxAge: 0,
            policy: "LocalStorageFirst" /* LocalStorageFirst */
        };
        this._api = api;
        this._config = { ...this._config, ...config };
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
    async patch(reference, patch) {
        try {
            const item = await this.load(reference);
            if (!item)
                return null;
            if (item.contentLink?.workId && item.contentLink?.workId > 0) {
                if (this._config.debug)
                    console.debug('PassthroughIContentRepository: Skipping patch to content item', reference, item);
                this.emit('beforePatch', item.contentLink, item);
                this.emit('afterPatch', item.contentLink, item, item);
                return item;
            }
            if (this._config.debug)
                console.debug('PassthroughIContentRepository: Will apply patch to content item', reference, item, patch);
            this.emit('beforePatch', item.contentLink, item);
            const patchedItem = patch(cloneDeep(item));
            this.emit('afterPatch', patchedItem.contentLink, item, patchedItem);
            if (this._config.debug)
                console.debug('PassthroughIContentRepository: Applied patch to content item', reference, item, patchedItem);
            return patchedItem;
        }
        catch (e) {
            return null;
        }
    }
    getByContentId(contentId) {
        return this._api.getContent(contentId);
    }
    getByRoute(route) {
        return this._api.resolveRoute(route).then(r => (PathResponseIsIContent(r) ? r : r.currentContent));
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
export default PassthroughIContentRepository;
//# sourceMappingURL=PassthroughIContentRepository.js.map