import IContent, { IContentData } from './Models/IContent';
import ContentLink, { isContentLink } from './Models/ContentLink';

// Internal short-hand types
export type PropertyDataType<ValueType> =
    ValueType extends ContentLink ? "PropertyContentReference" | "PropertyPageReference" :
    ValueType extends ContentAreaPropertyValue ? "PropertyContentArea" :
    ValueType extends ContentLink[] ? "PropertyContentReferenceList" :
    string;
export type ExpandedTypeFor<DataType> = 
    DataType extends ContentLink ? IContent : 
    DataType extends ContentLink[] ? IContent[] : 
    DataType extends ContentAreaPropertyValue ? IContent[] :
    never

// Base types
export type FlattenedProperty<ValueType = unknown> = ValueType;
export type VerboseProperty<ValueType = unknown, ExpandedType = ExpandedTypeFor<ValueType>, ValueTypeIdentifier extends string = PropertyDataType<ValueType>> = {
  propertyDataType: ValueTypeIdentifier
  value: ValueType
  expandedValue?: ExpandedType
}
export type Property<ValueType = unknown, ExpandedType = ExpandedTypeFor<ValueType>, ValueTypeIdentifier extends string = PropertyDataType<ValueType>> = FlattenedProperty<ValueType> | VerboseProperty<ValueType, ExpandedType, ValueTypeIdentifier>
export type PropertyBag = Record<string, Property<unknown>>

/**
 * And property is considered to be verbose if it has a field called 
 * propertyDataType, which is a string and a value field which is not undefined
 * 
 * @param prop The Property to test
 * @returns If the property is a verbose property
 */
export function isVerboseProperty<ValueType = unknown, ExpandedType = unknown>(prop: Property<ValueType, ExpandedType>, valueGuard ?: (value: unknown) => value is ValueType, expandedGuard ?: (value: unknown) => value is ExpandedType | undefined) : prop is VerboseProperty<ValueType, ExpandedType>
{
    const baseIsVerbose = 
        typeof((prop as VerboseProperty<ValueType, ExpandedType> | undefined | null)?.propertyDataType) == 'string' && 
        (prop as VerboseProperty<ValueType, ExpandedType>).propertyDataType.length > 0 &&
        (prop as VerboseProperty<ValueType, ExpandedType>).propertyDataType != 'PropertyBlock'; //Special case in the CD-API

    if (baseIsVerbose && valueGuard)
        return valueGuard((prop as VerboseProperty<ValueType, ExpandedType>).value);

    if (baseIsVerbose && expandedGuard)
        return expandedGuard((prop as VerboseProperty<ValueType, ExpandedType>).expandedValue);

    return baseIsVerbose;
}

