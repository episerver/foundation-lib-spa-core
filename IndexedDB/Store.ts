import Database from './Database';
import Transaction from './Transaction';

type IndexType = string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey;

export class Store<DataType = any>
{
    private _storeName : string;
    private _database : Database;
    private _rawStore ?: IDBObjectStore;

    public get Raw() : IDBObjectStore
    {
        if (this._rawStore) return this._rawStore;
        return this.getReadAccess().getRawStore(this._storeName);
    }

    public get Write() : IDBObjectStore
    {
        if (this._rawStore) {
            if (this._rawStore.transaction.mode === "readonly")
                throw new Error("Can't write to a transaction bound, read-only store");
            return this._rawStore;
        }
        return this.getWriteAccess().getRawStore(this._storeName);
    }

    private getReadAccess() : Transaction
    {
        return Transaction.create(this._database, this._storeName, "readonly");
    }

    private getWriteAccess() : Transaction
    {
        return Transaction.create(this._database, this._storeName, "readwrite");
    }

    public constructor(database : Database, storeName: string, rawStore ?: IDBObjectStore)
    {
        //Validated parameter relation
        if (!database.hasStore(storeName))
            throw new Error(`The store ${ storeName } does not exist in ${ database.toString() }`)

        // Store values
        this._storeName = storeName;
        this._database = database;
        this._rawStore = rawStore;
    }

    public indices() : string[] {
        return this._indices(this.Raw);
    }

    protected _indices(objectStore: IDBObjectStore) : string[]
    {
        const indices : string[] = [];
        for (const idx of objectStore.indexNames) {
            indices.push(idx);
        }
        return indices;
    }

    public async getViaIndex(index: string, id: IndexType) : Promise<DataType | null>
    {
        return new Promise<DataType | null>((resolve, reject) => {
            if (this.indices().indexOf(index) < 0) {
                reject(`Requested index ${ index } not present on store ${ this._storeName }`);
            }
            const objectIndex = this.Raw.index(index);
            const search = objectIndex.get(id);
            search.onsuccess = () => resolve(search.result);
            search.onerror = (e) => reject(e);
        });
    }

    public all() : Promise<DataType[]>
    {
        return new Promise<DataType[]>((resolve, reject) => {
            const items : DataType[] = [];
            const request = this.Raw.openCursor();
            request.onerror = e => reject(e);
            request.onsuccess = e => {
                const cursor : IDBCursorWithValue = (e.target as any).result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(items);
                }
            }
        });
    }

    public get(id : IndexType) : Promise<DataType>
    {
        return new Promise<DataType>((resolve, reject) => {
            const r = this.Raw.get(id);
            r.onsuccess = (e) => resolve((e.target as any).result as DataType)
            r.onerror = (e) => reject(e)
        });
    }

    public put(data : DataType, id ?: IndexType) : Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            const r = this.Write.put(data, id);
            r.onerror = (e) => reject(e);
            r.onsuccess = () => resolve(true);
        });
    }

    public putAll(records : { data: DataType, id ?: IndexType}[]) : Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            const s = this.Write;
            const promises : Promise<boolean>[] = records.map(record => new Promise<boolean>((rresolve, rreject) => {
                const r = s.put(record.data, record.id);
                r.onerror = e => rreject(e);
                r.onsuccess = () => rresolve(true);
            }));
            Promise.all(promises).then(() => resolve(true)).catch(e => reject(e));
        });
    }

    public add(data : DataType, id ?: IndexType) : Promise<any>
    {
        return new Promise<boolean>((resolve, reject) => {
            const r = this.Write.add(data, id);
            r.onerror = (e) => reject(e);
            r.onsuccess = () => resolve(true);
        });
    }
}
export default Store;