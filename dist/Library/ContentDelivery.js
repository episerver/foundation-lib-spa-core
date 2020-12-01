import ContentDeliveryAPI, { PathResponseIsIContent as BasePathResponseIsIContent } from '../ContentDeliveryAPI';
import _FetchAdapter from '../ContentDelivery/FetchAdapter';
import { namePropertyIsString as _namePropertyIsString } from '../Models/IContent';
// V2 API Imports
export * from '../Repository/IRepository';
import * as IContentRepositoryNS from '../Repository/IContentRepository';
import ContentDeliveryAPI_V2 from '../ContentDelivery/ContentDeliveryAPI';
export const PathResponseIsIContent = BasePathResponseIsIContent;
export const FetchAdapter = _FetchAdapter;
export const namePropertyIsString = _namePropertyIsString;
export const DefaultAPI = ContentDeliveryAPI;
export const RepositoryV2 = IContentRepositoryNS.IContentRepository;
export const API_V2 = ContentDeliveryAPI_V2;
