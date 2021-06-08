"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isContentArea = exports.isIContent = exports.isContentLinkList = exports.isContentLink = exports.isString = void 0;
const isArray_1 = require("lodash/isArray");
function isString(toTest) {
    return typeof (toTest) === "string";
}
exports.isString = isString;
function isContentLink(toTest) {
    if (typeof (toTest) !== "object" || toTest === null)
        return false;
    if (toTest.guidValue && !toTest.name)
        return true;
    return false;
}
exports.isContentLink = isContentLink;
function isContentLinkList(toTest) {
    if (!isArray_1.default(toTest))
        return false;
    return toTest.length === toTest.filter(x => isContentLink(x)).length;
}
exports.isContentLinkList = isContentLinkList;
function isIContent(toTest) {
    if (typeof (toTest) !== "object" || toTest === null)
        return false;
    if (toTest.guidValue && toTest.name)
        return true;
    return false;
}
exports.isIContent = isIContent;
function isContentArea(toTest) {
    if (!isArray_1.default(toTest))
        return false;
    return toTest.length === toTest.filter(x => isContentLink(x.contentLink) && typeof (x.displayOption) === 'string').length;
}
exports.isContentArea = isContentArea;
exports.default = {
    isContentArea, isContentLink, isContentLinkList, isIContent, isString
};
//# sourceMappingURL=PropertyTypeUtils.js.map