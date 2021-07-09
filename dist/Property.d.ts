import IContent, { IContentData } from './Models/IContent';
import ContentLink from './Models/ContentLink';
export declare type PropertyDataType<ValueType> = ValueType extends ContentLink ? "PropertyContentReference" | "PropertyPageReference" : ValueType extends ContentAreaPropertyValue ? "PropertyContentArea" : ValueType extends ContentLink[] ? "PropertyContentReferenceList" : string;
export declare type ExpandedTypeFor<DataType> = DataType extends ContentLink ? IContent : DataType extends ContentLink[] ? IContent[] : DataType extends ContentAreaPropertyValue ? IContent[] : never;
export declare type FlattenedProperty<ValueType = unknown> = ValueType;
export declare type VerboseProperty<ValueType = unknown, ExpandedType = ExpandedTypeFor<ValueType>, ValueTypeIdentifier extends string = PropertyDataType<ValueType>> = {
    propertyDataType: ValueTypeIdentifier;
    value: ValueType;
    expandedValue?: ExpandedType;
};
export declare type Property<ValueType = unknown, ExpandedType = ExpandedTypeFor<ValueType>, ValueTypeIdentifier extends string = PropertyDataType<ValueType>> = FlattenedProperty<ValueType> | VerboseProperty<ValueType, ExpandedType, ValueTypeIdentifier>;
export declare type PropertyBag = Record<string, Property<unknown>>;
/**
 * And property is considered to be verbose if it has a field called
 * propertyDataType, which is a string and a value field which is not undefined
 *
 * @param prop The Property to test
 * @returns If the property is a verbose property
 */
export declare function isVerboseProperty<ValueType = unknown, ExpandedType = unknown>(prop: Property<ValueType, ExpandedType>, valueGuard?: (value: unknown) => value is ValueType, expandedGuard?: (value: unknown) => value is ExpandedType | undefined): prop is VerboseProperty<ValueType, ExpandedType>;
export declare function isFlattenedProperty<ValueType = unknown, ExpandedType = ExpandedTypeFor<ValueType>>(prop: Property<ValueType, ExpandedType>): prop is FlattenedProperty<ValueType>;
/**
 * Read a property value, regardless if the ContentDelivery API is using the
 * flattened or expanded properties
 *
 * @param contentItem   The IContent item to read from
 * @param field         The field to read
 * @returns The - TypeScript typed - value of the property
 */
export declare function readPropertyValue<CT extends IContent = IContentData, CTK extends keyof CT = keyof CT>(contentItem: CT, field: CTK): ValueType<CT[CTK]> | undefined;
export declare function readValue<DataType = unknown>(property: Property<DataType>): DataType | undefined;
export declare function readExpandedValue<DataType>(property: Property<DataType, ExpandedTypeFor<DataType>>): ExpandedTypeFor<DataType> | undefined;
export declare function readAndClearExpandedValue<DataType>(property: Property<DataType, ExpandedTypeFor<DataType>>): ExpandedTypeFor<DataType> | undefined;
/**
 * Read an expanded value for a property, regardless if the ContentDelivery
 * API is using the flattened or expanded properties
 *
 * @param contentItem   The IContent item to read from
 * @param field         The field to read
 * @returns The - TypeScript typed - value of the property
 */
export declare function readPropertyExpandedValue<CT extends IContent = IContentData, CTK extends keyof CT = keyof CT>(contentItem: CT, field: CTK): ExpandedValueType<CT[CTK]> | undefined;
export declare type ExpandedValueType<T> = T extends ContentReferenceProperty ? IContent : T extends ContentReferenceListProperty ? IContent[] : T extends ContentAreaProperty ? IContent[] : undefined;
export declare type ValueType<T> = T extends StringProperty ? string : T extends NumberProperty ? number : T extends BooleanProperty ? boolean : T extends ContentReferenceProperty ? ContentLink : T extends ContentReferenceListProperty ? ContentLink[] : T extends ContentAreaProperty ? ContentAreaPropertyValue : T extends LinkListProperty ? LinkProperty[] : T extends LinkProperty ? LinkProperty : T extends VerboseProperty<T, unknown> ? T : T;
/**
 * Strong typed property definition
 */
export declare type StringProperty = Property<string>;
export declare type NumberProperty = Property<number>;
export declare type BooleanProperty = Property<boolean>;
export declare type ContentReferenceProperty = FlattenedProperty<ContentLink> | VerboseProperty<ContentLink>;
export declare type ContentReferenceListProperty = Property<ContentLink[], IContent[]>;
export declare type ContentAreaProperty = Property<ContentAreaPropertyValue, IContent[]>;
export declare type LinkListProperty = Property<LinkPropertyData[]>;
export declare type LinkProperty = Property<LinkPropertyData>;
export declare type LinkPropertyData = {
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
export declare type ContentAreaPropertyItem<T extends IContent = IContent> = {
    contentLink: ContentLink;
    displayOption: string;
    tag: string;
    expandedValue?: T;
};
export default Property;
