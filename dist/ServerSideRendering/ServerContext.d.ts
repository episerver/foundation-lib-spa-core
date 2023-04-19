import ContentLink from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
type IContentOrSerialized = IContent | string;
type ContentLinkOrSerialzed = ContentLink | string;
type WebsiteOrSerialzed = Website | string;
export declare function isSerializedIContent(data: IContentOrSerialized): data is string;
export declare function isSerializedContentLink(data: ContentLinkOrSerialzed): data is string;
export declare function isSerializedWebsite(data: WebsiteOrSerialzed): data is string;
type LikeALocation = {
    host: string;
    hostname: string;
    href: string;
    origin: string;
    pathname: string;
    protocol: string;
    search: string;
};
/**
 * The TypeScript definition of the ServerContext being passed from .Net to the
 * React Application.
 */
export type DefaultServerContext = {
    /**
     * Window.location compatible location object.
     */
    location: LikeALocation;
    /**
     * The current Path of the request being handled
     */
    path: string;
    /**
     * The IContent passed from the execution (JSON Encoded)
     */
    iContent: IContent;
    /**
     * The ContentLink passed from the execution (JSON Encoded)
     */
    contentLink: ContentLink;
    /**
     * The Current Website (JSON encoded)
     */
    website: Website;
    /**
     * All content items used during server side rendering
     */
    contents: IContent[];
    /**
     * Status marker for the current context
     */
    status?: "available" | "loading";
    /**
     * Ready handler
     */
    onReady?: () => void;
};
export type SerializedServerContext = DefaultServerContext & {
    /**
     * The IContent passed from the execution (JSON Encoded)
     */
    iContent: IContentOrSerialized;
    /**
     * The ContentLink passed from the execution (JSON Encoded)
     */
    contentLink: ContentLinkOrSerialzed;
    /**
     * The Current Website (JSON encoded)
     */
    website: WebsiteOrSerialzed;
    /**
     * All content items used during server side rendering
     */
    contents: IContentOrSerialized[];
};
export type ServerContext<T extends DefaultServerContext = DefaultServerContext> = T & {
    /**
     * Allow custom properties to be written/read from the
     * context.
     */
    [property: string]: unknown | undefined;
};
export default ServerContext;
