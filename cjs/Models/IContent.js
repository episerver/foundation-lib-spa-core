"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIContent = exports.genericPropertyIsProperty = exports.namePropertyIsString = void 0;
function namePropertyIsString(prop) {
    if (prop && prop.trim) {
        return true;
    }
    return false;
}
exports.namePropertyIsString = namePropertyIsString;
function genericPropertyIsProperty(prop) {
    var _a;
    return ((_a = prop) === null || _a === void 0 ? void 0 : _a.propertyDataType) && typeof (prop.propertyDataType) == 'string' ? true : false;
}
exports.genericPropertyIsProperty = genericPropertyIsProperty;
class BaseIContent {
    constructor(baseData) {
        this._serverData = baseData;
    }
    get contentLink() { return this.getProperty("contentLink"); }
    get name() { return this.getProperty("name"); }
    get language() { return this.getProperty("language"); }
    get existingLanguages() { return this.getProperty("existingLanguages"); }
    get masterLanguage() { return this.getProperty("masterLanguage"); }
    get contentType() { return this.getProperty("contentType"); }
    get parentLink() { return this.getProperty("parentLink"); }
    get routeSegment() { return this.getProperty("routeSegment"); }
    get url() { return this.getProperty("url"); }
    get changed() { return this.getProperty("changed"); }
    get created() { return this.getProperty("created"); }
    get startPublish() { return this.getProperty("startPublish"); }
    get stopPublish() { return this.getProperty("stopPublish"); }
    get saved() { return this.getProperty("saved"); }
    get status() { return this.getProperty("status"); }
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
exports.BaseIContent = BaseIContent;
//# sourceMappingURL=IContent.js.map