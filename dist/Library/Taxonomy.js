import * as IContentNS from '../Models/IContent';
import * as ContentLinkNS from '../Models/ContentLink';
// Export Property Namespace
export * as Property from '../Property';
// Classes
export const AbstractIContent = IContentNS.BaseIContent;
export const ContentLinkService = ContentLinkNS.ContentLinkService;
// Type guards
export const namePropertyIsString = IContentNS.namePropertyIsString;
