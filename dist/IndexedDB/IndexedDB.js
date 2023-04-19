import Database from './Database';
import Transaction from './Transaction';
export class IndexedDB {
    get IsAvailable() { return this._isAvailable; }
    get IsOpen() { return this._idb ? true : false; }
    get Name() { return this._name; }
    get Version() { return this._version; }
    get Database() { return this._idb; }
    constructor(name, version, schemaUpgrade, autoOpen, debug = false) {
        this._opening = undefined;
        this._isAvailable = false;
        this._idb = undefined;
        this._schemaUpgrade = undefined;
        this._debug = false;
        this._name = name;
        this._version = version;
        this._schemaUpgrade = schemaUpgrade;
        this._debug = debug;
        if (window.indexedDB) {
            this._isAvailable = true;
            if (autoOpen)
                this.open();
        }
    }
    open() {
        if (!this.IsAvailable)
            return Promise.reject("IndexedDB is not available in this browser");
        if (!this._opening) {
            const me = this;
            this._opening = new Promise((resolve, reject) => {
                const idb = window.indexedDB.open(me._name, me._version);
                idb.onsuccess = e => idb.result ? resolve(new Database(idb.result)) : reject('Unable to open the database');
                idb.onerror = e => reject(idb.error);
                idb.onblocked = e => reject("Visitor blocked IndexedDB usage");
                idb.onupgradeneeded = (e) => {
                    if (!me._schemaUpgrade) {
                        reject("Schema upgrade required, but not provided");
                    }
                    else {
                        me._idb = idb.result ? new Database(idb.result) : undefined;
                        const t = new Transaction(e.currentTarget.transaction);
                        if (me._idb) {
                            const _idb = me._idb;
                            me._schemaUpgrade(_idb, t).then(x => x ? resolve(_idb) : reject('Unable to upgrade the database')).catch(x => reject(x));
                        }
                    }
                };
            });
        }
        return this._opening;
    }
}
export default IndexedDB;
//# sourceMappingURL=IndexedDB.js.map