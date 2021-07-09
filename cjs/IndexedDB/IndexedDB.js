"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedDB = void 0;
const Database_1 = require("./Database");
const Transaction_1 = require("./Transaction");
class IndexedDB {
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
    get IsAvailable() { return this._isAvailable; }
    get IsOpen() { return this._idb ? true : false; }
    get Name() { return this._name; }
    get Version() { return this._version; }
    get Database() { return this._idb; }
    open() {
        if (!this.IsAvailable)
            return Promise.reject("IndexedDB is not available in this browser");
        if (!this._opening) {
            const me = this;
            this._opening = new Promise((resolve, reject) => {
                const idb = window.indexedDB.open(me._name, me._version);
                idb.onsuccess = () => idb.result ? resolve(new Database_1.default(idb.result)) : reject('Unable to open the database');
                idb.onerror = () => reject(idb.error);
                idb.onblocked = () => reject("Visitor blocked IndexedDB usage");
                idb.onupgradeneeded = (e) => {
                    if (!me._schemaUpgrade) {
                        reject("Schema upgrade required, but not provided");
                    }
                    else if (idb.result) {
                        me._idb = new Database_1.default(idb.result);
                        const t = new Transaction_1.default(e.currentTarget.transaction, me._idb);
                        const _idb = me._idb;
                        me._schemaUpgrade(_idb, t).then(x => x ? resolve(_idb) : reject('Unable to upgrade the database')).catch(x => reject(x));
                    }
                };
            });
        }
        return this._opening;
    }
}
exports.IndexedDB = IndexedDB;
exports.default = IndexedDB;
//# sourceMappingURL=IndexedDB.js.map