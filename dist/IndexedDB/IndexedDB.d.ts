import SchemaUpgrade from './SchemaUpgrade';
import Database from './Database';
export declare class IndexedDB {
    private _opening;
    protected _name: string;
    protected _version: number;
    protected _isAvailable: boolean;
    protected _idb: Database | undefined;
    protected _schemaUpgrade: SchemaUpgrade | undefined;
    get IsAvailable(): boolean;
    get IsOpen(): boolean;
    get Name(): string;
    get Version(): number;
    get Database(): Database | undefined;
    constructor(name: string, version: number, schemaUpgrade?: SchemaUpgrade, autoOpen?: boolean);
    open(): Promise<Database>;
}
export default IndexedDB;
