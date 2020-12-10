
import ContentDeliveryAPI, { PathResponse as BasePathResponse, NetworkErrorData as BaseNetworkErrorData, PathResponseIsIContent as BasePathResponseIsIContent } from '../ContentDeliveryAPI';
import BaseActionResponse from '../Models/ActionResponse';
import _Property, {
    StringProperty as _StringProperty, 
    NumberProperty as _NumberProperty, 
    BooleanProperty as _BooleanProperty, 
    ContentReferenceProperty as _ContentReferenceProperty, 
    ContentReferenceListProperty as _ContentReferenceListProperty,
    ContentAreaProperty as _ContentAreaProperty, 
    LinkListProperty as _LinkListProperty, 
    LinkProperty as _LinkProperty
} from '../Property';
import _FetchAdapter from '../ContentDelivery/FetchAdapter';
import IContent, { namePropertyIsString as _namePropertyIsString } from '../Models/IContent';

// V2 API Imports
export * from '../Repository/IRepository';
import * as IContentRepositoryNS from '../Repository/IContentRepository';
import * as IIContentRepositoryNS from '../Repository/IIContentRepository';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';
import ContentDeliveryAPI_V2 from '../ContentDelivery/ContentDeliveryAPI';
import IContentDeliveryAPIConfig from '../ContentDelivery/Config';
import * as DefaultAuthServiceNS from '../ContentDelivery/DefaultAuthService';
import * as IAuthServiceNS from '../ContentDelivery/IAuthService';
import * as IAuthStorageNS from '../ContentDelivery/IAuthStorage';
import * as IAuthTokenProviderNS from '../ContentDelivery/IAuthTokenProvider';
import * as BrowserAuthStorageNS from '../ContentDelivery/BrowserAuthStorage';
import * as ServerAuthStorageNS from '../ContentDelivery/ServerAuthStorage';

export const PathResponseIsIContent = BasePathResponseIsIContent;
export const FetchAdapter = _FetchAdapter;
export const namePropertyIsString = _namePropertyIsString;
export const DefaultAPI = ContentDeliveryAPI;
export type API = ContentDeliveryAPI;
export type NetworkErrorData = BaseNetworkErrorData;
export type PathResponse<T = any, C extends IContent = IContent> = BasePathResponse<T, C>;
export type ActionResponse<T = any, C extends IContent = IContent> = BaseActionResponse<T, C>

// Content delivery response modelling
export type Property<T = any> = _Property<T>;
export type StringProperty = _StringProperty; 
export type NumberProperty = _NumberProperty; 
export type BooleanProperty = _BooleanProperty;
export type ContentReferenceProperty = _ContentReferenceProperty;
export type ContentAreaProperty = _ContentAreaProperty;
export type LinkListProperty = _LinkListProperty;
export type LinkProperty = _LinkProperty;
export type ContentReferenceListProperty = _ContentReferenceListProperty;

// V2 API
export type IContentDeliveryAPI_V2 = IContentDeliveryAPI;
export type ConfigV2 = IContentDeliveryAPIConfig;
export type IIContentRepositoryV2 = IIContentRepositoryNS.IIContentRepository;
export const RepositoryV2 = IContentRepositoryNS.IContentRepository;
export const API_V2 = ContentDeliveryAPI_V2;

// V2 Auth API
export type IAuthService = IAuthServiceNS.IAuthService
export type IAuthServiceStatic = IAuthServiceNS.IAuthServiceStatic
export type IOAuthRequest = IAuthServiceNS.IOAuthRequest
export type IOAuthResponse = IAuthServiceNS.IOAuthResponse
export type IOAuthErrorResponse = IAuthServiceNS.IOAuthErrorResponse
export type IOAuthSuccessResponse = IAuthServiceNS.IOAuthSuccessResponse
export type IAuthStorage = IAuthStorageNS.IAuthStorage
export type IAuthToken = IAuthTokenProviderNS.IAuthToken
export type IAuthTokenProvider = IAuthTokenProviderNS.IAuthTokenProvider
export const DefaultAuthService = DefaultAuthServiceNS.DefaultAuthService
export const BrowserAuthStorage = BrowserAuthStorageNS.BrowserAuthStorage
export const ServerAuthStorage = ServerAuthStorageNS.ServerAuthStorage