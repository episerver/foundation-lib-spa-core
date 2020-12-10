import IAuthStorage from './IAuthStorage';
import { IOAuthSuccessResponse } from './IAuthService';
export declare class LocalStorageAuthStorage implements IAuthStorage {
    private _key;
    protected get storage(): Storage;
    constructor(key?: string);
    clearToken: () => boolean;
    storeToken: (token: IOAuthSuccessResponse) => boolean;
    hasToken: () => boolean;
    getToken: () => IOAuthSuccessResponse;
}
export default LocalStorageAuthStorage;
