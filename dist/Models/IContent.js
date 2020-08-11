"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIContent = exports.namePropertyIsString = void 0;
function namePropertyIsString(prop) {
    if (prop && prop.trim) {
        return true;
    }
    return false;
}
exports.namePropertyIsString = namePropertyIsString;
var BaseIContent = /** @class */ (function () {
    function BaseIContent(baseData) {
        this._serverData = baseData;
    }
    Object.defineProperty(BaseIContent.prototype, "contentLink", {
        get: function () { return this.getProperty("contentLink"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "name", {
        get: function () { return this.getProperty("name"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "language", {
        get: function () { return this.getProperty("language"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "existingLanguages", {
        get: function () { return this.getProperty("existingLanguages"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "masterLanguage", {
        get: function () { return this.getProperty("masterLanguage"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "contentType", {
        get: function () { return this.getProperty("contentType"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "parentLink", {
        get: function () { return this.getProperty("parentLink"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "routeSegment", {
        get: function () { return this.getProperty("routeSegment"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "url", {
        get: function () { return this.getProperty("url"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "changed", {
        get: function () { return this.getProperty("changed"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "created", {
        get: function () { return this.getProperty("created"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "startPublish", {
        get: function () { return this.getProperty("startPublish"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "stopPublish", {
        get: function () { return this.getProperty("stopPublish"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "saved", {
        get: function () { return this.getProperty("saved"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "status", {
        get: function () { return this.getProperty("status"); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseIContent.prototype, "typeName", {
        get: function () {
            return this._typeName;
        },
        enumerable: false,
        configurable: true
    });
    BaseIContent.prototype.getTypeName = function () {
        return this._typeName;
    };
    BaseIContent.prototype.getProperty = function (prop) {
        return this._serverData[prop];
    };
    BaseIContent.prototype.getPropertyType = function (prop) {
        return this._propertyMap[prop.toString()];
    };
    return BaseIContent;
}());
exports.BaseIContent = BaseIContent;
