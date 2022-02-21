import { Component, ReactText } from 'react';
import { Method } from 'axios';
import IContent from './Models/IContent';
import ActionResponse from './Models/ActionResponse';
import ContentLink from './Models/ContentLink';
import IEpiserverContext from './Core/IEpiserverContext';
/**
 * Base properties to be applied to every Episerver component
 */
export interface ComponentProps<T extends IContent> {
    /**
     * The IContent data object for this component
     */
    data: T;
    /**
     * The width for this component
     */
    width?: number;
    /**
     * The height for this component
     */
    height?: number;
    /**
     * Additional classnames assigned to this component
     */
    className?: string;
    /**
     * The unique identifier of this component
     */
    key?: ReactText;
    /**
     * The link to the content item shown by this component
     */
    contentLink: ContentLink;
    /**
     * The type context to be used, typical values are null, empty string or "block"
     */
    contentType?: string;
    /**
     * The property name shown by this component
     */
    propertyName?: string;
    /**
     * The controller action name to be used
     */
    actionName?: string;
    /**
     * The controller action data to be used
     */
    actionData?: any;
    /**
     * Legacy application context, kept as argument for now. Used when provided
     * resolved at runtime otherwise.
     *
     * @deprecated
     */
    context?: IEpiserverContext;
    /**
     * The current path being rendered
     */
    path?: string;
    /**
     * The identifier of the component, if provided
     */
    id?: string;
    /**
     * The columns from the layout block
     *
     * @default 0
     */
    columns?: number;
    /**
     * The block ID for on page editing
     *
     * @default null
     */
    epiBlockId?: string | null;
    /**
     * The width from BE, convertable to Widths enum
     *
     * @default empty
     */
    layoutWidth?: string;
    /**
     * In layout block
     *
     * @default false
     */
    inLayoutBlock?: boolean;
}
/**
 * Type do describe a generic EpiComponent type
 */
export declare type EpiComponentType<T extends IContent = IContent> = new (props: ComponentProps<T>) => EpiComponent<T>;
/**
 * Base abstract class to be used by components representing an Episerver IContent component (e.g. Block, Page, Media,
 * Catalog, Product, etc...)
 */
export declare abstract class EpiComponent<T extends IContent = IContent, S = {}> extends Component<ComponentProps<T>, S, {}> {
    /**
     * The component name as injected by the ComponentLoader
     */
    static displayName: string;
    protected currentComponentId: number;
    protected currentComponentGuid: string;
    constructor(props: ComponentProps<T>);
    protected getInitialState?(): S;
    protected componentInitialize?(): void;
    /**
     * Return if debug mode is active
     */
    protected isDebugActive(): boolean;
    /**
     * Returns true for OPE only
     */
    protected isEditable(): boolean;
    /**
     * Returns true for OPE & Preview
     */
    protected isInEditMode(): boolean;
    /**
     * Retrieve the ContentLink for this component
     */
    protected getCurrentContentLink(): ContentLink;
    protected getContext(): IEpiserverContext;
    /**
     * Invoke a method on the underlying controller for this component, using strongly typed arguments and responses.
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    protected invokeTyped<TypeIn, TypeOut>(method: string, verb?: Method, args?: TypeIn): Promise<ActionResponse<TypeOut>>;
    /**
     * Invoke a method on the underlying controller for this component
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    protected invoke(method: string, verb?: Method, args?: object): Promise<ActionResponse<any>>;
    protected htmlObject(htmlValue: string): any;
    protected navigateTo(toPage: string | ContentLink): void;
}
export default EpiComponent;
