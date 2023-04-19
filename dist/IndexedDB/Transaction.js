export class Transaction {
    get Raw() {
        return this._idbt;
    }
    constructor(idbt) {
        this._idbt = idbt;
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
export default Transaction;
//# sourceMappingURL=Transaction.js.map