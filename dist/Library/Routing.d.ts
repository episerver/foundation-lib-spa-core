import * as RoutingNS from '../Routing/EpiSpaRouter';
import IRouteConfigBase, { IRouteConfigItem as IRouteConfigItemBase, IRouteConfigComponentProps as IRouteConfigComponentPropsBase } from '../Routing/IRouteConfig';
/**
 * Routing capability
 */
export declare const Router: React.FunctionComponent<any>;
export declare const Content: React.FunctionComponent<any>;
export declare type RouterProps = RoutingNS.RouterProps;
export declare type ContentProps = RoutingNS.RoutedContentProps;
export declare type IRoutingConfig = IRouteConfigBase;
export declare type IRoutingItem = IRouteConfigItemBase;
export declare type RoutedComponentProps<T> = IRouteConfigComponentPropsBase<T>;
