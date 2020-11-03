"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const Transaction_1 = __importDefault(require("./Transaction"));
const Store_1 = __importDefault(require("./Store"));
class Database {
    constructor(idb) {
        this._stores = [];
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
        return new Transaction_1.default(this._idb.transaction(storeNames, mode));
    }
    getStore(name) {
        if (!this._idb.objectStoreNames.contains(name))
            throw new Error(`Store ${name} not found in the database`);
        return new Store_1.default(this, name);
    }
    hasStore(name) {
        return this._idb.objectStoreNames.contains(name);
    }
}
exports.Database = Database;
exports.default = Database;
