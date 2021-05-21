/**
 * Default implementation of the Authorization storage for usage
 * in a browser
 */
export class BrowserAuthStorage {
    constructor(key = "episerver_id") {
        this.clearToken = () => {
            this.storage.removeItem(this._key);
            return this.storage.getItem(this._key) ? false : true;
        };
        this.storeToken = (token) => {
            this.storage.setItem(this._key, btoa(JSON.stringify(token)));
            return true;
        };
        this.hasToken = () => {
            return this.storage.getItem(this._key) ? true : false;
        };
        this.getToken = () => {
            const stringToken = this.storage.getItem(this._key);
            if (!stringToken)
                return null;
            return JSON.parse(atob(stringToken));
        };
        this._key = key;
    }
    get storage() {
        if (!(window === null || window === void 0 ? void 0 : window.localStorage)) {
            throw new Error('LocalAuthStorage must be used in a browser supporting LocalStorage');
        }
        return window.localStorage;
    }
}
export default BrowserAuthStorage;
//# sourceMappingURL=BrowserAuthStorage.js.map