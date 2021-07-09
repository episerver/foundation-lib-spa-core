import { ReactElement, FunctionComponent } from 'react';
import ContentLink from '../Models/ContentLink';
import IContent from '../Models/IContent';
import { ComponentProps } from '../EpiComponent';
import { Property, VerboseProperty } from '../Property';
/**
 * The properties for the Episerver CMS Component
 */
export declare type EpiComponentProps<ContentType extends IContent = IContent, LinkType extends Property = Property<ContentLink, ContentType>> = Omit<ComponentProps<ContentType>, "data" | "contentLink"> & {
    contentLink: LinkType;
    /**
     * The data for the component, if it has been fetched before.
     */
    expandedValue?: LinkType extends VerboseProperty<ContentLink, ContentType> ? undefined : ContentType;
};
declare function EpiComponent<T extends IContent = IContent>(props: EpiComponentProps<T>): ReactElement<unknown> | null;
declare namespace EpiComponent {
    var displayName: string;
}
export declare const IContentRenderer: FunctionComponent<{
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
