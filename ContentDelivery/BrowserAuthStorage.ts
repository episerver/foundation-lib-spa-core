import IAuthStorage from './IAuthStorage';
import { IOAuthSuccessResponse } from './IAuthService';

/**
 * Default implementation of the Authorization storage for usage
 * in a browser
 */
export class BrowserAuthStorage implements IAuthStorage
{
    private _key : string;

    protected get storage() : Storage {
        if (!window?.localStorage) {
            throw new Error('LocalAuthStorage must be used in a browser supporting LocalStorage');
        }
        return window.localStorage;
    }

    public constructor (key: string = "episerver_id")
    {
        this._key = key;
    }  

    public clearToken: () => boolean = () => {
        this.storage.removeItem(this._key);
        return this.storage.getItem(this._key) ? false : true;
    }

    public storeToken: (token: IOAuthSuccessResponse) => boolean = (token) => {
        this.storage.setItem(this._key, btoa(JSON.stringify(token)));
        return true;
    }

    public hasToken: () => boolean = () => {
        return this.storage.getItem(this._key) ? true : false;
    }

    public getToken: () => IOAuthSuccessResponse = () => {
        const stringToken = this.storage.getItem(this._key);
        if (!stringToken) return null;
        return JSON.parse(atob(stringToken));
    }
}
export default BrowserAuthStorage;