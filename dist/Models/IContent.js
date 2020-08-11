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
        Object.assign(this, baseData);
    }
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
        var data = this;
        return data[prop];
    };
    BaseIContent.prototype.getPropertyType = function (prop) {
        return this._propertyMap[prop.toString()];
    };
    return BaseIContent;
}());
exports.BaseIContent = BaseIContent;
