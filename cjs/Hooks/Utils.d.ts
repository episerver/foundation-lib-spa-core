import IContent, { IContentData } from '../Models/IContent';
import { ValueType, ExpandedValueType } from '../Property';
/**
 * Return a helper method that can be used to extract property values from an
 * IContent item, regardless of the ContentDelivery API configuration.
 *
 * @returns The utility method
 */
export declare function usePropertyReader(): <CT extends IContent = IContentData, CTK extends keyof CT = keyof CT>(contentItem: CT, field: CTK) => ValueType<CT[CTK]> | undefined;
/**
 * Return a helper method that can be used to extract expanded values from an
 * IContent item, regardless of the ContentDelivery API configuration.
 *
 * @returns The utility method
 */
export declare function usePropertyExpandedValueReader(): <CT extends IContent = IContentData, CTK extends keyof CT = keyof CT>(contentItem: CT, field: CTK) => ExpandedValueType<CT[CTK]> | undefined;
