import isArray from 'lodash/isArray';
export function isString(toTest) {
    return typeof (toTest) === "string";
}
export function isContentLink(toTest) {
    if (typeof (toTest) !== "object" || toTest === null)
        return false;
    if (toTest.guidValue && !toTest.name)
        return true;
    return false;
}
export function isContentLinkList(toTest) {
    if (!isArray(toTest))
        return false;
    return toTest.length === toTest.filter(x => isContentLink(x)).length;
}
export function isIContent(toTest) {
    if (typeof (toTest) !== "object" || toTest === null)
        return false;
    if (toTest.guidValue && toTest.name)
        return true;
    return false;
}
export function isContentArea(toTest) {
    if (!isArray(toTest))
        return false;
    return toTest.length === toTest.filter(x => isContentLink(x.contentLink) && typeof (x.displayOption) === 'string').length;
}
export default {
    isContentArea, isContentLink, isContentLinkList, isIContent, isString
};
//# sourceMappingURL=PropertyTypeUtils.js.map