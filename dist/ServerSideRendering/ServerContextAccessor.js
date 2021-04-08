import getGlobal from '../AppGlobal';
import { ContentLinkService } from '../Models/ContentLink';
import { isSerializedIContent, isSerializedWebsite } from './ServerContext';
/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering. This context is available both on the server (as an instance
 * of Foundation.SpaViewEngine.JsInterop.Models.ServerSideRenderingContext) or on the
 * client (as standard JavaScript object, restored from JSON).
 */
export class ServerContextAccessor {
    constructor(isServerSideRendering) {
        this._ssr = isServerSideRendering;
        try {
            this._context = __INITIAL__DATA__ || undefined;
        }
        catch (e) {
            // Ignored on purpose
        }
        if (!this._context) {
            const ctx = getGlobal();
            this._context = ctx.__INITIAL__DATA__;
        }
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
        if (!this._context)
            return null;
        if (isSerializedIContent(this._context.IContent)) {
            return JSON.parse(this._context.IContent);
        }
        return this._context.IContent || null;
    }
    get Website() {
        if (!this._context)
            return null;
        if (isSerializedWebsite(this._context.Website)) {
            return JSON.parse(this._context.Website);
        }
        return this._context.Website;
    }
    get Path() {
        if (!this._context)
            return null;
        return this._context.Path;
    }
    get Contents() {
        var _a, _b;
        if (!this._context)
            return [];
        return ((_b = (_a = this._context) === null || _a === void 0 ? void 0 : _a.Contents) === null || _b === void 0 ? void 0 : _b.map(x => isSerializedIContent(x) ? JSON.parse(x) : x)) || [];
    }
    hasContext() {
        return this._context ? true : false;
    }
    getIContent(ref) {
        const refId = ContentLinkService.createApiId(ref || 'args.ref', false, true);
        if (ContentLinkService.createApiId(this.IContent || 'this.icontent', false, true) === refId) {
            return this.IContent;
        }
        if (!this.IsServerSideRendering)
            return null;
        try {
            return __EpiserverAPI__.LoadIContent(refId);
        }
        catch (e) {
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
     * @param   { TIn }      toProcess    The value received from any Episerver C# call that must be made safe to use within JS
     * @return  { TOut }  The processed value
     */
    makeSafe(toProcess) {
        if (!this.IsServerSideRendering)
            throw new Error("The Episerver Services can only be accessed while server side rendering.");
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
            throw new Error(`Error while making a value safe`);
        }
    }
    isServerSideEnumerator(toCheck) {
        return (toCheck.GetEnumerator && toCheck.Map) ? true : false;
    }
}
export default ServerContextAccessor;
//# sourceMappingURL=ServerContextAccessor.js.map