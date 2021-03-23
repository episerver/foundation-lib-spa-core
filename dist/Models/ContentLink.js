import EpiContext from '../Spa';
export class ContentLinkService {
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
     * Generate a - language aware - identifier for a given content reference. When the language is mandatory when the reference is
     * a string or ContentLink, and ignored when the reference is iContent.
     *
     * @param { ContentReference }  ref           The content reference to generate the API-ID for
     * @param { string }            languageCode  The language code to use, if the reference is not iContent
     * @param { boolean }           editModeId    If set, get the identifier, including work-id to load a specific version of the content
     * @returns { ContentApiId }
     */
    static createLanguageId(reference, languageCode, editModeId = false) {
        var _a;
        const baseId = this.createApiId(reference, false, editModeId);
        if (this.referenceIsIContent(reference) && ((_a = reference.language) === null || _a === void 0 ? void 0 : _a.name))
            return `${baseId}___${reference.language.name}`;
        if (!languageCode)
            throw new Error('Reference is not translatable iContent and no languageCode specified!');
        return `${baseId}___${languageCode}`;
    }
    /**
     * Generate a ContentDeliveryAPI Compliant identifier for a given content reference.
     *
     * @param { ContentReference }  ref         The content reference to generate the API-ID for
     * @param { boolean }           preferGuid  If set, prefer to receive the GUID as api identifier
     * @param { boolean }           editModeId  If set, get the identifier, including work-id to load a specific version of the content
     * @returns { ContentApiId }
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
            const basePath = EpiContext.config().basePath;
            linkUrl = linkUrl.substr(1);
            return basePath.substr(-1) === '/' ? basePath + linkUrl : basePath + '/' + linkUrl;
        }
        else {
            return linkUrl;
        }
    }
}
//# sourceMappingURL=ContentLink.js.map