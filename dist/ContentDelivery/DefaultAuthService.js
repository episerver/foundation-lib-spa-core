var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { IOAuthResponseIsSuccess } from './IAuthService';
import BrowserAuthStorage from './BrowserAuthStorage';
export class DefaultAuthService {
    constructor(api, storage) {
        this._storage = storage || new BrowserAuthStorage();
        this._api = api;
        api.TokenProvider = this;
    }
    getCurrentToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isAuthenticated().catch(() => false)) {
                const currentToken = this._storage.getToken();
                return currentToken ? { access_token: currentToken.access_token, token_type: currentToken.token_type, username: currentToken.username } : undefined;
            }
            return undefined;
        });
    }
    ping() {
        return this.isAuthenticated().then(x => { return; });
    }
    currentUser() {
        const token = this._storage.getToken();
        return Promise.resolve(token ? token.username : null);
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this._api.login(username, password);
            return IOAuthResponseIsSuccess(resp) && this._storage.storeToken(resp);
        });
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
        return this._api.refreshToken(token.refresh_token).then(r => IOAuthResponseIsSuccess(r) && this._storage.storeToken(r));
    }
}
export default DefaultAuthService;
