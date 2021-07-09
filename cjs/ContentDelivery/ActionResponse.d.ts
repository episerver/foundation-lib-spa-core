import ContentLink from '../Models/ContentLink';
import IContent from '../Models/IContent';
export declare const enum ResponseType {
    ActionResult = "ActionResult"
}
/**
 * The ActionResponse is the main response type for invoking action
 * methods.
 */
export interface ActionResponse<T, C extends IContent = IContent> {
    /**
     * The name of the invoked action
     */
    actionName: string;
    /**
     * The type of response
     */
    responseType: ResponseType;
    /**
     * The actual payload of the response
     */
    data: T;
    /**
     * The name of the current content
     */
    name: string;
    /**
     * The link to the content
     */
    contentLink: ContentLink;
    /**
     * The URL to the content, without actions
     */
    url: string;
    /**
     * The full content object
     */
    currentContent: C;
    /**
     * The current language
     */
    language: string;
}
export default ActionResponse;