export function isFlattenedProperty<ValueType = unknown, ExpandedType = ExpandedTypeFor<ValueType>>(prop: Property<ValueType, ExpandedType>) : prop is FlattenedProperty<ValueType>
{
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
export function readPropertyValue<CT extends IContent = IContentData, CTK extends keyof CT = keyof CT>(contentItem: CT, field: CTK) : ValueType<CT[CTK]> | undefined
{
    if (!contentItem)
        return undefined;

    return readValue<ValueType<CT[CTK]>>(contentItem[field] as Property<ValueType<CT[CTK]>>)
    
}

export function readValue<DataType = unknown>(property: Property<DataType>) : DataType | undefined
{
    return isVerboseProperty(property) ? property.value : property;
}

function isArray<T = unknown>(toTest: unknown, itemGuard ?: (toTest: unknown) => toTest is T) : toTest is T[]
{
    if (!((Array.isArray && Array.isArray(toTest)) || (toTest && typeof(toTest) == 'object' && toTest.constructor === Array)))
        return false; // This is not an array

    if (itemGuard)
        return toTest.map(x => itemGuard(x)).reduce((a,b) => a && b); // The array is of this type if all items pass the guard

    return true;
} 

export function readExpandedValue<DataType>(property: Property<DataType, ExpandedTypeFor<DataType>>) : ExpandedTypeFor<DataType> | undefined
{
    if (isVerboseProperty(property))
        return property.expandedValue

    if (isContentLink(property))
        return property.expanded as ExpandedTypeFor<DataType> | undefined

    if (isArray<ContentLink | ContentAreaPropertyItem>(property) && property.length > 0) {
        const expValues = property.map(x => {
            if (isContentLink(x))
                return x.expanded
            return x.expandedValue
        }).filter(x => x);
        if (expValues.length == property.length)  
            return expValues as ExpandedTypeFor<DataType>;
    }

    return undefined;
}

export function readAndClearExpandedValue<DataType>(property: Property<DataType, ExpandedTypeFor<DataType>>) : ExpandedTypeFor<DataType> | undefined
{
    if (isVerboseProperty(property)) {
        const ret = property.expandedValue
        delete property.expandedValue;
        return ret;
    }

    if (isContentLink(property)) {
        const ret = property.expanded as ExpandedTypeFor<DataType> | undefined
        delete property.expanded;
        return ret;
    }

    if (isArray<ContentLink | ContentAreaPropertyItem>(property) && property.length > 0) {
        const expValues = property.map(x => {
            if (isContentLink(x)) {
                const ret = x.expanded;
                delete x.expanded
                return ret;
            }
            const ret = x.expandedValue;
            delete x.expandedValue
            return ret;
        }).filter(x => x);
        if (expValues.length == property.length)  
            return expValues as ExpandedTypeFor<DataType>;
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
export function readPropertyExpandedValue<CT extends IContent = IContentData, CTK extends keyof CT = keyof CT>(contentItem: CT, field: CTK) : ExpandedValueType<CT[CTK]> | undefined
{
    if (!contentItem)
        return undefined;
    const val = contentItem[field];
    if (isVerboseProperty(val))
        return val.expandedValue as ExpandedValueType<CT[CTK]> | undefined;
    if (isFlattenedProperty(val) && (val as unknown as { expandedValue: unknown }).expandedValue)
        return (val as unknown as { expandedValue: unknown }).expandedValue as ExpandedValueType<CT[CTK]> | undefined;
        
    return undefined;
}

export type ExpandedValueType<T> = 
    T extends ContentReferenceProperty ? IContent : 
    T extends ContentReferenceListProperty  ? IContent[] : 
    T extends ContentAreaProperty ? IContent[] : 
    undefined;

export type ValueType<T> = 
    T extends StringProperty ? string :
    T extends NumberProperty ? number :
    T extends BooleanProperty ? boolean :
    T extends ContentReferenceProperty ? ContentLink : 
    T extends ContentReferenceListProperty  ? ContentLink[] : 
    T extends ContentAreaProperty ? ContentAreaPropertyValue : 
    T extends LinkListProperty ? LinkProperty[] :
    T extends LinkProperty ? LinkProperty :
    T extends VerboseProperty<T, unknown> ? T :
    T;

/**
 * Strong typed property definition
 */
export type StringProperty = Property<string>
export type NumberProperty = Property<number>
export type BooleanProperty = Property<boolean>
export type ContentReferenceProperty = FlattenedProperty<ContentLink> | VerboseProperty<ContentLink>
export type ContentReferenceListProperty = Property<ContentLink[], IContent[]>
export type ContentAreaProperty = Property<ContentAreaPropertyValue, IContent[]>
export type LinkListProperty = Property<LinkPropertyData[]>
export type LinkProperty = Property<LinkPropertyData>

// ****** CORE TYPES ****** //
export type LinkPropertyData = {
  href: string;
  title: string;
  target: string;
  text: string;
  contentLink: ContentLink;
}

/**
 * Definition of the ContentArea property value as used within the ContentDelivery API
 */
export type ContentAreaPropertyValue = ContentAreaPropertyItem[];

/**
 * A single item within an ContentArea, as returned by the ContentDelivery API
 */
export type ContentAreaPropertyItem<T extends IContent = IContent> = {
    contentLink: ContentLink
    displayOption: string
    tag: string
    expandedValue ?: T
}

export default Property;