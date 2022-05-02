import React, { useEffect } from 'react';
import { StaticRouter, StaticRouterProps, useHistory, useLocation, Switch, SwitchProps, Route, RouteProps, RouteComponentProps } from 'react-router';
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom';
import IRouteConfig, { IRouteConfigItem } from './IRouteConfig';
import IEpiserverContext from '../Core/IEpiserverContext';
import { useEpiserver } from '../Hooks/Context';

export type RouterProps = StaticRouterProps & BrowserRouterProps;
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

    if (epi.isInEditMode() || epi.isEditable())
        return <BrowserRouter {...browserRouterProps}>{ props.children }</BrowserRouter>

    return <BrowserRouter {...browserRouterProps}><ElementNavigation>{ props.children }</ElementNavigation></BrowserRouter>
}
Router.displayName = "Optimizely CMS: Router";
export default Router;

const ElementNavigation : React.FunctionComponent = (props) : React.ReactElement => {
    const history = useHistory();
    const location = useLocation();
    const epi = useEpiserver();
    const config = epi.config();

    useEffect(() => {
        if (epi.isInEditMode() || epi.isServerSideRendering()) {
            if (epi.isDebugActive()) console.info('ElementNavigation: Edit mode, or SSR, so not attaching events');
            return;
        } else {
            if (epi.isDebugActive()) console.info('ElementNavigation: Enabling catch-all click handling for navigation');
        }
        const onWindowClick = (event: MouseEvent) => {
            const target: HTMLElement = (event.target as any) as HTMLElement;
            const currentUrl: URL = new URL(window.location.href);
            let newPath = '';
            let hash = null;
            // Loop parents till we find the link
            let link = target;
            while (link.parentElement && link.tagName.toLowerCase() !== 'a') link = link.parentElement;

            // If we have a link, see if we need to navigate
            if (link.tagName.toLowerCase() === 'a') {
                const targetUrl: URL = new URL((link as HTMLAnchorElement).href, currentUrl);

                // Only act if we remain on the same domain
                if (targetUrl.origin === currentUrl.origin) {
                    newPath = targetUrl.pathname;
                    hash = targetUrl.hash;
                    let linkElement = (link as HTMLAnchorElement);
                     //support links with _blank on same domain
                     if (linkElement.target && linkElement.target == "_blank"){                        
                        window.open(newPath+hash, "_blank");
                        return false;
                    }
                }
            }

            // Do not navigate to the same page
            if (newPath === location.pathname) {
                if (config.enableDebug) console.info('ElementNavigation: Ignoring navigation to same path');
                if (document && hash){
                    window.location.replace(hash);                    
                    let localHash = hash.slice(1);
                    const element = document.getElementById(localHash);
                    if (element) {
                        element.scrollIntoView();
                    }
                }
                event.preventDefault();
                return false;
            }
            
            // Navigate to the new path
            if (newPath) {
                if (config.basePath && newPath.substr(0, config.basePath.length) === config.basePath) {
                    newPath = newPath.substr(config.basePath.length);
                    if (newPath.substr(0, 1) !== '/') newPath = '/' + newPath; // Ensure we've an absolute path
                }
                if (newPath.indexOf('#') < 0 && hash){
                    newPath = newPath+hash;
                }
                history.push(newPath);
                event.preventDefault();

                return false;
            }
        }

        try {
            window.scrollTo(0,0);
        } catch (e) {
            if (epi.isDebugActive()) console.warn('ElementNavigation: Failed to scroll to top');
        }
        document.addEventListener('click', onWindowClick);
        return () => {
            if (epi.isDebugActive()) console.info('ElementNavigation: Removing catch-all click handling for navigation');
            document.removeEventListener('click', onWindowClick);
        }
    });

    return props.children as React.ReactElement;
}
ElementNavigation.displayName = "Optimizely CMS: Generic click event handler";

export type RoutedContentProps = SwitchProps & {
    keyPrefix ?:    string,
    config ?:       IRouteConfig,
    basePath ?:     string
}

export const RoutedContent : React.FunctionComponent<RoutedContentProps> = (props) => {
    const ctx = useEpiserver();
    const switchProps : SwitchProps = { location: props.location }
    return <Switch {...switchProps}>
        { props.children }
        { (props.config || []).map( (item, idx) => createRouteNode(item, props.basePath, `${props.keyPrefix}-route-${idx}`, ctx) ) }
    </Switch>
}
RoutedContent.displayName = "Optimizely CMS: Route container";

function createRouteNode(route: IRouteConfigItem, basePath = "", key ?: string, ctx ?: IEpiserverContext) : React.ReactElement<RouteProps> {
    
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
        render: route.render ? (props: RouteComponentProps) => { return route.render ? route.render({ ...props, routes: route.routes, path: route.path }) : <div/> } : undefined,
        component: route.component ? (props: RouteComponentProps) => { const RouteComponent = route.component || 'div'; return <RouteComponent { ...props } routes={ route.routes } path={ route.path } />} : undefined
    }
    return <Route { ...newRouteProps } key={ key } />
}
