import AppConfig from '../AppConfig';
import { IContent } from '../Models/IContent';

export type IContentSchemaProperty = {
    name: string,
    displayName: string,
    description: string,
    type: string
}
export type IContentSchemaModel = {
    id: string,
    name: string,
    displayName: string,
    description: string,
    properties: { 
        [ propertyName: string ]: IContentSchemaProperty
    }
}
export type IContentSchema = { 
    [ name: string ]: IContentSchemaModel
}

export const enum IContentSchemaConstants {
    SchemaUrl = 'app/Models/Content/schema.json'
}

export type IIContentSchemaInfo = {
    /**
     * Check to see if the object has finished loading and analyzing the
     * entire schema and the methods will return expected values.
     */
    readonly isReady : boolean

    /**
     * This promise will resolve once the object has finished loading and 
     * analyzing the entire schema. Wether this is at the end of the 
     * constructor or at a later stage depends on the implementation.
     */
    readonly whenReady : Promise<IIContentSchemaInfo>

    /**
     * List of all types in this instance, identical to the output of
     * listTypes()
     * 
     * @see this.listTypes
     */
    readonly types : string[]

    getType: (name: string) => IContentSchemaModel | undefined
    getTypeNameFromIContent: (data: IContent) => string | undefined
    hasType: (typeName: string) => boolean
    listTypes: () => string[]
    getProperty: (modelName: string, propertyName: string | number | symbol) => IContentSchemaProperty | undefined
    getPropertyInfo: (data: IContent, propertyName: string | number | symbol) => IContentSchemaProperty | undefined
}

export class IContentSchemaInfo implements IIContentSchemaInfo
{
    private _schema ?: IContentSchema;
    private _loaded : Promise<IContentSchemaInfo>;

    public get isReady() : boolean 
    {
        return this._schema ? true : false;
    }

    public get whenReady() : Promise<IContentSchemaInfo>
    {
        return this._loaded;
    }

    public get types() : string[]
    {
        return this.listTypes();
    }

    public constructor (config: AppConfig)
    {
        this._schema = config.schema;
        if (!this._schema)
            this._loaded = import(IContentSchemaConstants.SchemaUrl).then(imported => {
                if (imported.default)
                    this._schema = imported.default;
                else
                    this._schema = imported;
                return this;
            });
        else
            this._loaded = Promise.resolve(this);
    }

    public listTypes() : string[]
    {
        const types : string[] = [];
        for (const key in this._schema || {}) types.push(key);
        return types;
    }

    public hasType(typeName: string) : boolean
    {
        if (typeof(typeName) !== 'string')
            throw new Error('typeName must be a string');
        return this._schema && this._schema[typeName] ? true : false;
    }

    public getType(typeName: string) : IContentSchemaModel | undefined
    {
        if (typeof(typeName) !== 'string')
            throw new Error('typeName must be a string');
        return this._schema ? this._schema[typeName] : undefined;
    }

    public getProperty(modelName: string, propertyName: string | number | symbol) : IContentSchemaProperty | undefined
    {
        if (typeof(modelName) !== 'string')
            throw new Error('modelName must be a string');
        if (typeof(propertyName) !== 'string')
            throw new Error('propertyName must be a string');
        const type = this.getType(modelName);
        return type?.properties ? type.properties[propertyName as string] : undefined;
    }

    public getPropertyInfo(data: IContent, propertyName: string | number | symbol) : IContentSchemaProperty | undefined
    {
        const dataType = this.getTypeNameFromIContent(data);
        return dataType ? this.getProperty(dataType, propertyName) : undefined;
    }

    public getTypeNameFromIContent(data: IContent) : string | undefined
    {
        const type = data?.contentType?.slice(-1)[0] || undefined;
        return type && this.hasType(type) ? type : undefined;
    }
}

export default IIContentSchemaInfo;