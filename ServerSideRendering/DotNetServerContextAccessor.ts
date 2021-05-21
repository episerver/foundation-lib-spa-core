import ServerContext, { DefaultServerContext } from './ServerContext';
import IServerContextAccessor from './IServerContextAccessor';

import IContent from '../Models/IContent';
import Website from '../Models/Website';
import { ContentLinkService, ContentReference } from '../Models/ContentLink';

import IExecutionContext from '../Core/IExecutionContext';
import StringUtils from '../Util/StringUtils';
import IAppConfig from '../AppConfig';

export interface ServerSideEnumerator<TData> {
    GetEnumerator: ()=>void
    Map: <TOut>(func: (item: TData) => TOut) => TOut[]
    forEach: (func: (item: TData) => void)=>void
}

export type ServerSideAPI = {
    GetService: <T = unknown>(name: string) => T
    MakeSafe: <T = unknown>(object: unknown) => T
    LoadIContent: <T extends IContent = IContent>(complexReference: string) => T | null
}

declare const __EpiserverAPI__ : ServerSideAPI;
declare const __INITIAL__DATA__ : ServerContext;

export class DotNetServerContextAccessor implements IServerContextAccessor
{
    private readonly _context : Readonly<IExecutionContext>;
    private readonly _config : Readonly<IAppConfig>;

    constructor(execContext: Readonly<IExecutionContext>, config: Readonly<IAppConfig>) 
    {
        this._context = execContext;
        this._config = config;
    }

    public get IsAvailable() : boolean
    {
        let available = false;
        try {
            const dataType = typeof(__INITIAL__DATA__);
            const initData = __INITIAL__DATA__;
            available = dataType === "object" && initData !== null;
        } catch(e) { 
            // Ignored on purpose
        }
        return available;
    }

    public readonly IsServerSideRendering : boolean = true

    /**
     * 
     */
    public get IContent() : IContent | null
    {
        if (!this.IsAvailable) return null;
        return this.get('iContent') || null;
    }

    public get Website() : Website | null
    {
        if (!this.IsAvailable) return null;
        return this.get('website') || null
    }

    public get Path() : string | null
    {
        if (!this.IsAvailable) return null;
        return this.get('path') || null;
    }

    public get Contents() : IContent[]
    {
        if (!this.IsAvailable) return [];
        return this.get('contents') || [];
    }

    /**
     * Get an IContent for a path on the current website, null if not found
     * 
     * @param path The path to resolve the IContent for
     */
    public getIContentByPath<T extends IContent = IContent>(path: string) : T | null
    {
        const baseUrl = new URL(this._config.basePath, this._config.spaBaseUrl || this._config.epiBaseUrl);
        const contentPath = this.IContent ? (new URL(this.IContent.url || '', baseUrl)).pathname : undefined;

        // First see if the given content matches the route
        if (StringUtils.TrimRight('/', path) === StringUtils.TrimRight('/', contentPath))
            return this.IContent as T;

        // Then, if no match, see if we're rendering the homepage
        if (path === '/') {
            const startPageLink = this.Website?.contentRoots ? this.Website.contentRoots["startPage"] : undefined;
            if (startPageLink && this.IContent) {
                const iContentId = ContentLinkService.createApiId(this.IContent);
                const startPageId = ContentLinkService.createApiId(startPageLink);
                if (iContentId === startPageId) 
                    return this.IContent as T;
                else
                    return this.IsServerSideRendering ? this.getIContent(startPageLink) : null;
            }
        }

        // Just give up...
        return null;
    }

    public getIContent<T extends IContent = IContent>(ref : ContentReference) : T | null 
    {
        const refId = ContentLinkService.createApiId(ref || 'args.ref', false, true);
        try {
            return __EpiserverAPI__.LoadIContent<T>(refId);
        } catch (e) {
            // Ignored on purpose
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
     * @param   toProcess    The value received from any Episerver C# call that must be made safe to use within JS
     * @return  The processed value
     */
    public makeSafe<T>(toProcess: T) : T
    {
        if (!this.IsServerSideRendering)
            return toProcess;

        try {
            let out = __EpiserverAPI__.MakeSafe<T>(toProcess);
            if (this.isServerSideEnumerator(out)) {
                const newOut : unknown[] = [];
                out.forEach(value => newOut.push(value));
                out = newOut as unknown as T;
            }
            return out;
        } catch (e) {
            throw new Error(`Error while making a value safe (${ e })`);
        }
    }

    public isServerSideEnumerator<T>(toCheck: unknown) : toCheck is ServerSideEnumerator<T>
    {
        return ((toCheck as ServerSideEnumerator<T>).GetEnumerator && (toCheck as ServerSideEnumerator<T>).Map) ? true : false;
    }

    public get<K extends keyof DefaultServerContext>(propname: K) : DefaultServerContext[K] | undefined
    {
        return this.getProp(propname as string);
    }

    /**
     * Add a custom property to the server side rendering context, if this is done
     * while server side rendering, the property will be available on the client as
     * well.
     * 
     * @param propname The name of the property
     * @param value The value to set, this should be serializable by Newtonsoft.Json
     * @returns Whether setting the value succeeded.
     */
    public setProp(propname: string, value: unknown) : boolean
    {
        try {
            __INITIAL__DATA__[propname as string] = value;
        } catch(e) {
            return false;
        }
        return true;
    }

    /**
     * Retrieve a custom property from the server side rendering context
     * 
     * @param propname The name of the custom property
     * @returns The current property value, or undefined if the property isn't set
     */
    public getProp<T = unknown>(propname: string) : T | undefined
    {
        try {
            return __INITIAL__DATA__[propname as string] as T | undefined;
        } catch(e) { 
            // Ignored on purpose
        }
        return undefined;
    }
}

export default DotNetServerContextAccessor;