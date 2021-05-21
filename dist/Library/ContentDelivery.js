// V1 API Imports
import * as ContentDeliveryApiNS from '../ContentDeliveryAPI';
import * as IContentNS from '../Models/IContent';
import * as FetchAdapterNS from '../ContentDelivery/FetchAdapter';
// V2 API Imports
import * as IContentRepositoryNS from '../Repository/IContentRepository';
import * as IContentDeliveryApiNS from '../ContentDelivery/IContentDeliveryAPI';
import * as ContentDeliveryApiV2NS from '../ContentDelivery/ContentDeliveryAPI';
import * as DefaultAuthServiceNS from '../ContentDelivery/DefaultAuthService';
import * as BrowserAuthStorageNS from '../ContentDelivery/BrowserAuthStorage';
import * as ServerAuthStorageNS from '../ContentDelivery/ServerAuthStorage';
// V1 API Exports
export var PathResponseIsIContent = ContentDeliveryApiNS.PathResponseIsIContent;
export var PathResponseIsActionResponse = ContentDeliveryApiNS.PathResponseIsActionResponse;
export var namePropertyIsString = IContentNS.namePropertyIsString;
/**
 * @deprecated Please switch to the V2 API
 */
export var DefaultAPI = ContentDeliveryApiNS.ContentDeliveryAPI;
/**
 * @deprecated Please switch to the V2 API
 */
export var API = ContentDeliveryApiNS.ContentDeliveryAPI;
// Content delivery response modelling
export * from '../Property';
export var FetchAdapter = FetchAdapterNS.FetchAdapter;
export var RepositoryV2 = IContentRepositoryNS.IContentRepository;
export var DefaultAPI_V2 = ContentDeliveryApiV2NS.ContentDeliveryAPI;
export var API_V2 = ContentDeliveryApiV2NS.ContentDeliveryAPI;
export var isNetworkError = IContentDeliveryApiNS.isNetworkError;
export * from '../Repository/IRepository';
export var DefaultAuthService = DefaultAuthServiceNS.DefaultAuthService;
export var BrowserAuthStorage = BrowserAuthStorageNS.BrowserAuthStorage;
export var ServerAuthStorage = ServerAuthStorageNS.ServerAuthStorage;
//# sourceMappingURL=ContentDelivery.js.map