import ContentLink from '../Models/ContentLink';
import { Component, ReactNode, ReactElement } from 'react';
import { ContentAreaProperty } from '../Property';
import IEpiserverContext from '../Core/IEpiserverContext';
/**
 * Definition of the ContentArea property value as used within the ContentDelivery API
 */
export declare type ContentAreaPropertyValue = ContentAreaPropertyItem[];
export interface ContentAreaSiteConfig {
    /**
     * The bindings between the display options and CSS classes to apply
     */
    displayOptions?: {
        [displayOption: string]: string;
    };
    /**
     * Default CSS class to be added when rendering a block, defaults to "col"
     */
    defaultBlockClass?: string;
    /**
     * Default CSS class to be added when rendering a row, defaults to "row"
     */
    defaultRowClass?: string;
    /**
     * Default CSS class to be added to a container, defaults to "container"
     */
    defaultContainerClass?: string;
    /**
     * If this class specified here is applied to a block, it'll cause the container
     * to break to enable going full width
     */
    containerBreakBlockClass?: string;
    /**
     * Set the type of component for the items within this area, this gets passed to the
     * contentType attribute of the EpiComponent. The EpiComponent will prefix the reported
     * type from Episerver with this value, if it does not start with this value already.
     *
     * Defaults to: Block
     */
    itemContentType?: string;
    /**
     * If set to "true", the components will not be wrapped in div elements and directly
     * outputted.
     */
    noWrap?: boolean;
    /**
     * If set to "true", the components will also be wrapped in a container div, defaulting
     * to the bootstrap "container"-class. If noWrap has been set to true, setting this has
     * no effect
     */
    addContainer?: boolean;
}
/**
 * A single item within an ContentArea, as returned by the ContentDelivery API
 */
interface ContentAreaPropertyItem {
    contentLink: ContentLink;
    displayOption: string;
    tag: string;
}
interface ContentAreaProps extends ContentAreaSiteConfig {
    /**
     * The ContentArea property from the IContent, which must be rendered by this
     * component.
     */
    data: ContentAreaProperty;
    /**
     * The Episerver Context used for rendering the ContentArea
     */
    context: IEpiserverContext;
    /**
     * The name of the ContentArea property, if set this enables On Page Editing for
     * the content-area.
     */
    propertyName?: string;
}
export default class ContentArea extends Component<ContentAreaProps> {
    render(): ReactNode | null;
    protected renderComponent(item: ContentAreaPropertyItem, idx: number): ReactElement;
    protected renderNoChildren(): JSX.Element;
    protected getBlockClasses(displayOption: string): string[];
    /**
     * Retrieve the ContentArea configuration, as the global configuration overridden by the
     * instance configuration.
     */
    protected getConfig(): ContentAreaSiteConfig;
    protected getConfigValue<K extends keyof ContentAreaSiteConfig>(propName: K, defaultValue?: ContentAreaSiteConfig[K]): ContentAreaSiteConfig[K];
    protected getComponentType(): string;
}
export {};
