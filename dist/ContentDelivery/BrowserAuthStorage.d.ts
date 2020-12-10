import IAuthStorage from './IAuthStorage';
import { IOAuthSuccessResponse } from './IAuthService';
/**
 * Default implementation of the Authorization storage for usage
 * in a browser
 */
export declare class BrowserAuthStorage implements IAuthStorage {
    private _key;
    protected get storage(): Storage;
    constructor(key?: string);
    clearToken: () => boolean;
    storeToken: (token: IOAuthSuccessResponse) => boolean;
    hasToken: () => boolean;
    getToken: () => IOAuthSuccessResponse;
}
export default BrowserAuthStorage;
