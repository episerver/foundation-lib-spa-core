var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Store {
    constructor(database, storeName, objectStore) {
        this._storeName = storeName;
        this._database = database;
        this._idbs = objectStore || this._database.startTransaction(this._storeName, "readonly").getRawStore(this._storeName);
    }
    get Raw() {
        return this._idbs;
    }
    indices() {
        const rawStore = this._idbs;
        return this._indices(rawStore);
    }
    _indices(objectStore) {
        const indices = [];
        for (const idx of objectStore.indexNames) {
            indices.push(idx);
        }
        return indices;
    }
    getViaIndex(index, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this._indices(this._idbs).indexOf(index) < 0) {
                    reject(`Requested index ${index} not present on store ${this._storeName}`);
                }
                const objectIndex = this._idbs.index(index);
                const search = objectIndex.get(id);
                search.onsuccess = () => resolve(search.result);
                search.onerror = (e) => reject(e);
            });
        });
    }
    all() {
        return new Promise((resolve, reject) => {
            const items = [];
            const request = this._idbs.openCursor();
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
            const t = this._database.startTransaction(this._storeName, "readonly");
            const s = t.Raw.objectStore(this._storeName);
            const r = s.get(id);
            r.onsuccess = (e) => resolve(e.target.result);
            r.onerror = (e) => reject(e);
        });
    }
    put(data, id) {
        return new Promise((resolve, reject) => {
            const t = this._database.startTransaction(this._storeName, "readwrite");
            const s = t.Raw.objectStore(this._storeName);
            const r = s.put(data, id);
            r.onerror = (e) => reject(e);
            r.onsuccess = () => resolve(true);
        });
    }
    putAll(records) {
        return new Promise((resolve, reject) => {
            const t = this._database.startTransaction(this._storeName, "readwrite");
            const s = t.getRawStore(this._storeName);
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
            const t = this._database.startTransaction(this._storeName, "readwrite");
            const s = t.Raw.objectStore(this._storeName);
            const r = s.add(data, id);
            r.onerror = (e) => reject(e);
            r.onsuccess = () => resolve(true);
        });
    }
}
export default Store;
//# sourceMappingURL=Store.js.map