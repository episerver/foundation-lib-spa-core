"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIContent = exports.isIContent = void 0;
const ArrayUtils_1 = require("../Util/ArrayUtils");
/**
 * Test to see if a value is of type IContent, which is considered to be
 * the case if - and only if - the following criteria are satisfied:
 * - The parameter is an object
 * - With a property contentType that is a non-empty array of strings
 * - With a property contentLink that is an object that has either a non
 *      empty "guid" or non empty "id" property
 *
 * @param       toTest      The value to be tested
 * @returns     True if the value is IContent or false otherwise
 */
const isIContent = (toTest) => {
    if (typeof (toTest) != "object")
        return false;
    if (!ArrayUtils_1.isArray(toTest.contentType, (x) => typeof (x) == 'string') || toTest.contentType.length == 0)
        return false;
    if (typeof (toTest.contentLink) != "object")
        return false;
    if (!(toTest.contentLink.guidValue || toTest.contentLink.id))
        return false;
    return true;
};
exports.isIContent = isIContent;
class BaseIContent {
    constructor(baseData) {
        this._serverData = baseData;
    }
    get contentLink() { return this.getProperty("contentLink"); }
    get name() { return this.getProperty("name"); }
    get language() { return this.getProperty("language"); }
    get existingLanguages() { return this.getProperty("existingLanguages"); }
    get masterLanguage() { return this.getProperty("masterLanguage"); }
    get contentType() { return this.getProperty("contentType"); }
    get parentLink() { return this.getProperty("parentLink"); }
    get routeSegment() { return this.getProperty("routeSegment"); }
    get url() { return this.getProperty("url"); }
    get changed() { return this.getProperty("changed"); }
    get created() { return this.getProperty("created"); }
    get startPublish() { return this.getProperty("startPublish"); }
    get stopPublish() { return this.getProperty("stopPublish"); }
    get saved() { return this.getProperty("saved"); }
    get status() { return this.getProperty("status"); }
    get typeName() {
        return this._typeName;
    }
    getTypeName() {
        return this._typeName;
    }
    getProperty(prop) {
        return this._serverData[prop];
    }
    getPropertyType(prop) {
        return this._propertyMap[prop.toString()];
    }
}
exports.BaseIContent = BaseIContent;
//# sourceMappingURL=IContent.js.map