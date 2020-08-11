/// <reference types="react" />
import * as RoutingNS from '../Routing/EpiSpaRouter';
import IRouteConfigBase, { IRouteConfigItem as IRouteConfigItemBase, IRouteConfigComponentProps as IRouteConfigComponentPropsBase } from '../Routing/IRouteConfig';
/**
 * Routing capability
 */
export declare const Router: import("react").FunctionComponent<RoutingNS.RouterProps>;
export declare const Content: import("react").FunctionComponent<RoutingNS.RoutedContentProps>;
export declare type RouterProps = RoutingNS.RouterProps;
export declare type ContentProps = RoutingNS.RoutedContentProps;
export declare type IRoutingConfig = IRouteConfigBase;
export declare type IRoutingItem = IRouteConfigItemBase;
export declare type RoutedComponentProps<T> = IRouteConfigComponentPropsBase<T>;
