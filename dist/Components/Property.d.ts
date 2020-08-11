import { Component, ReactNode, ReactNodeArray, HTMLAttributes } from 'react';
import IContentProperty from '../Property';
import IContent, { GenericProperty } from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
export interface PropertyProps<T extends IContent> extends HTMLAttributes<HTMLElement> {
    iContent: T;
    field: keyof T;
    context: IEpiserverContext;
    className?: string;
}
export default class Property<T extends IContent> extends Component<PropertyProps<T>> {
    protected hasProperty(): boolean;
    protected getProperty(): GenericProperty;
    protected isIContentProperty(p: GenericProperty): p is IContentProperty<any>;
    render(): ReactNode | ReactNodeArray | null;
    /**
     * Helper method to ensure properties are only editable on the page/content they belong
     * to, this is used to ensure properties from a StartPage are only made editable when the
     * current page is the StartPage.
     *
     * Edit mode does not use SPA Routing, thus updating properties is not a main concern
     */
    protected isEditable(): boolean;
}
