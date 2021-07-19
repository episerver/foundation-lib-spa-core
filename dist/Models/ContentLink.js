import EpiContext from '../Spa';
export function isContentLink(toTest) {
    if (typeof (toTest) !== 'object' || toTest === null)
        return false;
    return typeof (toTest.guidValue) == 'string' || typeof (toTest.id) == 'number';
}
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
     * Generate a - language aware - identifier for a given content reference. When the language is mandatory when
     * the reference is a string or ContentLink, and ignored when the reference is iContent. This ID is not supported
     * by the ContentDelivery API.
     *
     * @param   ref           The content reference to generate the API-ID for
     * @param   languageCode  The language code to use, if the reference is not iContent
     * @param   editModeId    If set, get the identifier, including work-id to load a specific version of the content
     * @returns The Language Aware content reference
     */
    static createLanguageId(reference, languageCode, editModeId = false) {
        const baseId = this.createApiId(reference, true, editModeId);
        if (this.referenceIsIContent(reference) && reference.language?.name)
            return `${baseId}___${reference.language.name}`;
        if (!languageCode)
            throw new Error('Reference is not translatable iContent and no languageCode specified!');
        return `${baseId}___${languageCode}`;
    }
    /**
     * Generate a ContentDeliveryAPI Compliant identifier for a given content reference. Preferring
     * the GUID as the default config of the ContentDeliveryAPI does not yield the numeric identifier.
     *
     * @param   ref         The content reference to generate the API-ID for
     * @param   preferGuid  If set, prefer to receive the GUID as api identifier
     * @param   editModeId  If set, get the identifier, including work-id to load a specific version of the content
     * @returns The API key for the provided content reference
     */
    static createApiId(ref, preferGuid = true, editModeId = false) {
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
    /**
     * Try to resolve a route from a content reference
     *
     * @param   ref
     * @returns
     */
    static createRoute(ref) {
        let link = null;
        if (this.referenceIsIContent(ref)) {
            link = ref.contentLink;
        }
        else if (this.referenceIsContentLink(ref)) {
            link = ref;
        }
        return link?.url || null;
    }
    static createHref(ref) {
        if (this.referenceIsIContent(ref)) {
            const path = this.getUrlFromLink(ref.contentLink);
            return (!path && ref.url) ? ref.url : path;
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