import IAuthStorage from './IAuthStorage';
import { IOAuthSuccessResponse } from './IAuthService';

/**
 * Authentication storage for usage during server side rendering, 
 * for now it acts as a black-hole, refusing to store any form of
 * token.
 */
export class ServerAuthStorage implements IAuthStorage
{
    clearToken: () => boolean = () => true;
    storeToken: (token: IOAuthSuccessResponse) => boolean = () => false;
    hasToken: () => boolean = () => false;
    getToken: () => IOAuthSuccessResponse | null = () => null;
}
export default ServerAuthStorage;