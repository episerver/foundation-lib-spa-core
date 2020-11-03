import SchemaUpgrade from './SchemaUpgrade';
import Database from './Database';
import Transaction from './Transaction';

declare const window : Window;

export class IndexedDB
{
    private _opening : Promise<Database> | undefined = undefined;

    protected _name : string;
    protected _version : number;
    protected _isAvailable : boolean = false;
    protected _idb : Database|undefined = undefined;
    protected _schemaUpgrade : SchemaUpgrade|undefined = undefined;

    public get IsAvailable() : boolean { return this._isAvailable; }
    public get IsOpen() : boolean { return this._idb ? true : false; }
    public get Name() : string { return this._name; }
    public get Version() : number { return this._version; }
    public get Database() : Database|undefined { return this._idb; }

    constructor(name: string, version: number, schemaUpgrade?: SchemaUpgrade, autoOpen?: boolean) 
    {
        this._name = name;
        this._version = version;
        this._schemaUpgrade = schemaUpgrade;
        if (window.indexedDB) {
            this._isAvailable = true;
            if (autoOpen) this.open();
        }
    }

    public open() : Promise<Database>
    {
        if (!this.IsAvailable) return Promise.reject("IndexedDB is not available in this browser");
        if (!this._opening) {
            const me = this;
            this._opening = new Promise<Database>((resolve, reject) => {
                const idb = window.indexedDB.open(me._name, me._version);
                idb.onsuccess = e => idb.result ? resolve(new Database(idb.result)) : reject('Unable to open the database');
                idb.onerror = e => reject(idb.error);
                idb.onblocked = e => reject("Visitor blocked IndexedDB usage");
                idb.onupgradeneeded = (e: IDBVersionChangeEvent ) => {
                    if (!me._schemaUpgrade) {
                        reject("Schema upgrade required, but not provided")    
                    } else {
                        me._idb = idb.result ? new Database(idb.result) : undefined
                        const t = new Transaction((e.currentTarget as any).transaction);
                        console.log(t);
                        if (me._idb) {
                            me._schemaUpgrade(me._idb, t).then(x => x ? resolve(me._idb) : reject('Unable to upgrade the database')).catch(x => reject(x))
                        }
                    }
                }
            });
        }
        return this._opening;
    }
}
export default IndexedDB;