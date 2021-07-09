import IContent, { IContentData } from '../Models/IContent';
import { ValueType, ExpandedValueType, readPropertyValue, readPropertyExpandedValue } from '../Property';

/**
 * Return a helper method that can be used to extract property values from an
 * IContent item, regardless of the ContentDelivery API configuration.
 * 
 * @returns The utility method
 */
export function usePropertyReader() : <CT extends IContent = IContentData, CTK extends keyof CT = keyof CT>(contentItem: CT, field: CTK) => ValueType<CT[CTK]> | undefined
{
    return (contentItem, field) => readPropertyValue(contentItem, field);
}

/**
 * Return a helper method that can be used to extract expanded values from an
 * IContent item, regardless of the ContentDelivery API configuration.
 * 
 * @returns The utility method
 */
export function usePropertyExpandedValueReader() : <CT extends IContent = IContentData, CTK extends keyof CT = keyof CT>(contentItem: CT, field: CTK) => ExpandedValueType<CT[CTK]> | undefined
{
    return (contentItem, field) => readPropertyExpandedValue(contentItem, field);
}