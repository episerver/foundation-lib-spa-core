import IContent from './IContent';
export type ContentReference = IContent | ContentLink | string;
export type ContentApiId = string;
/**
 * Describe a content-link item as returned by the Episerver
 * Content Delivery API.
 */
export type ContentLink = {
    id: number;
    workId?: number;
    guidValue: string;
    providerName?: string;
    url: string;
    expanded?: IContent;
};
export declare class ContentLinkService {
    private constructor();
    static referenceIsIContent(ref: ContentReference): ref is IContent;
    static referenceIsContentLink(ref: ContentReference): ref is ContentLink;
    static referenceIsString(ref: ContentReference): ref is string;
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
    static createLanguageId(reference: ContentReference, languageCode?: string, editModeId?: boolean): ContentApiId;
    /**
     * Generate a ContentDeliveryAPI Compliant identifier for a given content reference. Preferring
     * the GUID as the default config of the ContentDeliveryAPI does not yield the numeric identifier.
     *
     * @param   ref         The content reference to generate the API-ID for
     * @param   preferGuid  If set, prefer to receive the GUID as api identifier
     * @param   editModeId  If set, get the identifier, including work-id to load a specific version of the content
     * @returns The API key for the provided content reference
     */
    static createApiId(ref: ContentReference, preferGuid?: boolean, editModeId?: boolean): ContentApiId;
    /**
     * Try to resolve a route from a content reference
     *
     * @param   ref
     * @returns
     */
    static createRoute(ref: ContentReference): string | null;
    static createHref(ref: ContentReference): string | null;
    protected static getUrlFromLink(link: ContentLink): string;
}
export default ContentLink;
