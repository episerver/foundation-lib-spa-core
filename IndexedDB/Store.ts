import Database from './Database';
import Transaction from './Transaction';

type IndexType = string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey;

export class Store<DataType = any>
{
    private _storeName : string;
    private _database : Database;
    private _idbs : IDBObjectStore;

    public get Raw() : IDBObjectStore
    {
        return this._idbs;
    }

    public constructor(database : Database, storeName: string, objectStore ?: IDBObjectStore)
    {
        this._storeName = storeName;
        this._database = database;
        this._idbs = objectStore || this._database.startTransaction(this._storeName, "readonly").getRawStore(this._storeName);
    }

    public indices() : string[] {
        const rawStore = this._idbs;
        return this._indices(rawStore);
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
            if (this._indices(this._idbs).indexOf(index) < 0) {
                reject(`Requested index ${ index } not present on store ${ this._storeName }`);
            }
            const objectIndex = this._idbs.index(index);
            const search = objectIndex.get(id);
            search.onsuccess = () => resolve(search.result);
            search.onerror = (e) => reject(e);
        });
    }

    public all() : Promise<DataType[]>
    {
        return new Promise<DataType[]>((resolve, reject) => {
            const items : DataType[] = [];
            const request = this._idbs.openCursor();
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
            const t = this._database.startTransaction(this._storeName, "readonly");
            const s = t.Raw.objectStore(this._storeName);
            const r = s.get(id);
            r.onsuccess = (e) => resolve((e.target as any).result as DataType)
            r.onerror = (e) => reject(e)
        });
    }

    public put(data : DataType, id ?: IndexType) : Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            const t = this._database.startTransaction(this._storeName, "readwrite");
            const s = t.Raw.objectStore(this._storeName);
            const r = s.put(data, id);
            r.onerror = (e) => reject(e);
            r.onsuccess = () => resolve(true);
        });
    }

    public putAll(records : { data: DataType, id ?: IndexType}[]) : Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) => {
            const t = this._database.startTransaction(this._storeName, "readwrite");
            const s = t.getRawStore(this._storeName);
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
            const t = this._database.startTransaction(this._storeName, "readwrite");
            const s = t.Raw.objectStore(this._storeName);
            const r = s.add(data, id);
            r.onerror = (e) => reject(e);
            r.onsuccess = () => resolve(true);
        });
    }
}
export default Store;