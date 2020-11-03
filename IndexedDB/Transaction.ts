export class Transaction {
    protected _idbt : IDBTransaction;

    public get Raw() {
        return this._idbt;
    }

    public constructor (idbt : IDBTransaction)
    {
        this._idbt = idbt;
    }

    public hasStore(storeName: string) : boolean
    {
        return this._idbt.objectStoreNames.contains(storeName);
    }

    public getStoreNames() : string[]
    {
        const stores: string[] = [];
        for (const storeName of this._idbt.objectStoreNames) {
            stores.push(storeName);
        }
        return stores;
    }

    public getRawStore(name: string) : IDBObjectStore
    {
        return this._idbt.objectStore(name);
    }
}
export default Transaction