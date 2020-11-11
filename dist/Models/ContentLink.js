"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentLinkService = void 0;
const Spa_1 = __importDefault(require("../Spa"));
class ContentLinkService {
    constructor() {
        // Just here to prevent instances
    }
    static referenceIsIContent(ref) {
        return (ref && ref.contentType && ref.name) ? true : false;
    }
    static referenceIsContentLink(ref) {
        return ref && ((ref.guidValue && typeof ref.guidValue === 'string') ||
            (ref.id && typeof ref.id === 'number')) ? true : false;
    }
    static referenceIsString(ref) {
        return ref && ref.trim ? true : false;
    }
    /**
     *
     * @param ref The content reference to generate the API-ID for.
     */
    static createApiId(ref, preferGuid = false, editModeId = false) {
        if (this.referenceIsString(ref)) {
            return ref;
        }
        let link = null;
        if (this.referenceIsIContent(ref)) {
            link = ref.contentLink;
        }
        if (this.referenceIsContentLink(ref)) {
            link = ref;
        }
        if (link) {
            if ((preferGuid && link.guidValue) || !link.id) {
                return link.guidValue;
            }
            else {
                let out = link.id.toString();
                if (editModeId && link.workId) {
                    out = `${out}_${link.workId}`;
                }
                if (link.providerName) {
                    out = `${out}__${link.providerName}`;
                }
                return out;
            }
        }
        throw new Error('Unable to generate an Episerver API ID');
    }
    static createRoute(ref) {
        let link = null;
        if (this.referenceIsIContent(ref)) {
            link = ref.contentLink;
        }
        else if (this.referenceIsContentLink(ref)) {
            link = ref;
        }
        if (!link)
            return null;
        return link.url || null;
    }
    static createHref(ref) {
        if (this.referenceIsIContent(ref)) {
            const path = this.getUrlFromLink(ref.contentLink);
            if (!path && ref.url) {
                return ref.url;
            }
            return path;
        }
        if (this.referenceIsContentLink(ref)) {
            return this.getUrlFromLink(ref);
        }
        return null;
    }
    static getUrlFromLink(link) {
        let linkUrl = link.url || '';
        if (linkUrl.substr(0, 1) === '/') {
            // Absolute URL
            const basePath = Spa_1.default.config().basePath;
            linkUrl = linkUrl.substr(1);
            return basePath.substr(-1) === '/' ? basePath + linkUrl : basePath + '/' + linkUrl;
        }
        else {
            return linkUrl;
        }
    }
}
exports.ContentLinkService = ContentLinkService;
