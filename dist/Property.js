import { isContentLink } from './Models/ContentLink';
/**
 * And property is considered to be verbose if it has a field called
 * propertyDataType, which is a string and a value field which is not undefined
 *
 * @param prop The Property to test
 * @returns If the property is a verbose property
 */
export function isVerboseProperty(prop, valueGuard, expandedGuard) {
    const baseIsVerbose = typeof (prop?.propertyDataType) == 'string' &&
        prop.propertyDataType.length > 0 &&
        prop.propertyDataType != 'PropertyBlock'; //Special case in the CD-API
    if (baseIsVerbose && valueGuard)
        return valueGuard(prop.value);
    if (baseIsVerbose && expandedGuard)
        return expandedGuard(prop.expandedValue);
    return baseIsVerbose;
}
export function isFlattenedProperty(prop) {
    return !isVerboseProperty(prop);
}
/**
 * Read a property value, regardless if the ContentDelivery API is using the
 * flattened or expanded properties
 *
 * @param contentItem   The IContent item to read from
 * @param field         The field to read
 * @returns The - TypeScript typed - value of the property
 */
export function readPropertyValue(contentItem, field) {
    if (!contentItem)
        return undefined;
    return readValue(contentItem[field]);
}
export function readValue(property) {
    return isVerboseProperty(property) ? property.value : property;
}
function isArray(toTest, itemGuard) {
    if (!((Array.isArray && Array.isArray(toTest)) || (toTest && typeof (toTest) == 'object' && toTest.constructor === Array)))
        return false; // This is not an array
    if (itemGuard)
        return toTest.map(x => itemGuard(x)).reduce((a, b) => a && b); // The array is of this type if all items pass the guard
    return true;
}
export function readExpandedValue(property) {
    if (isVerboseProperty(property))
        return property.expandedValue;
    if (isContentLink(property))
        return property.expanded;
    if (isArray(property) && property.length > 0) {
        const expValues = property.map(x => {
            if (isContentLink(x))
                return x.expanded;
            return x.expandedValue;
        }).filter(x => x);
        if (expValues.length == property.length)
            return expValues;
    }
    return undefined;
}
export function readAndClearExpandedValue(property) {
    if (isVerboseProperty(property)) {
        const ret = property.expandedValue;
        delete property.expandedValue;
        return ret;
    }
    if (isContentLink(property)) {
        const ret = property.expanded;
        delete property.expanded;
        return ret;
    }
    if (isArray(property) && property.length > 0) {
        const expValues = property.map(x => {
            if (isContentLink(x)) {
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
/**
 * Read an expanded value for a property, regardless if the ContentDelivery
 * API is using the flattened or expanded properties
 *
 * @param contentItem   The IContent item to read from
 * @param field         The field to read
 * @returns The - TypeScript typed - value of the property
 */
export function readPropertyExpandedValue(contentItem, field) {
    if (!contentItem)
        return undefined;
    const val = contentItem[field];
    if (isVerboseProperty(val))
        return val.expandedValue;
    if (isFlattenedProperty(val) && val.expandedValue)
        return val.expandedValue;
    return undefined;
}
//# sourceMappingURL=Property.js.map