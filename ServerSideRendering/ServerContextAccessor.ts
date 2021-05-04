import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import ServerContext, { DefaultServerContext, isSerializedIContent, isSerializedWebsite } from './ServerContext';
import StringUtils from '../Util/StringUtils';

export type IServerContextAccessor = new() => ServerContextAccessor;

declare const __INITIAL__DATA__ : ServerContext;

/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering. This context is available both on the server (as an instance
 * of Foundation.SpaViewEngine.JsInterop.Models.ServerSideRenderingContext) or on the
 * client (as standard JavaScript object, restored from JSON).
 */
export class ServerContextAccessor
{
    private _ssr ?: Readonly<boolean>;

    constructor(isServerSideRendering?: boolean) 
    {
        this._ssr = isServerSideRendering;
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
        if (!this.hasContext()) return null;
        const iContent = this.get('iContent');
        if (!iContent) return null;
        if (isSerializedIContent(iContent)) return JSON.parse(iContent);
        return iContent;
    }

    public get Website() : Website | null
    {
        if (!this.hasContext()) return null;
        const website = this.get('website');
        if (!website) return null;
        if (isSerializedWebsite(website)) return JSON.parse(website);
        return website;
    }

    public get Path() : string | null
    {
        if (!this.hasContext()) return null;
        return this.get('path') || null;
    }

    public get Contents() : IContent[]
    {
        if (!this.hasContext) return [];
        return this.get('contents')?.map(x => isSerializedIContent(x) ? JSON.parse(x) : x) || [];
    }

    public hasContext() : boolean
    {
        try {
            const dataType = typeof(__INITIAL__DATA__);
            return dataType === "object" && __INITIAL__DATA__ !== null;
        } catch(e) { 
            // Ignored on purpose
        }
        return false;
    }

    /**
     * Get an IContent for a path on the current website, null if not found
     * 
     * @param path The path to resolve the IContent for
     */
    public getIContentByPath<T extends IContent = IContent>(path: string) : T | null
    {
        // First see if the given content matches the route
        if (StringUtils.TrimRight('/', path) === StringUtils.TrimRight('/', this.IContent?.url || undefined))
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
        // Try loading through the .Net API
        if (this.IsServerSideRendering)
            return this.ssrLoadIContent(ref);

        // Build the identifier of the requested content    
        const refId = ContentLinkService.createApiId(ref || 'args.ref', false, true);

        // See if we're requesting the main content item
        if (ContentLinkService.createApiId(this.IContent || 'this.icontent', false, true) === refId)
            return this.IContent as T;

        // See if we're requesting one of the related items, prior loaded through the EpiserverAPI
        if (!this.IsServerSideRendering) {
            let serverItem : T | null = null;
            this.Contents.forEach(x => {
                serverItem = serverItem || (ContentLinkService.createApiId(x || 'this.Contents', false, true) === refId ? x as T : serverItem)
            });
            return serverItem;
        }

        // Return null
        return null;
    }

    /**
     * Load an item from the Content Cloud repository whilest rendering within the .Net 
     * Server Side Rendering logic.
     * 
     * @param ref The content reference of the requested content
     * @returns The loaded content item or null if we're not server side rendering or the content item has not been found
     */
    public ssrLoadIContent<T extends IContent = IContent>(ref : ContentReference) : T | null 
    {
        if (!this.IsServerSideRendering) return null;
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