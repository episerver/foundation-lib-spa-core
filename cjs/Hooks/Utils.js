"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePropertyExpandedValueReader = exports.usePropertyReader = void 0;
const Property_1 = require("../Property");
/**
 * Return a helper method that can be used to extract property values from an
 * IContent item, regardless of the ContentDelivery API configuration.
 *
 * @returns The utility method
 */
function usePropertyReader() {
    return (contentItem, field) => Property_1.readPropertyValue(contentItem, field);
}
exports.usePropertyReader = usePropertyReader;
/**
 * Return a helper method that can be used to extract expanded values from an
 * IContent item, regardless of the ContentDelivery API configuration.
 *
 * @returns The utility method
 */
function usePropertyExpandedValueReader() {
    return (contentItem, field) => Property_1.readPropertyExpandedValue(contentItem, field);
}
exports.usePropertyExpandedValueReader = usePropertyExpandedValueReader;
//# sourceMappingURL=Utils.js.map