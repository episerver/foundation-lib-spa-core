import { ComponentType, ReactNode } from 'react';
import { RouteProps, RouteComponentProps } from 'react-router';

export interface IRouteConfigComponentProps<ParamsType = any> extends RouteComponentProps<ParamsType>
{
    routes  ?:       IRouteConfig;
    path    ?:       string 
}

export interface IRouteConfigItem extends RouteProps
{
    path:           string
    component?:     ComponentType<IRouteConfigComponentProps<any>> | ComponentType<any>
    render?:        (props: IRouteConfigComponentProps<any>) => ReactNode
    children?:      ((props: IRouteConfigComponentProps<any>) => ReactNode) | ReactNode     
    routes ?:       IRouteConfigItem[]
}

export type IRouteConfig = IRouteConfigItem[];
export default IRouteConfig;