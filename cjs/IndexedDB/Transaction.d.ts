export declare class Transaction {
    protected _idbt: IDBTransaction;
    get Raw(): IDBTransaction;
    constructor(idbt: IDBTransaction);
    hasStore(storeName: string): boolean;
    getStoreNames(): string[];
    getRawStore(name: string): IDBObjectStore;
}
export default Transaction;
