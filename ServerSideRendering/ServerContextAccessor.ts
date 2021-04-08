import getGlobal from '../AppGlobal';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import ServerContext, { isSerializedIContent, isSerializedWebsite } from './ServerContext';

export type IServerContextAccessor = new() => ServerContextAccessor;

declare const __INITIAL__DATA__ : Readonly<ServerContext>;

/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering. This context is available both on the server (as an instance
 * of Foundation.SpaViewEngine.JsInterop.Models.ServerSideRenderingContext) or on the
 * client (as standard JavaScript object, restored from JSON).
 */
export class ServerContextAccessor
{
    private _context ?: Readonly<ServerContext>;
    private _ssr ?: Readonly<boolean>;

    constructor(isServerSideRendering?: boolean) 
    {
        this._ssr = isServerSideRendering;
        try {
            this._context = __INITIAL__DATA__ || undefined;
        } catch (e) {
            // Ignored on purpose
        }
        if (!this._context) {
            const ctx = getGlobal();
            this._context = ctx.__INITIAL__DATA__;
        }
    }

    public get IsAvailable() : boolean
    {
        return this.hasContext();
    }

    public get IsServerSideRendering() : boolean
    {
        return this._ssr || false;
    }

    /**
     * 
     */
    public get IContent() : IContent | null
    {
        if (!this._context) return null;
        if (isSerializedIContent(this._context.IContent)) {
            return JSON.parse(this._context.IContent);
        }
        return this._context.IContent || null;
    }

    public get Website() : Website | null
    {
        if (!this._context) return null;
        if (isSerializedWebsite(this._context.Website)) {
            return JSON.parse(this._context.Website);
        }
        return this._context.Website;
    }

    public get Path() : string | null
    {
        if (!this._context) return null;
        return this._context.Path;
    }

    public get Contents() : IContent[]
    {
        if (!this._context) return [];
        return this._context?.Contents?.map(x => isSerializedIContent(x) ? JSON.parse(x) : x) || [];
    }

    public hasContext() : boolean
    {
        return this._context ? true : false;
    }

    public getIContent<T extends IContent = IContent>(ref : ContentReference) : T | null 
    {
        const refId = ContentLinkService.createApiId(ref || 'args.ref', false, true);
        if (ContentLinkService.createApiId(this.IContent || 'this.icontent', false, true) === refId) {
            return this.IContent as T;
        }

        if (!this.IsServerSideRendering) return null;

        try {
            return __EpiserverAPI__.LoadIContent<T>(refId);
        } catch (e) {
            // Do not raise an error, silently not load the content
        }
        return null;
    }

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
    public getEpiserverService<T = unknown>(typeName : string) : T
    {
        if (!this.IsServerSideRendering)
            throw new Error("The Episerver Services can only be accessed while server side rendering.");

        try {
            return __EpiserverAPI__.GetService<T>(typeName);
        } catch (e) {
            throw new Error(`Error while fetching the Episerver Service ${ typeName }`)
        }
    }

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
    public makeSafe<TOut = unknown, TIn = unknown>(toProcess: TIn) : TOut
    {
        if (!this.IsServerSideRendering)
            throw new Error("The Episerver Services can only be accessed while server side rendering.");

        try {
            let out = __EpiserverAPI__.MakeSafe<TOut>(toProcess) as unknown;
            if (this.isServerSideEnumerator<unknown>(out)) {
                const newOut : unknown[] = [];
                out.forEach(value => newOut.push(value));
                out = newOut;
            }
            return out as TOut;
        } catch (e) {
            throw new Error(`Error while making a value safe`);
        }
    }

    public isServerSideEnumerator<T>(toCheck: unknown) : toCheck is ServerSideEnumerator<T>
    {
        return ((toCheck as ServerSideEnumerator<T>).GetEnumerator && (toCheck as ServerSideEnumerator<T>).Map) ? true : false;
    }
}

interface ServerSideEnumerator<TData> {
    GetEnumerator: ()=>void
    Map: <TOut>(func: (item: TData) => TOut) => TOut[]
    forEach: (func: (item: TData) => void)=>void
}

declare const __EpiserverAPI__ : ServerSideAPI;
type ServerSideAPI = {
    GetService: <T = unknown>(name: string) => T
    MakeSafe: <T = unknown>(object: unknown) => T
    LoadIContent: <T extends IContent = IContent>(complexReference: string) => T | null
}

export default ServerContextAccessor;