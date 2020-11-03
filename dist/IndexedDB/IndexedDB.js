"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedDB = void 0;
const Database_1 = __importDefault(require("./Database"));
const Transaction_1 = __importDefault(require("./Transaction"));
class IndexedDB {
    constructor(name, version, schemaUpgrade, autoOpen) {
        this._opening = undefined;
        this._isAvailable = false;
        this._idb = undefined;
        this._schemaUpgrade = undefined;
        this._name = name;
        this._version = version;
        this._schemaUpgrade = schemaUpgrade;
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
                idb.onsuccess = e => idb.result ? resolve(new Database_1.default(idb.result)) : reject('Unable to open the database');
                idb.onerror = e => reject(idb.error);
                idb.onblocked = e => reject("Visitor blocked IndexedDB usage");
                idb.onupgradeneeded = (e) => {
                    if (!me._schemaUpgrade) {
                        reject("Schema upgrade required, but not provided");
                    }
                    else {
                        me._idb = idb.result ? new Database_1.default(idb.result) : undefined;
                        const t = new Transaction_1.default(e.currentTarget.transaction);
                        console.log(t);
                        if (me._idb) {
                            me._schemaUpgrade(me._idb, t).then(x => x ? resolve(me._idb) : reject('Unable to upgrade the database')).catch(x => reject(x));
                        }
                    }
                };
            });
        }
        return this._opening;
    }
}
exports.IndexedDB = IndexedDB;
exports.default = IndexedDB;
