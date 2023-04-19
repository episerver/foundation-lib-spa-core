import IContent from './Models/IContent';
import ContentLink from './Models/ContentLink';
/**
 * Default untyped property definition
 */
export type Property<ValueType = any, ExpandedType = any> = {
    propertyDataType: string;
    value: ValueType;
    expandedValue?: ExpandedType;
};
/**
 * Strong typed property definition
 */
export type StringProperty = Property<string>;
export type NumberProperty = Property<number>;
export type BooleanProperty = Property<boolean>;
export type ContentReferenceProperty = Property<ContentLink, IContent>;
export type ContentReferenceListProperty = Property<ContentLink[], IContent[]>;
export type ContentAreaProperty = Property<ContentAreaPropertyValue, IContent[]>;
export type LinkListProperty = Property<LinkProperty[]>;
export type LinkProperty = {
    href: string;
    title: string;
    target: string;
    text: string;
    contentLink: ContentLink;
};
/**
 * Definition of the ContentArea property value as used within the ContentDelivery API
 */
export type ContentAreaPropertyValue = ContentAreaPropertyItem[];
/**
 * A single item within an ContentArea, as returned by the ContentDelivery API
 */
export type ContentAreaPropertyItem = {
    contentLink: ContentLink;
    displayOption: string;
    tag: string;
};
export default Property;
