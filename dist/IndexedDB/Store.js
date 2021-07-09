import Transaction from './Transaction';
export class Store {
    constructor(database, storeName, rawStore) {
        //Validated parameter relation
        if (!database.hasStore(storeName))
            throw new Error(`The store ${storeName} does not exist in ${database.toString()}`);
        // Store values
        this._storeName = storeName;
        this._database = database;
        this._rawStore = rawStore;
    }
    get Raw() {
        if (this._rawStore)
            return this._rawStore;
        return this.getReadAccess().getRawStore(this._storeName);
    }
    get Write() {
        if (this._rawStore) {
            if (this._rawStore.transaction.mode === "readonly")
                throw new Error("Can't write to a transaction bound, read-only store");
            return this._rawStore;
        }
        return this.getWriteAccess().getRawStore(this._storeName);
    }
    getReadAccess() {
        return Transaction.create(this._database, this._storeName, "readonly");
    }
    getWriteAccess() {
        return Transaction.create(this._database, this._storeName, "readwrite");
    }
    indices() {
        return this._indices(this.Raw);
    }
    _indices(objectStore) {
        const indices = [];
        for (const idx of objectStore.indexNames) {
            indices.push(idx);
        }
        return indices;
    }
    async getViaIndex(index, id) {
        return new Promise((resolve, reject) => {
            if (this.indices().indexOf(index) < 0) {
                reject(`Requested index ${index} not present on store ${this._storeName}`);
            }
            const objectIndex = this.Raw.index(index);
            const search = objectIndex.get(id);
            search.onsuccess = () => resolve(search.result);
            search.onerror = (e) => reject(e);
        });
    }
    all() {
        return new Promise((resolve, reject) => {
            const items = [];
            const request = this.Raw.openCursor();
            request.onerror = e => reject(e);
            request.onsuccess = e => {
                const cursor = e.target.result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolve(items);
                }
            };
        });
    }
    get(id) {
        return new Promise((resolve, reject) => {
            const r = this.Raw.get(id);
            r.onsuccess = (e) => resolve(e.target.result);
            r.onerror = (e) => reject(e);
        });
    }
    put(data, id) {
        return new Promise((resolve, reject) => {
            const r = this.Write.put(data, id);
            r.onerror = (e) => reject(e);
            r.onsuccess = () => resolve(true);
        });
    }
    putAll(records) {
        return new Promise((resolve, reject) => {
            const s = this.Write;
            const promises = records.map(record => new Promise((rresolve, rreject) => {
                const r = s.put(record.data, record.id);
                r.onerror = e => rreject(e);
                r.onsuccess = () => rresolve(true);
            }));
            Promise.all(promises).then(() => resolve(true)).catch(e => reject(e));
        });
    }
    add(data, id) {
        return new Promise((resolve, reject) => {
            const r = this.Write.add(data, id);
            r.onerror = (e) => reject(e);
            r.onsuccess = () => resolve(true);
        });
    }
}
export default Store;
//# sourceMappingURL=Store.js.map