import IContentDeliveryAPI from './IContentDeliveryAPI';
import IAuthStorage from './IAuthStorage';
import IAuthService, { IOAuthResponseIsSuccess } from './IAuthService';
import IAuthTokenProvider, { IAuthToken } from './IAuthTokenProvider';
import BrowserAuthStorage from './BrowserAuthStorage';

export class DefaultAuthService implements IAuthService, IAuthTokenProvider {
    private _storage : IAuthStorage
    private _api : IContentDeliveryAPI

    constructor (api: IContentDeliveryAPI, storage ?: IAuthStorage) {
        this._storage = storage || new BrowserAuthStorage();
        this._api = api;
        api.TokenProvider = this;
    }

    public async getCurrentToken(): Promise<IAuthToken | undefined> {
        if (await this.isAuthenticated().catch(() => false)) {
            const currentToken = this._storage.getToken();
            return currentToken ? { access_token: currentToken.access_token, token_type: currentToken.token_type, username: currentToken.username } : undefined;
        }
        return undefined;
    }
    
    public ping() : Promise<void>
    {
        return this.isAuthenticated().then(x => { return ; })
    }
    
    public currentUser(): Promise<string | null> 
    {
        const token = this._storage.getToken();
        return Promise.resolve(token ? token.username : null);
    }

    public async login(username: string, password: string) : Promise<boolean>
    {
        const resp = await this._api.login(username, password);
        return IOAuthResponseIsSuccess(resp) && this._storage.storeToken(resp);
    }

    public logout() : Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            try {
                resolve(this._storage.clearToken());
            } catch (e) {
                reject(e);
            }
        });
    }

    public isAuthenticated() : Promise<boolean>
    {
        if (!this._api.OnLine) return Promise.resolve(this._storage.hasToken()); // If we're offline assume that we could refresh the token if desired
        const token = this._storage.getToken();
        if (!token) return Promise.resolve(false);
        if (Date.parse(token['.expires']) >= Date.now()) {
            return Promise.resolve(true);
        }
        return this._api.refreshToken(token.refresh_token).then(r => IOAuthResponseIsSuccess(r) && this._storage.storeToken(r)).catch(() => false);
    }
}
export default DefaultAuthService;