"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserServerContextAccessor = void 0;
const ContentLink_1 = require("../Models/ContentLink");
const ServerContext_1 = require("./ServerContext");
const StringUtils_1 = require("../Util/StringUtils");
/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering. This context is available both on the server (as an instance
 * of Foundation.SpaViewEngine.JsInterop.Models.ServerSideRenderingContext) or on the
 * client (as standard JavaScript object, restored from JSON).
 */
class BrowserServerContextAccessor {
    constructor(execContext, config) {
        this.IsServerSideRendering = false;
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
    get IContent() {
        if (!this.IsAvailable)
            return null;
        const iContent = this.get('iContent');
        if (!iContent)
            return null;
        if (ServerContext_1.isSerializedIContent(iContent))
            return JSON.parse(iContent);
        return iContent;
    }
    get Website() {
        if (!this.IsAvailable)
            return null;
        const website = this.get('website');
        if (!website)
            return null;
        if (ServerContext_1.isSerializedWebsite(website))
            return JSON.parse(website);
        return website;
    }
    get Path() {
        if (!this.IsAvailable)
            return null;
        return this.get('path') || null;
    }
    get Contents() {
        var _a;
        if (!this.IsAvailable)
            return [];
        return ((_a = this.get('contents')) === null || _a === void 0 ? void 0 : _a.map(x => ServerContext_1.isSerializedIContent(x) ? JSON.parse(x) : x)) || [];
    }
    /**
     * Get an IContent for a path on the current website, null if not found
     *
     * @param path The path to resolve the IContent for
     */
    getIContentByPath(path) {
        var _a;
        const baseUrl = new URL(this._config.basePath, this._config.spaBaseUrl || this._config.epiBaseUrl);
        const contentPath = this.IContent ? (new URL(this.IContent.url || '', baseUrl)).pathname : undefined;
        // First see if the given content matches the route
        if (StringUtils_1.default.TrimRight('/', path) === StringUtils_1.default.TrimRight('/', contentPath))
            return this.IContent;
        // Then, if no match, see if we're rendering the homepage
        if (path === '/') {
            const startPageLink = ((_a = this.Website) === null || _a === void 0 ? void 0 : _a.contentRoots) ? this.Website.contentRoots["startPage"] : undefined;
            if (startPageLink && this.IContent) {
                const iContentId = ContentLink_1.ContentLinkService.createApiId(this.IContent);
                const startPageId = ContentLink_1.ContentLinkService.createApiId(startPageLink);
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
        // Build the identifier of the requested content    
        const refId = ContentLink_1.ContentLinkService.createApiId(ref || 'args.ref', false, true);
        // See if we're requesting the main content item
        if (ContentLink_1.ContentLinkService.createApiId(this.IContent || 'this.icontent', false, true) === refId)
            return this.IContent;
        let serverItem = null;
        this.Contents.forEach(x => {
            serverItem = serverItem || (ContentLink_1.ContentLinkService.createApiId(x || 'this.Contents', false, true) === refId ? x : serverItem);
        });
        return serverItem;
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
exports.BrowserServerContextAccessor = BrowserServerContextAccessor;
exports.default = BrowserServerContextAccessor;
//# sourceMappingURL=BrowserServerContextAccessor.js.map