import { AxiosRequestConfig, Method } from 'axios';
import AppConfig from './AppConfig';
import IContent from './Models/IContent';
import ContentLink, { ContentReference } from './Models/ContentLink';
import ActionResponse from './Models/ActionResponse';
import WebsiteList from './Models/WebsiteList';
import Website from './Models/Website';
import PathProvider from './PathProvider';
import Property from './Property';
export type PathResponse<T = any, C extends IContent = IContent> = C | ActionResponse<T, C>;
export type NetworkErrorData<T = any> = IContent & {
    error: Property<T>;
};
export declare function PathResponseIsIContent(iContent: PathResponse): iContent is IContent;
export declare function PathResponseIsActionResponse<P extends any = any>(actionResponse: PathResponse): actionResponse is ActionResponse<P>;
export declare function getIContentFromPathResponse<IContentType extends IContent = IContent>(response: PathResponse<any, IContentType>): IContentType | null;
/**
 * ContentDelivery API Wrapper
 *
 * @deprecated
 */
export declare class ContentDeliveryAPI {
    protected config: AppConfig;
    protected componentService: string;
    protected websiteService: string;
    protected methodService: string;
    protected debug: boolean;
    protected pathProvider: PathProvider;
    /**
     * Marker to keep if we're in edit mode
     */
    protected inEditMode: boolean;
    /**
     * Internal cache of the websites retrieved from the ContentDelivery API
     *
     * @private
     */
    private websites;
    /**
     * Internal cache of the current website, as retrieved from the ContentDelivery API
     *
     * @private
     */
    private website;
    /**
     * ContentDelivery API Wrapper
     *
     * @deprecated
     */
    constructor(pathProvider: PathProvider, config: AppConfig);
    get currentPathProvider(): PathProvider;
    get currentConfig(): AppConfig;
    isInEditMode(): boolean;
    setInEditMode(editMode: boolean): ContentDeliveryAPI;
    isDisabled(): boolean;
    /**
     * Invoke an ASP.Net MVC controller method using the generic content API. This is intended
     * to be used only when attaching a SPA to an existing code-base.
     *
     * @param content The content for which the controller must be loaded
     * @param method  The (case sensitive) method name to invoke on the controller
     * @param verb    The HTTP verb to use when invoking the controller
     * @param data    The data (if any) to send to the controller for the method
     */
    invokeControllerMethod(content: ContentLink, method: string, verb?: Method, data?: object): Promise<any>;
    /**
     * Strongly typed variant of invokeControllerMethod
     *
     * @see   invokeControllerMethod()
     * @param content The content for which the controller must be loaded
     * @param method  The (case sensitive) method name to invoke on the controller
     * @param verb    The HTTP verb to use when invoking the controller
     * @param data    The data (if any) to send to the controller for the method
     */
    invokeTypedControllerMethod<TypeOut, TypeIn>(content: ContentLink, method: string, verb?: Method, data?: TypeIn): Promise<ActionResponse<TypeOut>>;
    /**
     * Retrieve a list of all websites registered within Episerver
     */
    getWebsites(): Promise<WebsiteList>;
    /**
     * Retrieve the first website registered within Episerver
     */
    getWebsite(): Promise<Website>;
    getContent(content: ContentLink, forceGuid?: boolean): Promise<IContent | null>;
    getContentsByRefs(refs: Array<string>): Promise<Array<IContent>>;
    getContentByRef(ref: string): Promise<IContent>;
    getContentByPath(path: string): Promise<PathResponse>;
    getContentChildren<T extends IContent>(id: ContentReference): Promise<Array<T>>;
    getContentAncestors(link: ContentReference): Promise<Array<IContent>>;
    /**
     * Perform the actual request
     *
     * @param url The URL to request the data from
     * @param options The Request options to use
     */
    protected doRequest<T>(url: string, options?: AxiosRequestConfig): Promise<T>;
    protected getMethodServiceUrl(content: ContentLink, method: string): string;
    /**
     * Build the request parameters needed to perform the call to the Content Delivery API
     *
     * @param verb The verb for the generated configuration
     */
    protected getRequestSettings(verb?: Method): AxiosRequestConfig;
    protected getHeaders(customHeaders?: object): object;
    static IsActionResponse(response: PathResponse): response is ActionResponse<any>;
    private counter;
    protected buildNetworkError(reason: any, path?: string): NetworkErrorData;
}
export default ContentDeliveryAPI;
