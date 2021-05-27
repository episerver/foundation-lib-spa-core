import isArray from 'lodash/isArray';
import IContent from '../Models/IContent';
import ContentLink from '../Models/ContentLink';
import { ContentAreaProperty, ContentAreaPropertyItem } from '../Property';

export function isString(toTest: unknown) : toTest is string
{
    return typeof(toTest) === "string";
}

export function isContentLink(toTest: unknown) : toTest is ContentLink
{
    if (typeof(toTest) !== "object" || toTest === null) return false;
    if ((toTest as ContentLink).guidValue && !(toTest as IContent).name) return true;
    return false;
}

export function isContentLinkList(toTest: unknown) : toTest is ContentLink[]
{
    if (!isArray(toTest)) return false;
    return toTest.length === toTest.filter(x => isContentLink(x)).length;
}

export function isIContent(toTest: unknown) : toTest is IContent
{
    if (typeof(toTest) !== "object" || toTest === null) return false;
    if ((toTest as ContentLink).guidValue && (toTest as IContent).name) return true;
    return false;
}

export function isContentArea(toTest: unknown) : toTest is ContentAreaProperty
{
    if (!isArray(toTest)) return false;
    return toTest.length === toTest.filter(x => isContentLink((x as ContentAreaPropertyItem).contentLink) && typeof((x as ContentAreaPropertyItem).displayOption) === 'string').length;
}

export default {
    isContentArea, isContentLink, isContentLinkList, isIContent, isString
}