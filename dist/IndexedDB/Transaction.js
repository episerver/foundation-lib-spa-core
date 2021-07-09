import Store from "./Store";
export class Transaction {
    constructor(idbt, db) {
        this._db = db;
        this._idbt = idbt;
        this._status = "open" /* Active */;
        this._idbt.addEventListener('abort', (() => this._status = "aborted" /* Aborted */).bind(this));
        this._idbt.addEventListener('complete', (() => this._status = "closed" /* Closed */).bind(this));
        this._idbt.addEventListener('error', (() => this._status = "error" /* Error */).bind(this));
    }
    get Raw() {
        return this._idbt;
    }
    get Status() {
        return this._status;
    }
    get Mode() {
        return this._idbt.mode;
    }
    get Database() {
        return this._db;
    }
    abort() {
        this._idbt.abort();
    }
    isActive() {
        return this._status === "open" /* Active */;
    }
    isReadOnly() {
        return this._idbt.mode == 'readonly';
    }
    isReadWrite() {
        return this._idbt.mode == 'readwrite';
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
    getStore(name) {
        return new Store(this._db, name, this.getRawStore(name));
    }
    static create(db, storeName, mode = "readonly") {
        return new Transaction(db.Raw.transaction(storeName, mode), db);
    }
}
export default Transaction;
//# sourceMappingURL=Transaction.js.map