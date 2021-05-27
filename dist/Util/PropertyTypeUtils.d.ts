import IContent from '../Models/IContent';
import ContentLink from '../Models/ContentLink';
import { ContentAreaProperty } from '../Property';
export declare function isString(toTest: unknown): toTest is string;
export declare function isContentLink(toTest: unknown): toTest is ContentLink;
export declare function isContentLinkList(toTest: unknown): toTest is ContentLink[];
export declare function isIContent(toTest: unknown): toTest is IContent;
export declare function isContentArea(toTest: unknown): toTest is ContentAreaProperty;
declare const _default: {
    isContentArea: typeof isContentArea;
    isContentLink: typeof isContentLink;
    isContentLinkList: typeof isContentLinkList;
    isIContent: typeof isIContent;
    isString: typeof isString;
};
export default _default;
