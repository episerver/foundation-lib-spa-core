import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
export declare type IServerContextAccessor = new () => ServerContextAccessor;
/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering. This context is available both on the server (as an instance
 * of Foundation.SpaViewEngine.JsInterop.Models.ServerSideRenderingContext) or on the
 * client (as standard JavaScript object, restored from JSON).
 */
export declare class ServerContextAccessor {
    private _context?;
    private _ssr?;
    constructor(isServerSideRendering?: boolean);
    get IsAvailable(): boolean;
    get IsServerSideRendering(): boolean;
    /**
     *
     */
    get IContent(): IContent | null;
    get Website(): Website | null;
    get Path(): string | null;
    get Contents(): IContent[];
    hasContext(): boolean;
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
     * @param   { TIn }      toProcess    The value received from any Episerver C# call that must be made safe to use within JS
     * @return  { TOut }  The processed value
     */
    makeSafe<TOut = unknown, TIn = unknown>(toProcess: TIn): TOut;
    isServerSideEnumerator<T>(toCheck: unknown): toCheck is ServerSideEnumerator<T>;
}
interface ServerSideEnumerator<TData> {
    GetEnumerator: () => void;
    Map: <TOut>(func: (item: TData) => TOut) => TOut[];
    forEach: (func: (item: TData) => void) => void;
}
export default ServerContextAccessor;
