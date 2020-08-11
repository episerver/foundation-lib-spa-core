import { Component, ReactNode, ComponentType } from "react";
import { ComponentProps } from '../EpiComponent';
import IContent from "../Models/IContent";
import ContentLink from "../Models/ContentLink";
import ComponentLoader from "../Loaders/ComponentLoader";
import IEpiserverContext from '../Core/IEpiserverContext';
import { TComponentType } from '../Loaders/ComponentLoader';
interface EpiComponentState {
    hasError: boolean;
    errorObject?: any;
    component?: TComponentType;
    componentName?: string;
    componentIsUpdating: boolean;
}
export interface EpiComponentProps {
    /**
     * The link to the content to be rendered in this component
     */
    contentLink: ContentLink;
    /**
     * Context information
     */
    contentType?: string;
    /**
     *
     */
    context: IEpiserverContext;
    /**
     * CSS Class to be added
     */
    className?: string;
    /**
     * The data for the component, if it has been fetched before.
     */
    expandedValue?: IContent;
    /**
     * The width of the component
     */
    width?: number;
    /**
     * The height of the component
     */
    height?: number;
    /**
     * The name of the property being rendered
     */
    propertyName?: string;
    actionName?: string;
    actionData?: any;
    path?: string;
}
export declare type EpiComponentType<P extends EpiComponentProps = EpiComponentProps> = ComponentType<P>;
/**
 * The CMS Component provides the asynchronous loading of content and components needed to render an IContent
 * based (part of) the page.
 */
export default class EpiComponent extends Component<EpiComponentProps, EpiComponentState> {
    /**
     * The component loader to dynamically load the components
     */
    protected readonly componentLoader: ComponentLoader;
    protected _unmounted: boolean;
    /**
     * Dynamic property for accessing the Episerver SPA Context, first from the
     * component properties, secondly from the global context.
     *
     * @returns	{ IEpiserverSpaContext } The current context for the SPA
     */
    protected get spaContext(): IEpiserverContext;
    /**
     * Create a new CMS Component, which dynamically loads the application component
     * for rendering.
     *
     * @param props
     */
    constructor(props: EpiComponentProps);
    protected loadComponent(iContent?: IContent): Promise<ComponentType<ComponentProps<IContent>>>;
    /**
     * Build the actual properties array for the component
     *
     * @param 	content 	The content item to generate the props for
     */
    protected buildComponentProps(content: IContent): ComponentProps<IContent>;
    /**
     * Create the name of the React Component to load for this EpiComponent
     *
     * @param item The IContent to be presented by this EpiComponent
     */
    protected buildComponentName(item: IContent): string;
    /**
     * Handle the attaching of this component to the virtual DOM to render it's contained
     * IContent
     */
    componentDidMount(): void;
    componentDidUpdate(prevProps: EpiComponentProps, prevState: EpiComponentState): void;
    protected updateComponent(componentName: string): void;
    /**
     * Check if the current expanded value is both set and relates to the current
     * content reference.
     */
    protected isExpandedValueValid(): boolean;
    protected isComponentValid(): boolean;
    componentDidCatch(error: any, errorInfo: any): any;
    static getDerivedStateFromError(error: any): EpiComponentState;
    componentWillUnmount(): void;
    render(): ReactNode | null;
    /**
     * Create the instantiable type of the EpiComponent for the current
     * context. It'll return the base EpiComponent or a EpiComponent wrapped
     * in the connect method from React-Redux.
     *
     * @param { IEpiserverContext } context The application context
     * @returns { EpiComponentType }
     */
    static CreateComponent(context: IEpiserverContext): EpiComponentType;
}
export {};
