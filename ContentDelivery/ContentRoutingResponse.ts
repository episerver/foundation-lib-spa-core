import ContentLink from '../Models/ContentLink';

export type ContentRoutingResponse = {
    siteName: string,
    siteId: string,
    siteUrl: string,
    contentLink: ContentLink
}
export default ContentRoutingResponse;