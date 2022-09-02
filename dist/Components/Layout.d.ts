import React, { ComponentType, FunctionComponent } from 'react';
import IEpiserverContext from '../Core/IEpiserverContext';
export declare type LayoutProps = React.PropsWithChildren<{
    context?: IEpiserverContext;
}>;
export declare type LayoutComponent<P extends LayoutProps = LayoutProps> = ComponentType<P>;
/**
 * A default layout implementation, simply wrapping the site in a div
 *
 * @param   props   The properties of this layout
 */
export declare const Layout: FunctionComponent<LayoutProps>;
export declare const NotFoundComponent: FunctionComponent;
export default Layout;
