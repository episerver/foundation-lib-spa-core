import { ContentReference } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import { SerializedServerContext } from './ServerContext';
import IServerContextAccessor from './IServerContextAccessor';
import IExecutionContext from '../Core/IExecutionContext';
import IAppConfig from '../AppConfig';
/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering. This context is available both on the server (as an instance
 * of Foundation.SpaViewEngine.JsInterop.Models.ServerSideRenderingContext) or on the
 * client (as standard JavaScript object, restored from JSON).
 */
export declare class BrowserServerContextAccessor implements IServerContextAccessor {
    private readonly _context;
    private readonly _config;
    constructor(execContext: Readonly<IExecutionContext>, config: Readonly<IAppConfig>);
    get IsAvailable(): boolean;
    readonly IsServerSideRendering: boolean;
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
    protected get<K extends keyof SerializedServerContext>(propname: K): SerializedServerContext[K] | undefined;
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
export default BrowserServerContextAccessor;
