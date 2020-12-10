import IAuthStorage from './IAuthStorage';
import { IOAuthSuccessResponse } from './IAuthService';

/**
 * Authentication storage for usage during server side rendering, 
 * for now it acts as a black-hole, refusing to store any form of
 * token.
 */
export class ServerAuthStorage implements IAuthStorage
{
    clearToken(): boolean
    {
        return true;
    }
    storeToken(token: IOAuthSuccessResponse): boolean
    {
        return false;
    }
    hasToken(): boolean
    {
        return false;
    }
    getToken(): IOAuthSuccessResponse | null
    {
        return null;
    }

}
export default ServerAuthStorage;