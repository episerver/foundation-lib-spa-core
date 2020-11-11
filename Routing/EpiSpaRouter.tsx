import React, { useEffect } from 'react';
import { StaticRouter, StaticRouterProps, useHistory, useLocation, Switch, SwitchProps, Route, RouteProps, RouteComponentProps } from 'react-router';
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom';
import IRouteConfig, { IRouteConfigItem } from './IRouteConfig';
import { useEpiserver, Core } from '../index';

export interface RouterProps extends StaticRouterProps, BrowserRouterProps {}
export const Router : React.FunctionComponent<RouterProps> = (props) =>
{
    const epi = useEpiserver();

    if (epi.isServerSideRendering()) {
        const staticRouterProps : StaticRouterProps = {
            basename: props.basename,
            context: props.context,
            location: props.location
        };
        return <StaticRouter {...staticRouterProps}>{ props.children }</StaticRouter>
    }

    const browserRouterProps : BrowserRouterProps = {
        basename: props.basename,
        forceRefresh: props.forceRefresh,
        getUserConfirmation: props.getUserConfirmation,
        keyLength: props.keyLength
    };
    return <BrowserRouter {...browserRouterProps}><ElementNavigation>{ props.children }</ElementNavigation></BrowserRouter>
}
export default Router;

const ElementNavigation : React.FunctionComponent<{}> = (props) : React.ReactElement => {
    const history = useHistory();
    const location = useLocation();
    const epi = useEpiserver();
    const config = epi.config();

    useEffect(() => {
        if (epi.isInEditMode() || epi.isServerSideRendering()) {
            if (config.enableDebug) console.info('ElementNavigation: Edit mode, or SSR, so not attaching events');
            return;
        }
        const onWindowClick = (event: MouseEvent) => {
            const target: HTMLElement = (event.target as any) as HTMLElement;
            const currentUrl: URL = new URL(window.location.href);
            let newPath: string = '';

            // Loop parents till we find the link
            let link = target;
            while (link.parentElement && link.tagName.toLowerCase() !== 'a') link = link.parentElement;

            // If we have a link, see if we need to navigate
            if (link.tagName.toLowerCase() === 'a') {
                const targetUrl: URL = new URL((link as HTMLAnchorElement).href, currentUrl);

                // Only act if we remain on the same domain
                if (targetUrl.origin === currentUrl.origin) {
                    newPath = targetUrl.pathname;
                }
            }

            // Do not navigate to the same page
            if (newPath === location.pathname) {
                if (config.enableDebug) console.info('ElementNavigation: Ignoring navigation to same path');
                event.preventDefault();
                return false;
            }
            
            // Navigate to the new path
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

        if (epi.isDebugActive()) console.info('ElementNavigation: Attaching listener');
        document.addEventListener('click', onWindowClick)
        return () => {
            if (epi.isDebugActive()) console.info('ElementNavigation: Removing listener');
            document.removeEventListener('click', onWindowClick);
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
    const ctx = useEpiserver();
    const switchProps : SwitchProps = {
        location: props.location
    }
    return <Switch {...switchProps}>
        { props.children }
        { (props.config || []).map( (item, idx) => createRouteNode(item, props.basePath, `${props.keyPrefix}-route-${idx}`, ctx) ) }
    </Switch>
}

function createRouteNode(route: IRouteConfigItem, basePath : string = "", key ?: string, ctx ?: Core.IEpiserverContext) : React.ReactElement<RouteProps> {
    
    let createdRoute : string = basePath ? (basePath.substr(-1) === "/" ? basePath.substr(0, -1) : basePath) : "";
    createdRoute = createdRoute + "/" + (route.path ? (route.path.substr(0,1) === "/" ? route.path.substr(1) : route.path) : "")

    if (ctx?.isDebugActive()) console.log('Generating Route Virtual DOM Node', createdRoute, route, key);
    const newRouteProps : RouteProps = {
        children: route.children,
        exact: route.exact,
        location: route.location,
        path: createdRoute,
        sensitive: route.sensitive,
        strict: route.strict,
        render: (props: RouteComponentProps) : React.ReactNode => {
            if (ctx?.isDebugActive()) console.log('Executing Route Node', route, key, props);
            if (route.render) return route.render({ ...props, routes: route.routes, path: route.path });
            if (route.component) {
                const RouteComponent = route.component;
                return <RouteComponent { ...props } routes={ route.routes } path={ route.path } />
            }
        }
    }
    return <Route { ...newRouteProps } key={ key } />
}