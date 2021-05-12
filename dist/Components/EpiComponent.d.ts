import React from 'react';
import IContent from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
import { ComponentProps } from '../EpiComponent';
/**
 * The properties for the Episerver CMS Component
 */
export declare type EpiComponentProps<T extends IContent = IContent> = Omit<ComponentProps<T>, "data" | "context"> & {
    /**
     * The data for the component, if it has been fetched before.
     */
    expandedValue: T | undefined;
    /**
     * Legacy context, kept as argument for now, but ignored by the implementation
     *
     * @deprecated
     */
    context?: IEpiserverContext;
};
declare function EpiComponent<T extends IContent = IContent>(props: EpiComponentProps<T>): React.ReactElement<unknown> | null;
declare namespace EpiComponent {
    var displayName: string;
}
export declare const IContentRenderer: React.FunctionComponent<{
    data: IContent;
    contentType?: string;
    actionName?: string;
    actionData?: unknown;
    path?: string;
}>;
export default EpiComponent;
/**
 * Create the name of the React Component to load for this EpiComponent
 *
 * @param item The IContent to be presented by this EpiComponent
 */
export declare const buildComponentName: (item: IContent | null, contentType?: string) => string;
