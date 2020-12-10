import IContentDeliveryAPI from './IContentDeliveryAPI';
import IAuthStorage from './IAuthStorage';

export type IOAuthSuccessResponse = {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
    client_id: string
    username: string
    '.issued': string
    '.expires': string
}
export type IOAuthErrorResponse = {
    error: string,
    error_description: string
}
export type IOAuthResponse = IOAuthSuccessResponse | IOAuthErrorResponse;
export const IOAuthResponseIsError : (response : IOAuthResponse) => response is IOAuthErrorResponse = (response : IOAuthResponse) : response is IOAuthErrorResponse => {
    return typeof((response as IOAuthErrorResponse)?.error) === 'string' ? true : false;
}
export const IOAuthResponseIsSuccess : (response : IOAuthResponse) => response is IOAuthSuccessResponse = (response : IOAuthResponse) : response is IOAuthSuccessResponse => {
    return typeof((response as IOAuthSuccessResponse)?.access_token) === 'string' ? true : false;
}
export type IOAuthRequest = {
    client_id: 'Default'
} & ({
    grant_type: 'password'
    username: string
    password: string
} | {
    grant_type: 'refresh_token',
    refresh_token: string
});
export type IAuthService = {
    login: (username: string, password: string) => Promise<boolean>
    logout: () => Promise<boolean>
    isAuthenticated: () => Promise<boolean>
    currentUser: () => Promise<string|null>
    ping: () => Promise<void>
}
export type IAuthServiceStatic = new (api: IContentDeliveryAPI, storage ?: IAuthStorage)  => IAuthService
export default IAuthService;