import IContent, { IContentType, BaseIContent } from '../Models/IContent';
/**
 * Type info descriptor for a specific model within Episerver
 */
export interface TypeMapperTypeInfo {
    dataModel: string;
    instanceModel: string;
}
/**
 * Static interface for the typemapper, so it can be included
 * in the configuration
 */
export declare type TypeMapperType = new () => BaseTypeMapper;
/**
 * Base implementation for the TypeMapper, which is used to dynamically load
 * the content types needed to interact with the system.
 */
export declare abstract class BaseTypeMapper {
    private cache;
    private loading;
    /**
     * The list of types registered within Episerver and the configuration
     * of how they map to object types in TypeScript/JavaScript
     */
    protected abstract map: {
        [type: string]: TypeMapperTypeInfo;
    };
    /**
     * Dynamically load a content type into memory
     *
     * @param typeInfo The mapping information of the type to load
     */
    protected abstract doLoadType(typeInfo: TypeMapperTypeInfo): Promise<IContentType>;
    loadType(typeName: string): Promise<IContentType>;
    createInstanceAsync<T extends IContent>(data: T): Promise<BaseIContent<T>>;
    createInstance<T extends IContent>(data: T): BaseIContent<T>;
    getType(typeName: string, throwOnUnknown?: boolean): IContentType | null;
    isCached(typeName: string): boolean;
    isLoading(typeName: string): boolean;
    typeExists(typeName: string): boolean;
}
export default BaseTypeMapper;
