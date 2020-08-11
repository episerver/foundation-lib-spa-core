import React, { Component, ReactNode, ReactNodeArray, ComponentType } from 'react';
import IContent from '../Models/IContent';
import ContentLink from '../Models/ContentLink';
import { SpinnerProps } from './Spinner';
import IEpiserverContext from '../Core/IEpiserverContext';
export declare type LayoutProps = React.PropsWithChildren<{
    page?: ContentLink;
    expandedValue?: IContent;
    actionName?: string;
    actionData?: any;
    path?: string;
    context: IEpiserverContext;
    startPage?: IContent;
}>;
export interface LayoutState {
    isContextLoading: boolean;
}
export declare type LayoutComponent<P extends LayoutProps = LayoutProps> = ComponentType<P>;
export interface EpiserverLayout {
    componentDidMount(): void;
    layoutDidMount?(): void;
    componentDidUpdate(prevProps: LayoutProps, prevState: LayoutState): void;
    layoutDidUpdate?(prevProps: LayoutProps, prevState: LayoutState): void;
    render(): ReactNodeArray | ReactNode | null;
    renderLayout(): ReactNodeArray | ReactNode | null;
    renderSpinner(): ReactNodeArray | ReactNode | null;
    renderEmpty(): ReactNodeArray | ReactNode | null;
}
/**
 * Basic layout implementation, needed to enable implementations to provide their own layout.
 */
export default class Layout extends Component<LayoutProps, LayoutState> implements EpiserverLayout {
    /**
     * The initial state of the Layout
     */
    state: LayoutState;
    readonly componentDidMount: () => void;
    readonly componentDidUpdate: (prevProps: LayoutProps, prevState: LayoutState) => void;
    readonly render: () => ReactNodeArray | ReactNode | null;
    renderLayout(): ReactNodeArray | ReactNode | null;
    renderSpinner(): ReactNodeArray | ReactNode | null;
    renderEmpty(): ReactNodeArray | ReactNode | null;
    protected getContext(): IEpiserverContext;
    protected isPageValid(): boolean;
    protected hasStartPage(): boolean;
    protected getSpinnerProps(): SpinnerProps;
}
