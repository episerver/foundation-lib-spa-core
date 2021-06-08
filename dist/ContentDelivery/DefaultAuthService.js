import { IOAuthResponseIsSuccess } from './IAuthService';
import BrowserAuthStorage from './BrowserAuthStorage';
import EventEmitter from 'eventemitter3';
class DefaultAuthServiceCls extends EventEmitter {
    constructor(api, storage) {
        super();
        this._storage = storage || new BrowserAuthStorage();
        this._api = api;
        api.TokenProvider = this;
    }
    async getCurrentToken() {
        if (await this.isAuthenticated().catch(() => false)) {
            const currentToken = this._storage.getToken();
            return currentToken ? { access_token: currentToken.access_token, token_type: currentToken.token_type, username: currentToken.username } : undefined;
        }
        return undefined;
    }
    ping() {
        return this.isAuthenticated().then(x => { return; });
    }
    currentUser() {
        const token = this._storage.getToken();
        return Promise.resolve(token ? token.username : null);
    }
    async login(username, password) {
        const resp = await this._api.login(username, password);
        return IOAuthResponseIsSuccess(resp) && this._storage.storeToken(resp);
    }
    logout() {
        return new Promise((resolve, reject) => {
            try {
                resolve(this._storage.clearToken());
            }
            catch (e) {
                reject(e);
            }
        });
    }
    isAuthenticated() {
        if (!this._api.OnLine)
            return Promise.resolve(this._storage.hasToken()); // If we're offline assume that we could refresh the token if desired
        const token = this._storage.getToken();
        if (!token)
            return Promise.resolve(false);
        if (Date.parse(token['.expires']) >= Date.now()) {
            return Promise.resolve(true);
        }
        return this._api.refreshToken(token.refresh_token).then(r => IOAuthResponseIsSuccess(r) && this._storage.storeToken(r)).catch(() => false).then(auth => {
            if (!auth)
                this._storage.clearToken();
            return auth;
        });
    }
}
// Export fully type-checked for both static and instance type
export const DefaultAuthService = DefaultAuthServiceCls;
export default DefaultAuthService;
//# sourceMappingURL=DefaultAuthService.js.map