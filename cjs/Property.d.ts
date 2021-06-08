import IContent from './Models/IContent';
import ContentLink from './Models/ContentLink';
/**
 * Default untyped property definition
 */
export declare type Property<ValueType = any, ExpandedType = any> = {
    propertyDataType: string;
    value: ValueType;
    expandedValue?: ExpandedType;
};
/**
 * Strong typed property definition
 */
export declare type StringProperty = Property<string>;
export declare type NumberProperty = Property<number>;
export declare type BooleanProperty = Property<boolean>;
export declare type ContentReferenceProperty = Property<ContentLink, IContent>;
export declare type ContentReferenceListProperty = Property<ContentLink[], IContent[]>;
export declare type ContentAreaProperty = Property<ContentAreaPropertyValue, IContent[]>;
export declare type LinkListProperty = Property<LinkProperty[]>;
export declare type LinkProperty = {
    href: string;
    title: string;
    target: string;
    text: string;
    contentLink: ContentLink;
};
/**
 * Definition of the ContentArea property value as used within the ContentDelivery API
 */
export declare type ContentAreaPropertyValue = ContentAreaPropertyItem[];
/**
 * A single item within an ContentArea, as returned by the ContentDelivery API
 */
export declare type ContentAreaPropertyItem = {
    contentLink: ContentLink;
    displayOption: string;
    tag: string;
};
export default Property;
