import { FunctionComponent } from 'react';
import { StaticRouterProps, SwitchProps } from 'react-router';
import { BrowserRouterProps } from 'react-router-dom';
import IRouteConfig from './IRouteConfig';
export declare type RouterProps = StaticRouterProps & BrowserRouterProps;
export declare const Router: FunctionComponent<RouterProps>;
export default Router;
export declare type RoutedContentProps = SwitchProps & {
    keyPrefix?: string;
    config?: IRouteConfig;
    basePath?: string;
};
export declare const RoutedContent: FunctionComponent<RoutedContentProps>;
