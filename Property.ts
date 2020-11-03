import IContent from './Models/IContent';
import ContentLink from './Models/ContentLink';
import { ContentAreaPropertyValue } from './Components/ContentArea';

/**
 * Default untyped property definition
 */
export type Property<ValueType = any, ExpandedType = any> = {
  propertyDataType: string;
  value: ValueType;
  expandedValue?: ExpandedType;
}
export default Property;

/**
 * String typed property definition
 */
export type StringProperty = Property<string>
export type NumberProperty = Property<number>
export type BooleanProperty = Property<boolean>
export type ContentReferenceProperty = Property<ContentLink, IContent>
export type ContentReferenceListProperty = Property<ContentLink[], IContent[]>
export type ContentAreaProperty = Property<ContentAreaPropertyValue, IContent[]>
export type LinkListProperty = Property<LinkProperty[]>

export interface LinkProperty {
  href: string;
  title: string;
  target: string;
  text: string;
  contentLink: ContentLink;
}
