// Export Property Namespace
export * as Property from '../Property';
export * from '../Models/Language';
export * from '../Models/LanguageList';
export * from '../Models/Website';
export * from '../Models/WebsiteList';
export * from '../Models/ContentLink';

// IContent
import * as IContentNS from '../Models/IContent';
export type IContent = IContentNS.default
export type IContentType = IContentNS.IContentType;
export const AbstractIContent = IContentNS.BaseIContent;
export const namePropertyIsString = IContentNS.namePropertyIsString