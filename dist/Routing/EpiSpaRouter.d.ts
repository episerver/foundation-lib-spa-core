import React from 'react';
import { StaticRouterProps, SwitchProps } from 'react-router';
import { BrowserRouterProps } from 'react-router-dom';
import IRouteConfig from './IRouteConfig';
export interface RouterProps extends StaticRouterProps, BrowserRouterProps {
}
export declare const Router: React.FunctionComponent<RouterProps>;
export default Router;
export declare type RoutedContentProps = SwitchProps & {
    keyPrefix?: string;
    config?: IRouteConfig;
    basePath?: string;
};
export declare const RoutedContent: React.FunctionComponent<RoutedContentProps>;
