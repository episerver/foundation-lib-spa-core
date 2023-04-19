/// <reference types="react" />
import * as RoutingNS from '../Routing/EpiSpaRouter';
import IRouteConfigBase, { IRouteConfigItem as IRouteConfigItemBase, IRouteConfigComponentProps as IRouteConfigComponentPropsBase } from '../Routing/IRouteConfig';
/**
 * Routing capability
 */
export declare const Router: import("react").FunctionComponent<RoutingNS.RouterProps>;
export declare const Content: import("react").FunctionComponent<RoutingNS.RoutedContentProps>;
export type RouterProps = RoutingNS.RouterProps;
export type ContentProps = RoutingNS.RoutedContentProps;
export type IRoutingConfig = IRouteConfigBase;
export type IRoutingItem = IRouteConfigItemBase;
export type RoutedComponentProps<T> = IRouteConfigComponentPropsBase<T>;
