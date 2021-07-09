import { readPropertyValue, readPropertyExpandedValue } from '../Property';
/**
 * Return a helper method that can be used to extract property values from an
 * IContent item, regardless of the ContentDelivery API configuration.
 *
 * @returns The utility method
 */
export function usePropertyReader() {
    return (contentItem, field) => readPropertyValue(contentItem, field);
}
/**
 * Return a helper method that can be used to extract expanded values from an
 * IContent item, regardless of the ContentDelivery API configuration.
 *
 * @returns The utility method
 */
export function usePropertyExpandedValueReader() {
    return (contentItem, field) => readPropertyExpandedValue(contentItem, field);
}
//# sourceMappingURL=Utils.js.map