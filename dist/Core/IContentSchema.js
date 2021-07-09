export class IContentSchemaInfo {
    constructor(config) {
        this._schema = config.schema;
        if (!this._schema)
            this._loaded = import("app/Models/Content/schema.json" /* SchemaUrl */).then(imported => {
                if (imported.default)
                    this._schema = imported.default;
                else
                    this._schema = imported;
                return this;
            });
        else
            this._loaded = Promise.resolve(this);
    }
    get isReady() {
        return this._schema ? true : false;
    }
    get whenReady() {
        return this._loaded;
    }
    get types() {
        return this.listTypes();
    }
    listTypes() {
        const types = [];
        for (const key in this._schema || {})
            types.push(key);
        return types;
    }
    hasType(typeName) {
        if (typeof (typeName) !== 'string')
            throw new Error('typeName must be a string');
        return this._schema && this._schema[typeName] ? true : false;
    }
    getType(typeName) {
        if (typeof (typeName) !== 'string')
            throw new Error('typeName must be a string');
        return this._schema ? this._schema[typeName] : undefined;
    }
    getProperty(modelName, propertyName) {
        if (typeof (modelName) !== 'string')
            throw new Error('modelName must be a string');
        if (typeof (propertyName) !== 'string')
            throw new Error('propertyName must be a string');
        const type = this.getType(modelName);
        return type?.properties ? type.properties[propertyName] : undefined;
    }
    getPropertyInfo(data, propertyName) {
        const dataType = this.getTypeNameFromIContent(data);
        return dataType ? this.getProperty(dataType, propertyName) : undefined;
    }
    getTypeNameFromIContent(data) {
        const type = data?.contentType?.slice(-1)[0] || undefined;
        return type && this.hasType(type) ? type : undefined;
    }
}
//# sourceMappingURL=IContentSchema.js.map