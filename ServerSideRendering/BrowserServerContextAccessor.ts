import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import Website from '../Models/Website';
import ServerContext, { SerializedServerContext, isSerializedIContent, isSerializedWebsite } from './ServerContext';
import StringUtils from '../Util/StringUtils';
import IServerContextAccessor from './IServerContextAccessor';

import IExecutionContext from '../Core/IExecutionContext';
import IAppConfig from '../AppConfig';

declare var __INITIAL__DATA__: ServerContext<SerializedServerContext>;
declare var __INITIAL_ENCRYPTED_DATA__: string;

/**
 * Simple accessor to quickly and conveniently access the context created by the
 * server side rendering. This context is available both on the server (as an instance
 * of Foundation.SpaViewEngine.JsInterop.Models.ServerSideRenderingContext) or on the
 * client (as standard JavaScript object, restored from JSON).
 */
export class BrowserServerContextAccessor implements IServerContextAccessor {
  private readonly _context: Readonly<IExecutionContext>;
  private readonly _config: Readonly<IAppConfig>;

  constructor(execContext: Readonly<IExecutionContext>, config: Readonly<IAppConfig>) {
    this._context = execContext;
    this._config = config;
    if (typeof __INITIAL_ENCRYPTED_DATA__ !== 'undefined') {
      const decryptedData = decodeURIComponent(escape(window.atob(__INITIAL_ENCRYPTED_DATA__)));
      const data = JSON.parse(decryptedData);
      __INITIAL__DATA__ = Object.assign({}, data);
    }
  }

  public get IsAvailable(): boolean {
    let available = false;
    try {
      const dataType = typeof __INITIAL__DATA__;
      const initData = __INITIAL__DATA__;
      available = dataType === 'object' && initData !== null;
    } catch (e) {
      // Ignored on purpose
    }
    return available;
  }

  public readonly IsServerSideRendering: boolean = false;

  public get IContent(): IContent | null {
    if (!this.IsAvailable) return null;
    const iContent = this.get('iContent');
    if (!iContent) return null;
    if (isSerializedIContent(iContent)) return JSON.parse(iContent);
    return iContent;
  }

  public get Website(): Website | null {
    if (!this.IsAvailable) return null;
    const website = this.get('website');
    if (!website) return null;
    if (isSerializedWebsite(website)) return JSON.parse(website);
    return website;
  }

  public get Path(): string | null {
    if (!this.IsAvailable) return null;
    return this.get('path') || null;
  }

  public get Contents(): IContent[] {
    if (!this.IsAvailable) return [];
    return this.get('contents')?.map((x) => (isSerializedIContent(x) ? JSON.parse(x) : x)) || [];
  }

  /**
   * Get an IContent for a path on the current website, null if not found
   *
   * @param path The path to resolve the IContent for
   */
  public getIContentByPath<T extends IContent = IContent>(path: string): T | null {
    const baseUrl = new URL(this._config.basePath, this._config.spaBaseUrl || this._config.epiBaseUrl);
    const contentPath = this.IContent ? new URL(this.IContent.url || '', baseUrl).pathname : undefined;

    // First see if the given content matches the route
    if (StringUtils.TrimRight('/', path) === StringUtils.TrimRight('/', contentPath)) return this.IContent as T;

    // Then, if no match, see if we're rendering the homepage
    if (path === '/') {
      const startPageLink = this.Website?.contentRoots ? this.Website.contentRoots['startPage'] : undefined;
      if (startPageLink && this.IContent) {
        const iContentId = ContentLinkService.createApiId(this.IContent);
        const startPageId = ContentLinkService.createApiId(startPageLink);
        if (iContentId === startPageId) return this.IContent as T;
        else return this.IsServerSideRendering ? this.getIContent(startPageLink) : null;
      }
    }

    // Just give up...
    return null;
  }

  public getIContent<T extends IContent = IContent>(ref: ContentReference): T | null {
    // Build the identifier of the requested content
    const refId = ContentLinkService.createApiId(ref || 'args.ref', false, true);

    // See if we're requesting the main content item
    if (ContentLinkService.createApiId(this.IContent || 'this.icontent', false, true) === refId)
      return this.IContent as T;

    let serverItem: T | null = null;
    this.Contents.forEach((x) => {
      serverItem =
        serverItem ||
        (ContentLinkService.createApiId(x || 'this.Contents', false, true) === refId ? (x as T) : serverItem);
    });
    return serverItem;
  }

  protected get<K extends keyof SerializedServerContext>(propname: K): SerializedServerContext[K] | undefined {
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
  public setProp(propname: string, value: unknown): boolean {
    try {
      __INITIAL__DATA__[propname as string] = value;
    } catch (e) {
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
  public getProp<T = unknown>(propname: string): T | undefined {
    try {
      return __INITIAL__DATA__[propname as string] as T | undefined;
    } catch (e) {
      // Ignored on purpose
    }
    return undefined;
  }
}

export default BrowserServerContextAccessor;
