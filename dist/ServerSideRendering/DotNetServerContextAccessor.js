import { ContentLinkService } from '../Models/ContentLink';
import StringUtils from '../Util/StringUtils';
export class DotNetServerContextAccessor {
    constructor(execContext, config) {
        this.IsServerSideRendering = true;
        this._context = execContext;
        this._config = config;
    }
    get IsAvailable() {
        let available = false;
        try {
            const dataType = typeof (__INITIAL__DATA__);
            const initData = __INITIAL__DATA__;
            available = dataType === "object" && initData !== null;
        }
        catch (e) {
            // Ignored on purpose
        }
        return available;
    }
    /**
     *
     */
    get IContent() {
        if (!this.IsAvailable)
            return null;
        return this.get('iContent') || null;
    }
    get Website() {
        if (!this.IsAvailable)
            return null;
        return this.get('website') || null;
    }
    get Path() {
        if (!this.IsAvailable)
            return null;
        return this.get('path') || null;
    }
    get Contents() {
        if (!this.IsAvailable)
            return [];
        return this.get('contents') || [];
    }
    /**
     * Get an IContent for a path on the current website, null if not found
     *
     * @param path The path to resolve the IContent for
     */
    getIContentByPath(path) {
        const baseUrl = new URL(this._config.basePath, this._config.spaBaseUrl || this._config.epiBaseUrl);
        const contentPath = this.IContent ? (new URL(this.IContent.url || '', baseUrl)).pathname : undefined;
        // First see if the given content matches the route
        if (StringUtils.TrimRight('/', path) === StringUtils.TrimRight('/', contentPath))
            return this.IContent;
        // Then, if no match, see if we're rendering the homepage
        if (path === '/') {
            const startPageLink = this.Website?.contentRoots ? this.Website.contentRoots["startPage"] : undefined;
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
export default DotNetServerContextAccessor;
//# sourceMappingURL=DotNetServerContextAccessor.js.map