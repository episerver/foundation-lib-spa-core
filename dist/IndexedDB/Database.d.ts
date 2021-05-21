import Transaction from './Transaction';
import Store from './Store';
export declare class Database {
    protected _idb: IDBDatabase;
    protected _stores: string[];
    get Raw(): IDBDatabase;
    get Stores(): string[];
    constructor(idb: IDBDatabase);
    replaceStore(name: string, keyPath?: string, autoIncrement?: boolean, indices?: TableIndex[]): Promise<boolean>;
    dropStore(name: string): Promise<boolean>;
    createStore(name: string, keyPath?: string, autoIncrement?: boolean, indices?: TableIndex[]): Promise<boolean>;
    startTransaction(storeNames: string | string[], mode?: "readwrite" | "readonly"): Transaction;
    getStore<T = any>(name: string): Store<T>;
    hasStore(name: string): boolean;
}
export declare type TableIndex = {
    name: string;
    keyPath: string;
    unique?: boolean;
    multiEntry?: boolean;
};
export default Database;
