import { DefaultServerContext } from './ServerContext';
import IServerContextAccessor from './IServerContextAccessor';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import { ContentReference } from '../Models/ContentLink';
import IExecutionContext from '../Core/IExecutionContext';
import IAppConfig from '../AppConfig';
export interface ServerSideEnumerator<TData> {
    GetEnumerator: () => void;
    Map: <TOut>(func: (item: TData) => TOut) => TOut[];
    forEach: (func: (item: TData) => void) => void;
}
export declare type ServerSideAPI = {
    GetService: <T = unknown>(name: string) => T;
    MakeSafe: <T = unknown>(object: unknown) => T;
    LoadIContent: <T extends IContent = IContent>(complexReference: string) => T | null;
};
export declare class DotNetServerContextAccessor implements IServerContextAccessor {
    private readonly _context;
    private readonly _config;
    constructor(execContext: Readonly<IExecutionContext>, config: Readonly<IAppConfig>);
    get IsAvailable(): boolean;
    readonly IsServerSideRendering: boolean;
    /**
     *
     */
    get IContent(): IContent | null;
    get Website(): Website | null;
    get Path(): string | null;
    get Contents(): IContent[];
    /**
     * Get an IContent for a path on the current website, null if not found
     *
     * @param path The path to resolve the IContent for
     */
    getIContentByPath<T extends IContent = IContent>(path: string): T | null;
    getIContent<T extends IContent = IContent>(ref: ContentReference): T | null;
    /**
     * This is part of the Server Side Rendering JavaScript interoperability. This method
     * will always throw an exception when there's no server side rendering process. Otherwise
     * it will return the object as returned by the Episerver ServiceLocator.
     *
     * WARNING: This is a low-level API, only use this when you know what you are doing as
     * you'll be accessing C# code directly.
     *
     * @param   { string }      typeName    The full typename to request from the Episerver ServiceLocator
     * @return  { T }  The object as returned by the Episerver ServiceLocator
     */
    getEpiserverService<T = unknown>(typeName: string): T;
    /**
     * This is part of the Server Side Rendering JavaScript interoperability. This method
     * will always throw an exception when there's no server side rendering process. Otherwise
     * it will return the object as processed by Episerver.
     *
     * WARNING: This is a low-level API, only use this when you know what you are doing as
     * you'll be accessing C# code directly.
     *
     * @param   toProcess    The value received from any Episerver C# call that must be made safe to use within JS
     * @return  The processed value
     */
    makeSafe<T>(toProcess: T): T;
    isServerSideEnumerator<T>(toCheck: unknown): toCheck is ServerSideEnumerator<T>;
    get<K extends keyof DefaultServerContext>(propname: K): DefaultServerContext[K] | undefined;
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
}
export default DotNetServerContextAccessor;
