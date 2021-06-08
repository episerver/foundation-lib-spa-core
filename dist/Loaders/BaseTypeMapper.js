/**
 * Base implementation for the TypeMapper, which is used to dynamically load
 * the content types needed to interact with the system.
 */
export class BaseTypeMapper {
    constructor() {
        this.cache = {};
        this.loading = {};
    }
    loadType(typeName) {
        if (!this.typeExists(typeName)) {
            throw new Error(`The type ${typeName} is not known within Episerver`);
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
    async createInstanceAsync(data) {
        const typeName = data.contentType.slice(-1)[0];
        const dataType = await this.loadType(typeName);
        return new dataType(data);
    }
    createInstance(data) {
        const typeName = data.contentType.slice(-1)[0];
        const dataType = this.getType(typeName);
        return new dataType(data);
    }
    getType(typeName, throwOnUnknown = true) {
        if (this.isCached(typeName)) {
            return this.cache[typeName];
        }
        if (throwOnUnknown) {
            throw new Error(`The type ${typeName} has not been cached!`);
        }
        return null;
    }
    isCached(typeName) {
        try {
            return this.cache[typeName] ? true : false;
        }
        catch (e) {
            // Ignore exception
        }
        return false; // An exception occured, so not pre-loaded
    }
    isLoading(typeName) {
        try {
            return this.loading[typeName] ? true : false;
        }
        catch (e) {
            // Ignore exception
        }
        return false; // An exception occured, so not pre-loaded
    }
    typeExists(typeName) {
        try {
            return this.map[typeName] ? true : false;
        }
        catch (e) {
            // Ignore exception
        }
        return false;
    }
}
export default BaseTypeMapper;
//# sourceMappingURL=BaseTypeMapper.js.map