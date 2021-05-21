import { ContentLinkService } from '../Models/ContentLink';
import { isSerializedIContent, isSerializedWebsite } from './ServerContext';
import StringUtils from '../Util/StringUtils';
/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering. This context is available both on the server (as an instance
 * of Foundation.SpaViewEngine.JsInterop.Models.ServerSideRenderingContext) or on the
 * client (as standard JavaScript object, restored from JSON).
 */
export class ServerContextAccessor {
    constructor(isServerSideRendering) {
        this._ssr = isServerSideRendering;
    }
    get IsAvailable() {
        return this.hasContext();
    }
    get IsServerSideRendering() {
        return this._ssr || false;
    }
    /**
     *
     */
    get IContent() {
        if (!this.hasContext())
            return null;
        const iContent = this.get('iContent');
        if (!iContent)
            return null;
        if (isSerializedIContent(iContent))
            return JSON.parse(iContent);
        return iContent;
    }
    get Website() {
        if (!this.hasContext())
            return null;
        const website = this.get('website');
        if (!website)
            return null;
        if (isSerializedWebsite(website))
            return JSON.parse(website);
        return website;
    }
    get Path() {
        if (!this.hasContext())
            return null;
        return this.get('path') || null;
    }
    get Contents() {
        var _a;
        if (!this.hasContext)
            return [];
        return ((_a = this.get('contents')) === null || _a === void 0 ? void 0 : _a.map(x => isSerializedIContent(x) ? JSON.parse(x) : x)) || [];
    }
    hasContext() {
        try {
            const dataType = typeof (__INITIAL__DATA__);
            return dataType === "object" && __INITIAL__DATA__ !== null;
        }
        catch (e) {
            // Ignored on purpose
        }
        return false;
    }
    /**
     * Get an IContent for a path on the current website, null if not found
     *
     * @param path The path to resolve the IContent for
     */
    getIContentByPath(path) {
        var _a, _b;
        // First see if the given content matches the route
        if (StringUtils.TrimRight('/', path) === StringUtils.TrimRight('/', ((_a = this.IContent) === null || _a === void 0 ? void 0 : _a.url) || undefined))
            return this.IContent;
        // Then, if no match, see if we're rendering the homepage
        if (path === '/') {
            const startPageLink = ((_b = this.Website) === null || _b === void 0 ? void 0 : _b.contentRoots) ? this.Website.contentRoots["startPage"] : undefined;
            if (startPageLink && this.IContent) {
                const iContentId = ContentLinkService.createApiId(this.IContent);
                const startPageId = ContentLinkService.createApiId(startPageLink);
                if (iContentId === startPageId)
                    return this.IContent;
                else
                    return this.IsServerSideRendering ? this.getIContent(startPageLink) : null;
            }
        }
        // Just give up...
        return null;
    }
    getIContent(ref) {
        // Try loading through the .Net API
        if (this.IsServerSideRendering)
            return this.ssrLoadIContent(ref);
        // Build the identifier of the requested content    
        const refId = ContentLinkService.createApiId(ref || 'args.ref', false, true);
        // See if we're requesting the main content item
        if (ContentLinkService.createApiId(this.IContent || 'this.icontent', false, true) === refId)
            return this.IContent;
        // See if we're requesting one of the related items, prior loaded through the EpiserverAPI
        if (!this.IsServerSideRendering) {
            let serverItem = null;
            this.Contents.forEach(x => {
                serverItem = serverItem || (ContentLinkService.createApiId(x || 'this.Contents', false, true) === refId ? x : serverItem);
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
    ssrLoadIContent(ref) {
        if (!this.IsServerSideRendering)
            return null;
        const refId = ContentLinkService.createApiId(ref || 'args.ref', false, true);
        try {
            return __EpiserverAPI__.LoadIContent(refId);
        }
        catch (e) {
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
    getEpiserverService(typeName) {
        if (!this.IsServerSideRendering)
            throw new Error("The Episerver Services can only be accessed while server side rendering.");
        try {
            return __EpiserverAPI__.GetService(typeName);
        }
        catch (e) {
            throw new Error(`Error while fetching the Episerver Service ${typeName}`);
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
    makeSafe(toProcess) {
        if (!this.IsServerSideRendering)
            return toProcess;
        try {
            let out = __EpiserverAPI__.MakeSafe(toProcess);
            if (this.isServerSideEnumerator(out)) {
                const newOut = [];
                out.forEach(value => newOut.push(value));
                out = newOut;
            }
            return out;
        }
        catch (e) {
            throw new Error(`Error while making a value safe (${e})`);
        }
    }
    isServerSideEnumerator(toCheck) {
        return (toCheck.GetEnumerator && toCheck.Map) ? true : false;
    }
    get(propname) {
        return this.getProp(propname);
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
    setProp(propname, value) {
        try {
            __INITIAL__DATA__[propname] = value;
        }
        catch (e) {
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
    getProp(propname) {
        try {
            return __INITIAL__DATA__[propname];
        }
        catch (e) {
            // Ignored on purpose
        }
        return undefined;
    }
}
export default ServerContextAccessor;
//# sourceMappingURL=ServerContextAccessor.js.map