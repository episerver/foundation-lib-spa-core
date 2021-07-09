import Transaction from './Transaction';
import Store from './Store';

export class Database {
    protected _idb : IDBDatabase
    protected _stores : string[] = [];
    private _storeCache : { [ key: string ]: Store } = {}

    public get Raw() : IDBDatabase 
    {
        return this._idb;
    }

    public get Stores() : string[]
    {
        if (!this._stores.length) {
            for (const storeName of this._idb.objectStoreNames) this._stores.push(storeName);
        }
        return this._stores;
    }

    public get Name() : string {
        return this.Raw.name;
    }

    public get Version() : number {
        return this.Raw.version;
    }

    public constructor(idb : IDBDatabase)
    {
        this._idb = idb;
    }

    public async replaceStore(name: string, keyPath?: string, autoIncrement?: boolean, indices?: TableIndex[]) : Promise<boolean>
    {
        let success = await this.dropStore(name);
        if (success) 
            success = await this.createStore(name, keyPath, autoIncrement, indices);
        return success;
    }

    public dropStore(name: string) : Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            if (this._storeCache[name]) delete this._storeCache[name];
            if (this._idb.objectStoreNames.contains(name)) {
                try {
                    this._idb.deleteObjectStore(name);
                } catch (e) {
                    reject(e);
                    return;
                }
            }
            resolve(true);
        })
    }

    public createStore(name: string, keyPath?: string, autoIncrement?: boolean, indices?: TableIndex[]) : Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            const storeProps : IDBObjectStoreParameters = { keyPath, autoIncrement }
            if (this._idb.objectStoreNames.contains(name)) {
                reject('Store already exists');
            }
            const store = this._idb.createObjectStore(name, storeProps);
            
            if (indices) {
                indices.forEach(i => {
                    const idxConfig : IDBIndexParameters = { unique: i.unique, multiEntry: i.multiEntry };
                    store.createIndex(i.name, i.keyPath, idxConfig);
                })
            }
            
            store.transaction.oncomplete = () => {
                this._stores = [];
                resolve(true);
            }
            store.transaction.onerror = e => reject(e);
            store.transaction.onabort = e => reject(e);
        })
    }

    public startTransaction(storeNames: string | string[], mode : "readwrite"|"readonly" = "readonly") : Transaction
    {
        return Transaction.create(this, storeNames, mode);
    }

    public getStore<T = any>(name : string) : Store<T>
    {
        if (!this._idb.objectStoreNames.contains(name)) throw new Error(`Store ${ name } not found in the database`);
        if (!this._storeCache[name])
            this._storeCache[name] = new Store<T>(this, name);
        return this._storeCache[name];
    }

    public hasStore(name: string) : boolean
    {
        return this._idb.objectStoreNames.contains(name);
    }

    public toString() : string
    {
        return `${ this.Name } (Version: ${ this.Version })`;
    }
}

export type TableIndex = {
    name: string,
    keyPath: string,
    unique?: boolean,
    multiEntry?: boolean
}
export default Database;