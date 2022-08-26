export function namePropertyIsString(prop) {
    if (prop && prop.trim) {
        return true;
    }
    return false;
}
export function genericPropertyIsProperty(prop) {
    return (prop === null || prop === void 0 ? void 0 : prop.propertyDataType) && typeof prop.propertyDataType == 'string'
        ? true
        : false;
}
export class BaseIContent {
    constructor(baseData) {
        this._serverData = baseData;
    }
    get contentLink() {
        return this.getProperty('contentLink');
    }
    get name() {
        return this.getProperty('name');
    }
    get language() {
        return this.getProperty('language');
    }
    get existingLanguages() {
        return this.getProperty('existingLanguages');
    }
    get masterLanguage() {
        return this.getProperty('masterLanguage');
    }
    get contentType() {
        return this.getProperty('contentType');
    }
    get parentLink() {
        return this.getProperty('parentLink');
    }
    get routeSegment() {
        return this.getProperty('routeSegment');
    }
    get url() {
        return this.getProperty('url');
    }
    get changed() {
        return this.getProperty('changed');
    }
    get created() {
        return this.getProperty('created');
    }
    get startPublish() {
        return this.getProperty('startPublish');
    }
    get stopPublish() {
        return this.getProperty('stopPublish');
    }
    get saved() {
        return this.getProperty('saved');
    }
    get status() {
        return this.getProperty('status');
    }
    get typeName() {
        return this._typeName;
    }
    getTypeName() {
        return this._typeName;
    }
    getProperty(prop) {
        return this._serverData[prop];
    }
    getPropertyType(prop) {
        return this._propertyMap[prop.toString()];
    }
}
//# sourceMappingURL=IContent.js.map