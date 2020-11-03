"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTypeMapper = void 0;
/**
 * Base implementation for the TypeMapper, which is used to dynamically load
 * the content types needed to interact with the system.
 */
class BaseTypeMapper {
    constructor() {
        this.cache = {};
        this.loading = {};
    }
    loadType(typeName) {
        if (!this.typeExists(typeName)) {
            throw `The type ${typeName} is not known within Episerver`;
        }
        if (this.isCached(typeName)) {
            return Promise.resolve(this.getType(typeName, true));
        }
        if (!this.isLoading(typeName)) {
            const me = this;
            this.loading[typeName] = this.doLoadType(this.map[typeName]).then((t) => {
                me.cache[typeName] = t;
                delete me.loading[typeName];
                return t;
            });
        }
        return this.loading[typeName];
    }
    createInstanceAsync(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let typeName = data.contentType.slice(-1)[0];
            let dataType = yield this.loadType(typeName);
            return new dataType(data);
        });
    }
    createInstance(data) {
        let typeName = data.contentType.slice(-1)[0];
        let dataType = this.getType(typeName);
        return new dataType(data);
    }
    getType(typeName, throwOnUnknown = true) {
        if (this.isCached(typeName)) {
            return this.cache[typeName];
        }
        if (throwOnUnknown) {
            throw `The type ${typeName} has not been cached!`;
        }
        return null;
    }
    isCached(typeName) {
        try {
            return this.cache[typeName] ? true : false;
        }
        catch (e) {
            //Ignore exception
        }
        return false; //An exception occured, so not pre-loaded
    }
    isLoading(typeName) {
        try {
            return this.loading[typeName] ? true : false;
        }
        catch (e) {
            //Ignore exception
        }
        return false; //An exception occured, so not pre-loaded
    }
    typeExists(typeName) {
        try {
            return this.map[typeName] ? true : false;
        }
        catch (e) {
            //Ignore exception
        }
        return false;
    }
}
exports.BaseTypeMapper = BaseTypeMapper;
exports.default = BaseTypeMapper;
