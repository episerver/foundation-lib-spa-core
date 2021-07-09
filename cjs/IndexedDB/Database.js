"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const tslib_1 = require("tslib");
const Transaction_1 = require("./Transaction");
const Store_1 = require("./Store");
class Database {
    constructor(idb) {
        this._stores = [];
        this._storeCache = {};
        this._idb = idb;
    }
    get Raw() {
        return this._idb;
    }
    get Stores() {
        if (!this._stores.length) {
            for (const storeName of this._idb.objectStoreNames)
                this._stores.push(storeName);
        }
        return this._stores;
    }
    get Name() {
        return this.Raw.name;
    }
    get Version() {
        return this.Raw.version;
    }
    replaceStore(name, keyPath, autoIncrement, indices) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let success = yield this.dropStore(name);
            if (success)
                success = yield this.createStore(name, keyPath, autoIncrement, indices);
            return success;
        });
    }
    dropStore(name) {
        return new Promise((resolve, reject) => {
            if (this._storeCache[name])
                delete this._storeCache[name];
            if (this._idb.objectStoreNames.contains(name)) {
                try {
                    this._idb.deleteObjectStore(name);
                }
                catch (e) {
                    reject(e);
                    return;
                }
            }
            resolve(true);
        });
    }
    createStore(name, keyPath, autoIncrement, indices) {
        return new Promise((resolve, reject) => {
            const storeProps = { keyPath, autoIncrement };
            if (this._idb.objectStoreNames.contains(name)) {
                reject('Store already exists');
            }
            const store = this._idb.createObjectStore(name, storeProps);
            if (indices) {
                indices.forEach(i => {
                    const idxConfig = { unique: i.unique, multiEntry: i.multiEntry };
                    store.createIndex(i.name, i.keyPath, idxConfig);
                });
            }
            store.transaction.oncomplete = () => {
                this._stores = [];
                resolve(true);
            };
            store.transaction.onerror = e => reject(e);
            store.transaction.onabort = e => reject(e);
        });
    }
    startTransaction(storeNames, mode = "readonly") {
        return Transaction_1.default.create(this, storeNames, mode);
    }
    getStore(name) {
        if (!this._idb.objectStoreNames.contains(name))
            throw new Error(`Store ${name} not found in the database`);
        if (!this._storeCache[name])
            this._storeCache[name] = new Store_1.default(this, name);
        return this._storeCache[name];
    }
    hasStore(name) {
        return this._idb.objectStoreNames.contains(name);
    }
    toString() {
        return `${this.Name} (Version: ${this.Version})`;
    }
}
exports.Database = Database;
exports.default = Database;
//# sourceMappingURL=Database.js.map