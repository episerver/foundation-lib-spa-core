import * as IContentNS from '../Models/IContent';
import * as ContentLinkNS from '../Models/ContentLink';

// Types
export type IContent = IContentNS.default
export type IContentType = IContentNS.IContentType;
export type ContentLink = ContentLinkNS.default;
export type ContentReference = ContentLinkNS.ContentReference;
export type ContentApiId = ContentLinkNS.ContentApiId;

// Classes
export const AbstractIContent = IContentNS.BaseIContent;
export const ContentLinkService = ContentLinkNS.ContentLinkService;