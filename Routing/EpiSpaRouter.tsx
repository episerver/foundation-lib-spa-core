import React, { useEffect } from 'react';
import jQuery from 'jquery';
import { StaticRouter, StaticRouterProps, useHistory, useLocation, Switch, SwitchProps, Route, RouteProps, RouteComponentProps } from 'react-router';
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom';
import IRouteConfig, { IRouteConfigItem } from './IRouteConfig';
import { useEpiserver } from '../index';

export interface RouterProps extends StaticRouterProps, BrowserRouterProps {}
export const Router : React.FunctionComponent<RouterProps> = (props) =>
{
    const epi = useEpiserver();

    if (epi.isServerSideRendering()) {
        const RouterProps : StaticRouterProps = {
            basename: props.basename,
            context: props.context,
            location: props.location
        };
        return <StaticRouter {...RouterProps}>{ props.children }</StaticRouter>
    }

    const RouterProps : BrowserRouterProps = {
        basename: props.basename,
        forceRefresh: props.forceRefresh,
        getUserConfirmation: props.getUserConfirmation,
        keyLength: props.keyLength
    };
    return <BrowserRouter {...RouterProps}><ElementNavigation>{ props.children }</ElementNavigation></BrowserRouter>
}
export default Router;

interface ElementNavigationProps {};
const ElementNavigation : React.FunctionComponent<ElementNavigationProps> = (props) : React.ReactElement => {
    const history = useHistory();
    const location = useLocation();
    const epi = useEpiserver();
    const config = epi.config();

    if (!(epi.isInEditMode() || epi.isServerSideRendering())) useEffect(() => {
        const onWindowClick = (event: JQuery.ClickEvent) => {
            const target: HTMLElement = (event.target as any) as HTMLElement;
            const currentUrl: URL = new URL(window.location.href);
            let link: JQuery<HTMLElement>;
            let newPath: string = '';

            if (target.tagName.toLowerCase() == 'a') {
                const targetUrl: URL = new URL((target as HTMLAnchorElement).href);

                // Only act if we remain on the same domain
                if (targetUrl.origin === currentUrl.origin) {
                    newPath = targetUrl.pathname;
                }
            } else if ((link = jQuery(target).parents('a').first()).length) {
                const targetUrl: URL = new URL((link.get(0) as HTMLAnchorElement).href);
        
                // Only act if we remain on the same domain
                if (targetUrl.origin === currentUrl.origin) {
                    newPath = targetUrl.pathname;
                }
            }

            if (newPath === location.pathname) {
                if (config.enableDebug) console.warn('Ignoring navigation to same path');
                event.preventDefault();
                return false;
            }
            
            if (newPath) {
                if (config.basePath && newPath.substr(0, config.basePath.length) === config.basePath) {
                    newPath = newPath.substr(config.basePath.length);
                    if (newPath.substr(0, 1) !== '/') newPath = '/' + newPath; // Ensure we've an absolute path
                }
                history.push(newPath);
                event.preventDefault();
                return false;
            }
        }

        jQuery(window).on('click', onWindowClick)
        return () => {
            jQuery(window).off('click', onWindowClick);
        }
    });

    return props.children as React.ReactElement;
}

export interface RoutedContentProps extends SwitchProps
{
    keyPrefix ?:    string,
    config ?:       IRouteConfig,
    basePath ?:     string
}
export const RoutedContent : React.FunctionComponent<RoutedContentProps> = (props) => {
    const switchProps : SwitchProps = {
        location: props.location
    }
    return <Switch {...switchProps}>
        { props.children }
        { (props.config || []).map( (item, idx) => createRouteNode(item, props.basePath, `${props.keyPrefix}-route-${idx}`) ) }
    </Switch>
}

function createRouteNode(route: IRouteConfigItem, basePath : string = "", key ?: string) : React.ReactElement<RouteProps> {
    
    let createdRoute : string = basePath ? (basePath.substr(-1) === "/" ? basePath.substr(0, -1) : basePath) : "";
    createdRoute = createdRoute + "/" + (route.path ? (route.path.substr(0,1) === "/" ? route.path.substr(1) : route.path) : "")

    console.log('Generating Route Virtual DOM Node', createdRoute, route, key);
    const newRouteProps : RouteProps = {
        children: route.children,
        exact: route.exact,
        location: route.location,
        path: createdRoute,
        sensitive: route.sensitive,
        strict: route.strict,
        render: (props: RouteComponentProps) : React.ReactNode => {
            console.log('Executing Route Node', route, key, props);
            if (route.render) return route.render({ ...props, routes: route.routes, path: route.path });
            if (route.component) {
                const RouteComponent = route.component;
                return <RouteComponent { ...props } routes={ route.routes } path={ route.path } />
            }
        }
    }
    return <Route { ...newRouteProps } key={ key } />
}