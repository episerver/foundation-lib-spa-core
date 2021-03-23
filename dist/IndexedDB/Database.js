var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Transaction from './Transaction';
import Store from './Store';
export class Database {
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
    replaceStore(name, keyPath, autoIncrement, indices) {
        return __awaiter(this, void 0, void 0, function* () {
            let success = yield this.dropStore(name);
            if (success)
                success = yield this.createStore(name, keyPath, autoIncrement, indices);
            return success;
        });
    }
    dropStore(name) {
        return new Promise((resolve, reject) => {
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
        return new Transaction(this._idb.transaction(storeNames, mode));
    }
    getStore(name) {
        if (!this._idb.objectStoreNames.contains(name))
            throw new Error(`Store ${name} not found in the database`);
        return new Store(this, name);
    }
    hasStore(name) {
        return this._idb.objectStoreNames.contains(name);
    }
}
export default Database;
//# sourceMappingURL=Database.js.map