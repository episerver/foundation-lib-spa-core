import IContentDeliveryAPI from './IContentDeliveryAPI';
import IAuthStorage from './IAuthStorage';
import IAuthService from './IAuthService';
import IAuthTokenProvider, { IAuthToken } from './IAuthTokenProvider';
export declare class DefaultAuthService implements IAuthService, IAuthTokenProvider {
    private _storage;
    private _api;
    constructor(api: IContentDeliveryAPI, storage?: IAuthStorage);
    getCurrentToken(): Promise<IAuthToken | undefined>;
    ping(): Promise<void>;
    currentUser(): Promise<string | null>;
    login(username: string, password: string): Promise<boolean>;
    logout(): Promise<boolean>;
    isAuthenticated(): Promise<boolean>;
}
export default DefaultAuthService;
