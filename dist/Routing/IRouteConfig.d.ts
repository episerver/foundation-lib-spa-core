import React from 'react';
import { RouteProps, RouteComponentProps } from 'react-router';
export interface IRouteConfigComponentProps<ParamsType = any> extends RouteComponentProps<ParamsType> {
    routes?: IRouteConfig;
    path?: string;
}
export interface IRouteConfigItem extends RouteProps {
    path: string;
    component?: React.ComponentType<IRouteConfigComponentProps<any>> | React.ComponentType<any>;
    render?: (props: IRouteConfigComponentProps<any>) => React.ReactNode;
    children?: ((props: IRouteConfigComponentProps<any>) => React.ReactNode) | React.ReactNode;
    routes?: IRouteConfigItem[];
}
declare type IRouteConfig = IRouteConfigItem[];
export default IRouteConfig;
