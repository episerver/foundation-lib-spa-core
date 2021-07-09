import Database from "./Database";
import Store from "./Store";
export declare const enum TransactionStatus {
    Active = "open",
    Closed = "closed",
    Aborted = "aborted",
    Error = "error"
}
export declare class Transaction {
    protected _idbt: IDBTransaction;
    protected _status: TransactionStatus;
    protected _db: Database;
    get Raw(): IDBTransaction;
    get Status(): TransactionStatus;
    get Mode(): IDBTransactionMode;
    get Database(): Database;
    constructor(idbt: IDBTransaction, db: Database);
    abort(): void;
    isActive(): boolean;
    isReadOnly(): boolean;
    isReadWrite(): boolean;
    hasStore(storeName: string): boolean;
    getStoreNames(): string[];
    getRawStore(name: string): IDBObjectStore;
    getStore<T>(name: string): Store<T>;
    static create(db: Database, storeName: string | string[], mode?: IDBTransactionMode): Transaction;
}
export default Transaction;
