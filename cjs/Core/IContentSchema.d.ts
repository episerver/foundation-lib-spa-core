import AppConfig from '../AppConfig';
import { IContent } from '../Models/IContent';
export declare type IContentSchemaProperty = {
    name: string;
    displayName: string;
    description: string;
    type: string;
};
export declare type IContentSchemaModel = {
    id: string;
    name: string;
    displayName: string;
    description: string;
    properties: {
        [propertyName: string]: IContentSchemaProperty;
    };
};
export declare type IContentSchema = {
    [name: string]: IContentSchemaModel;
};
export declare const enum IContentSchemaConstants {
    SchemaUrl = "app/Models/Content/schema.json"
}
export declare type IIContentSchemaInfo = {
    /**
     * Check to see if the object has finished loading and analyzing the
     * entire schema and the methods will return expected values.
     */
    readonly isReady: boolean;
    /**
     * This promise will resolve once the object has finished loading and
     * analyzing the entire schema. Wether this is at the end of the
     * constructor or at a later stage depends on the implementation.
     */
    readonly whenReady: Promise<IIContentSchemaInfo>;
    /**
     * List of all types in this instance, identical to the output of
     * listTypes()
     *
     * @see this.listTypes
     */
    readonly types: string[];
    getType: (name: string) => IContentSchemaModel | undefined;
    getTypeNameFromIContent: (data: IContent) => string | undefined;
    hasType: (typeName: string) => boolean;
    listTypes: () => string[];
    getProperty: (modelName: string, propertyName: string | number | symbol) => IContentSchemaProperty | undefined;
    getPropertyInfo: (data: IContent, propertyName: string | number | symbol) => IContentSchemaProperty | undefined;
};
export declare class IContentSchemaInfo implements IIContentSchemaInfo {
    private _schema?;
    private _loaded;
    get isReady(): boolean;
    get whenReady(): Promise<IContentSchemaInfo>;
    get types(): string[];
    constructor(config: AppConfig);
    listTypes(): string[];
    hasType(typeName: string): boolean;
    getType(typeName: string): IContentSchemaModel | undefined;
    getProperty(modelName: string, propertyName: string | number | symbol): IContentSchemaProperty | undefined;
    getPropertyInfo(data: IContent, propertyName: string | number | symbol): IContentSchemaProperty | undefined;
    getTypeNameFromIContent(data: IContent): string | undefined;
}
export default IIContentSchemaInfo;
