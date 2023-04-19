import IExecutionContext from '../Core/IExecutionContext';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import { ContentReference } from '../Models/ContentLink';
import IConfig from '../AppConfig';
export type IServerContextAccessor = {
    /**
     * Variable indicating if the accessor is ready for use
     */
    readonly IsAvailable: boolean;
    /**
     * Variable indicating if we're running on the server
     */
    readonly IsServerSideRendering: boolean;
    /**
     * The current content as determined by the server
     */
    readonly IContent: IContent | null;
    /**
     * The current website as determined by the server
     */
    readonly Website: Website | null;
    /**
     * The current path as determined by the server
     */
    readonly Path: string | null;
    /**
     * A list of IContent objects provided by the server for rendering
     */
    readonly Contents: IContent[];
    /**
     * Get an IContent for a path on the current website, null if not found
     *
     * @param path The path to resolve the IContent for
     */
    getIContentByPath<T extends IContent = IContent>(path: string): T | null;
    /**
     * Get an IContent for a path on the current website, null if not found
     *
     * @param path The path to resolve the IContent for
     */
    getIContent<T extends IContent = IContent>(ref: ContentReference): T | null;
    /**
     * Add a custom property to the server side rendering context, if this is done
     * while server side rendering, the property will be available on the client as
     * well.
     *
     * @param propname The name of the property
     * @param value The value to set, this should be serializable by Newtonsoft.Json
     * @returns Whether setting the value succeeded.
     */
    setProp(propname: string, value: unknown): boolean;
    /**
     * Retrieve a custom property from the server side rendering context
     *
     * @param propname The name of the custom property
     * @returns The current property value, or undefined if the property isn't set
     */
    getProp<T = unknown>(propname: string): T | undefined;
};
export type IStaticServerContextAccessor = {
    new (executionContext: Readonly<IExecutionContext>, config: Readonly<IConfig>): IServerContextAccessor;
    displayName?: string;
};
type FactoryMethod = {
    sortOrder: number;
    accessor: IStaticServerContextAccessor;
    test: (execContext: IExecutionContext, config: IConfig) => boolean;
};
export declare class Factory {
    static readonly factories: FactoryMethod[];
    static create(execContext: IExecutionContext, config: IConfig): IServerContextAccessor;
}
export default IServerContextAccessor;
