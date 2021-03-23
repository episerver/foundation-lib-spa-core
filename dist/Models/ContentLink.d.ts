import IContent from './IContent';
export declare type ContentReference = IContent | ContentLink | string;
export declare type ContentApiId = string;
/**
 * Describe a content-link item as returned by the Episerver
 * Content Delivery API.
 */
export declare type ContentLink = {
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
     * Generate a - language aware - identifier for a given content reference. When the language is mandatory when the reference is
     * a string or ContentLink, and ignored when the reference is iContent.
     *
     * @param { ContentReference }  ref           The content reference to generate the API-ID for
     * @param { string }            languageCode  The language code to use, if the reference is not iContent
     * @param { boolean }           editModeId    If set, get the identifier, including work-id to load a specific version of the content
     * @returns { ContentApiId }
     */
    static createLanguageId(reference: ContentReference, languageCode?: string, editModeId?: boolean): ContentApiId;
    /**
     * Generate a ContentDeliveryAPI Compliant identifier for a given content reference.
     *
     * @param { ContentReference }  ref         The content reference to generate the API-ID for
     * @param { boolean }           preferGuid  If set, prefer to receive the GUID as api identifier
     * @param { boolean }           editModeId  If set, get the identifier, including work-id to load a specific version of the content
     * @returns { ContentApiId }
     */
    static createApiId(ref: ContentReference, preferGuid?: boolean, editModeId?: boolean): ContentApiId;
    static createRoute(ref: ContentReference): string | null;
    static createHref(ref: ContentReference): string | null;
    protected static getUrlFromLink(link: ContentLink): string;
}
export default ContentLink;
