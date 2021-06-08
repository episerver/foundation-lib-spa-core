import Database from './Database';
declare type IndexType = string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey;
export declare class Store<DataType = any> {
    private _storeName;
    private _database;
    private _idbs;
    get Raw(): IDBObjectStore;
    constructor(database: Database, storeName: string, objectStore?: IDBObjectStore);
    indices(): string[];
    protected _indices(objectStore: IDBObjectStore): string[];
    getViaIndex(index: string, id: IndexType): Promise<DataType | null>;
    all(): Promise<DataType[]>;
    get(id: IndexType): Promise<DataType>;
    put(data: DataType, id?: IndexType): Promise<boolean>;
    putAll(records: {
        data: DataType;
        id?: IndexType;
    }[]): Promise<boolean>;
    add(data: DataType, id?: IndexType): Promise<any>;
}
export default Store;
