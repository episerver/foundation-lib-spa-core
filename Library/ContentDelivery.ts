
import ContentDeliveryAPI, { PathResponse as BasePathResponse, NetworkErrorData as BaseNetworkErrorData, PathResponseIsIContent as BasePathResponseIsIContent } from '../ContentDeliveryAPI';

import _Property, {
    StringProperty as _StringProperty, 
    NumberProperty as _NumberProperty, 
    BooleanProperty as _BooleanProperty, 
    ContentReferenceProperty as _ContentReferenceProperty, 
    ContentAreaProperty as _ContentAreaProperty, 
    LinkListProperty as _LinkListProperty, 
    LinkProperty as _LinkProperty
} from '../Property';
import ContentLink from '../Models/ContentLink';


export const PathResponseIsIContent = BasePathResponseIsIContent;
export const DefaultAPI = ContentDeliveryAPI;
export type API = ContentDeliveryAPI;
export type NetworkErrorData = BaseNetworkErrorData;
export type PathResponse = BasePathResponse;

// Content delivery response modelling
export type Property<T = any> = _Property<T>;
export type StringProperty = _StringProperty; 
export type NumberProperty = _NumberProperty; 
export type BooleanProperty = _BooleanProperty;
export type ContentReferenceProperty = _ContentReferenceProperty;
export type ContentAreaProperty = _ContentAreaProperty;
export type LinkListProperty = _LinkListProperty;
export type LinkProperty = _LinkProperty;
export type ContentReferenceListProperty = _Property<ContentLink[]>