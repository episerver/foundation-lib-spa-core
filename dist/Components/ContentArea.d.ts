import React from 'react';
import IEpiserverContext from '../Core/IEpiserverContext';
import { ContentAreaProperty } from '../Property';
export declare type ContentAreaSiteConfig = {
    /**
     * The bindings between the display options and CSS classes to apply
     *
     * @default []
     */
    displayOptions?: {
        [displayOption: string]: string;
    };
    /**
     * Default CSS class to be added when rendering a block, defaults to "col"
     *
     * @default "col"
     */
    defaultBlockClass?: string;
    /**
     * Default CSS class to be added when rendering a row, defaults to "row"
     *
     * @default "row"
     */
    defaultRowClass?: string;
    /**
     * Default CSS class to be added to a container, defaults to "container"
     *
     * @default "container"
     */
    defaultContainerClass?: string;
    /**
     * If this class specified here is applied to a block, it'll cause the container
     * to break to enable going full width. For the logic to work this class must be
     * set by one of the display options
     *
     * @see ContentAreaSiteConfig.displayOptions
     * @default undefined
     */
    containerBreakBlockClass?: string;
    /**
     * Set the type of component for the items within this area, this gets passed to the
     * contentType attribute of the EpiComponent. The EpiComponent will prefix the reported
     * type from Episerver with this value, if it does not start with this value already.
     *
     * @default "Block"
     */
    itemContentType?: string;
    /**
     * If set to "true", the components will not be wrapped in div elements and directly
     * outputted.
     *
     * @default false
     */
    noWrap?: boolean;
    /**
     * If set to "true", the components will also be wrapped in a container div, defaulting
     * to the bootstrap "container"-class. If noWrap has been set to true, setting this has
     * no effect.
     *
     * @default false
     */
    addContainer?: boolean;
    /**
     * The class to be set on the outer-most wrapper, if any.
     *
     * @default "content-area"
     */
    wrapperClass?: string;
    /**
     * The columns from the layout block
     *
     * @default 12
     */
    columns?: number;
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
};
export declare type ContentAreaProps = ContentAreaSiteConfig & {
    /**
     * The ContentArea property from the IContent, which must be rendered by this
     * component.
     */
    data: ContentAreaProperty;
    /**
     * The Episerver Context used for rendering the ContentArea
     *
     * @deprecated
     */
    context?: IEpiserverContext;
    /**
     * The name of the ContentArea property, if set this enables On Page Editing for
     * the content-area.
     */
    propertyName?: string;
};
export declare const ContentArea: React.FunctionComponent<ContentAreaProps>;
export default ContentArea;
