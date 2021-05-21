import IContentDeliveryAPI from './IContentDeliveryAPI';
import IAuthStorage from './IAuthStorage';
import { NetworkErrorData } from '../ContentDeliveryAPI';
import EventEmitter from 'eventemitter3';
export declare const networkErrorToOAuthError: (message: NetworkErrorData) => IOAuthErrorResponse;
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
export declare type IAuthEvents = {
    /**
     * Handler for the Login event
     *
     * @param { string } username   The name of the user who has just authenticated
     */
    login: (username: string) => void;
    logout: () => void;
};
export declare type IAuthService = EventEmitter<IAuthEvents> & {
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<boolean>;
    isAuthenticated: () => Promise<boolean>;
    currentUser: () => Promise<string | null>;
    ping: () => Promise<void>;
};
export declare type IAuthServiceStatic = new (api: IContentDeliveryAPI, storage?: IAuthStorage) => IAuthService;
export default IAuthService;
