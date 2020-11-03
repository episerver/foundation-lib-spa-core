import IContent from './Models/IContent';
import ContentLink from './Models/ContentLink';
import { ContentAreaPropertyValue } from './Components/ContentArea';
/**
 * Default untyped property definition
 */
export declare type Property<ValueType = any, ExpandedType = any> = {
    propertyDataType: string;
    value: ValueType;
    expandedValue?: ExpandedType;
};
export default Property;
/**
 * String typed property definition
 */
export declare type StringProperty = Property<string>;
export declare type NumberProperty = Property<number>;
export declare type BooleanProperty = Property<boolean>;
export declare type ContentReferenceProperty = Property<ContentLink, IContent>;
export declare type ContentReferenceListProperty = Property<ContentLink[], IContent[]>;
export declare type ContentAreaProperty = Property<ContentAreaPropertyValue, IContent[]>;
export declare type LinkListProperty = Property<LinkProperty[]>;
export interface LinkProperty {
    href: string;
    title: string;
    target: string;
    text: string;
    contentLink: ContentLink;
}
