import * as IContentNS from '../Models/IContent';
import * as ContentLinkNS from '../Models/ContentLink';
import * as WebsiteNS from '../Models/Website';
import * as WebsiteListNS from '../Models/WebsiteList';
import * as LanguageNS from '../Models/Language';
import * as LanguageListNS from '../Models/LanguageList';

// Export Property Namespace
export * as Property from '../Property';

// Types
export type IContent = IContentNS.default
export type IContentType = IContentNS.IContentType;
export type ContentLink = ContentLinkNS.default;
export type ContentReference = ContentLinkNS.ContentReference;
export type ContentApiId = ContentLinkNS.ContentApiId;
export type Website = WebsiteNS.default;
export type WebsiteList = WebsiteListNS.default;
export type Language = LanguageNS.default;
export type LanguageList = LanguageListNS.default;

// Classes
export const AbstractIContent = IContentNS.BaseIContent;
export const ContentLinkService = ContentLinkNS.ContentLinkService;

// Type guards
export const namePropertyIsString = IContentNS.namePropertyIsString