import IContent from './IContent';
export declare type ContentReference = IContent | ContentLink | string;
export declare type ContentApiId = string;
export declare class ContentLinkService {
    private constructor();
    static referenceIsIContent(ref: ContentReference): ref is IContent;
    static referenceIsContentLink(ref: ContentReference): ref is ContentLink;
    static referenceIsString(ref: ContentReference): ref is string;
    /**
     *
     * @param ref The content reference to generate the API-ID for.
     */
    static createApiId(ref: ContentReference): ContentApiId;
    static createHref(ref: ContentReference): string | null;
    protected static getUrlFromLink(link: ContentLink): string;
}
/**
 * Describe a content-link item as returned by the Episerver
 * Content Delivery API.
 */
export default interface ContentLink {
    id: number;
    workId: number;
    guidValue: string;
    providerName: string;
    url: string;
    expanded?: IContent;
}
