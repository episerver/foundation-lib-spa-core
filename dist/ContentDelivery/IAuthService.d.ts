import IContentDeliveryAPI from './IContentDeliveryAPI';
import IAuthStorage from './IAuthStorage';
export declare type IOAuthSuccessResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    client_id: string;
    username: string;
    '.issued': string;
    '.expires': string;
};
export declare type IOAuthErrorResponse = {
    error: string;
    error_description: string;
};
export declare type IOAuthResponse = IOAuthSuccessResponse | IOAuthErrorResponse;
export declare const IOAuthResponseIsError: (response: IOAuthResponse) => response is IOAuthErrorResponse;
export declare const IOAuthResponseIsSuccess: (response: IOAuthResponse) => response is IOAuthSuccessResponse;
export declare type IOAuthRequest = {
    client_id: 'Default';
} & ({
    grant_type: 'password';
    username: string;
    password: string;
} | {
    grant_type: 'refresh_token';
    refresh_token: string;
});
export declare type IAuthService = {
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<boolean>;
    isAuthenticated: () => Promise<boolean>;
    currentUser: () => Promise<string | null>;
    ping: () => Promise<void>;
};
export declare type IAuthServiceStatic = new (api: IContentDeliveryAPI, storage?: IAuthStorage) => IAuthService;
export default IAuthService;
