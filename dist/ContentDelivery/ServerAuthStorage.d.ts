import IAuthStorage from './IAuthStorage';
import { IOAuthSuccessResponse } from './IAuthService';
/**
 * Authentication storage for usage during server side rendering,
 * for now it acts as a black-hole, refusing to store any form of
 * token.
 */
export declare class ServerAuthStorage implements IAuthStorage {
    clearToken(): boolean;
    storeToken(token: IOAuthSuccessResponse): boolean;
    hasToken(): boolean;
    getToken(): IOAuthSuccessResponse | null;
}
export default ServerAuthStorage;
