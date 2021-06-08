"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAuthService = void 0;
const tslib_1 = require("tslib");
const IAuthService_1 = require("./IAuthService");
const BrowserAuthStorage_1 = require("./BrowserAuthStorage");
const eventemitter3_1 = require("eventemitter3");
class DefaultAuthServiceCls extends eventemitter3_1.default {
    constructor(api, storage) {
        super();
        this._storage = storage || new BrowserAuthStorage_1.default();
        this._api = api;
        api.TokenProvider = this;
    }
    getCurrentToken() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const resp = yield this._api.login(username, password);
            return IAuthService_1.IOAuthResponseIsSuccess(resp) && this._storage.storeToken(resp);
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
        return this._api.refreshToken(token.refresh_token).then(r => IAuthService_1.IOAuthResponseIsSuccess(r) && this._storage.storeToken(r)).catch(() => false).then(auth => {
            if (!auth)
                this._storage.clearToken();
            return auth;
        });
    }
}
// Export fully type-checked for both static and instance type
exports.DefaultAuthService = DefaultAuthServiceCls;
exports.default = exports.DefaultAuthService;
//# sourceMappingURL=DefaultAuthService.js.map