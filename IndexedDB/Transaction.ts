import Database from "./Database";
import Store from "./Store";

export const enum TransactionStatus {
    Active = "open",
    Closed = "closed",
    Aborted = "aborted",
    Error = "error"
}

export class Transaction {
    protected _idbt : IDBTransaction;
    protected _status : TransactionStatus;
    protected _db : Database;

    public get Raw() : IDBTransaction {
        return this._idbt;
    }

    public get Status() : TransactionStatus
    {
        return this._status;
    }

    public get Mode() : IDBTransactionMode
    {
        return this._idbt.mode;
    }

    public get Database() : Database
    {
        return this._db;
    }

    public constructor (idbt : IDBTransaction, db: Database)
    {
        this._db = db;
        this._idbt = idbt;
        this._status = TransactionStatus.Active;
        this._idbt.addEventListener('abort', (() => this._status = TransactionStatus.Aborted).bind(this));
        this._idbt.addEventListener('complete', (() => this._status = TransactionStatus.Closed).bind(this));
        this._idbt.addEventListener('error', (() => this._status = TransactionStatus.Error).bind(this));
    }

    public abort() : void
    {
        this._idbt.abort();
    }

    public isActive() : boolean
    {
        return this._status === TransactionStatus.Active;
    }

    public isReadOnly() : boolean
    {
        return this._idbt.mode == 'readonly';
    }

    public isReadWrite() : boolean
    {
        return this._idbt.mode == 'readwrite';
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

    public getStore<T>(name: string) : Store<T>
    {
        return new Store(this._db, name, this.getRawStore(name));
    }

    public static create(db: Database, storeName: string | string[], mode : IDBTransactionMode = "readonly") : Transaction
    {
        return new Transaction(db.Raw.transaction(storeName, mode), db);
    }
}
export default Transaction