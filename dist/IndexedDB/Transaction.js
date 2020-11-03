"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
class Transaction {
    constructor(idbt) {
        this._idbt = idbt;
    }
    get Raw() {
        return this._idbt;
    }
    hasStore(storeName) {
        return this._idbt.objectStoreNames.contains(storeName);
    }
    getStoreNames() {
        const stores = [];
        for (const storeName of this._idbt.objectStoreNames) {
            stores.push(storeName);
        }
        return stores;
    }
    getRawStore(name) {
        return this._idbt.objectStore(name);
    }
}
exports.Transaction = Transaction;
exports.default = Transaction;
