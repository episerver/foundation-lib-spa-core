"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPropertyExpandedValue = exports.readAndClearExpandedValue = exports.readExpandedValue = exports.readValue = exports.readPropertyValue = exports.isFlattenedProperty = exports.isVerboseProperty = void 0;
const ContentLink_1 = require("./Models/ContentLink");
/**
 * And property is considered to be verbose if it has a field called
 * propertyDataType, which is a string and a value field which is not undefined
 *
 * @param prop The Property to test
 * @returns If the property is a verbose property
 */
function isVerboseProperty(prop, valueGuard, expandedGuard) {
    var _a;
    const baseIsVerbose = typeof ((_a = prop) === null || _a === void 0 ? void 0 : _a.propertyDataType) == 'string' &&
        prop.propertyDataType.length > 0 &&
        prop.propertyDataType != 'PropertyBlock'; //Special case in the CD-API
    if (baseIsVerbose && valueGuard)
        return valueGuard(prop.value);
    if (baseIsVerbose && expandedGuard)
        return expandedGuard(prop.expandedValue);
    return baseIsVerbose;
}
exports.isVerboseProperty = isVerboseProperty;
function isFlattenedProperty(prop) {
    return !isVerboseProperty(prop);
}
exports.isFlattenedProperty = isFlattenedProperty;
/**
 * Read a property value, regardless if the ContentDelivery API is using the
 * flattened or expanded properties
 *
 * @param contentItem   The IContent item to read from
 * @param field         The field to read
 * @returns The - TypeScript typed - value of the property
 */
function readPropertyValue(contentItem, field) {
    if (!contentItem)
        return undefined;
    return readValue(contentItem[field]);
}
exports.readPropertyValue = readPropertyValue;
function readValue(property) {
    return isVerboseProperty(property) ? property.value : property;
}
exports.readValue = readValue;
function isArray(toTest, itemGuard) {
    if (!((Array.isArray && Array.isArray(toTest)) || (toTest && typeof (toTest) == 'object' && toTest.constructor === Array)))
        return false; // This is not an array
    if (itemGuard)
        return toTest.map(x => itemGuard(x)).reduce((a, b) => a && b); // The array is of this type if all items pass the guard
    return true;
}
function readExpandedValue(property) {
    if (isVerboseProperty(property))
        return property.expandedValue;
    if (ContentLink_1.isContentLink(property))
        return property.expanded;
    if (isArray(property) && property.length > 0) {
        const expValues = property.map(x => {
            if (ContentLink_1.isContentLink(x))
                return x.expanded;
            return x.expandedValue;
        }).filter(x => x);
        if (expValues.length == property.length)
            return expValues;
    }
    return undefined;
}
exports.readExpandedValue = readExpandedValue;
function readAndClearExpandedValue(property) {
    if (isVerboseProperty(property)) {
        const ret = property.expandedValue;
        delete property.expandedValue;
        return ret;
    }
    if (ContentLink_1.isContentLink(property)) {
        const ret = property.expanded;
        delete property.expanded;
        return ret;
    }
    if (isArray(property) && property.length > 0) {
        const expValues = property.map(x => {
            if (ContentLink_1.isContentLink(x)) {
                const ret = x.expanded;
                delete x.expanded;
                return ret;
            }
            const ret = x.expandedValue;
            delete x.expandedValue;
            return ret;
        }).filter(x => x);
        if (expValues.length == property.length)
            return expValues;
    }
    return undefined;
}
exports.readAndClearExpandedValue = readAndClearExpandedValue;
/**
 * Read an expanded value for a property, regardless if the ContentDelivery
 * API is using the flattened or expanded properties
 *
 * @param contentItem   The IContent item to read from
 * @param field         The field to read
 * @returns The - TypeScript typed - value of the property
 */
function readPropertyExpandedValue(contentItem, field) {
    if (!contentItem)
        return undefined;
    const val = contentItem[field];
    if (isVerboseProperty(val))
        return val.expandedValue;
    if (isFlattenedProperty(val) && val.expandedValue)
        return val.expandedValue;
    return undefined;
}
exports.readPropertyExpandedValue = readPropertyExpandedValue;
//# sourceMappingURL=Property.js.map