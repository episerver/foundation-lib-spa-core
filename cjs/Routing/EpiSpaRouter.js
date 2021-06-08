"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutedContent = exports.Router = void 0;
const react_1 = require("react");
const react_router_1 = require("react-router");
const react_router_dom_1 = require("react-router-dom");
const Context_1 = require("../Hooks/Context");
const Router = (props) => {
    const epi = Context_1.useEpiserver();
    if (epi.isServerSideRendering()) {
        const staticRouterProps = {
            basename: props.basename,
            context: props.context,
            location: props.location
        };
        return react_1.default.createElement(react_router_1.StaticRouter, Object.assign({}, staticRouterProps), props.children);
    }
    const browserRouterProps = {
        basename: props.basename,
        forceRefresh: props.forceRefresh,
        getUserConfirmation: props.getUserConfirmation,
        keyLength: props.keyLength
    };
    if (epi.isInEditMode() || epi.isEditable())
        return react_1.default.createElement(react_router_dom_1.BrowserRouter, Object.assign({}, browserRouterProps), props.children);
    return react_1.default.createElement(react_router_dom_1.BrowserRouter, Object.assign({}, browserRouterProps),
        react_1.default.createElement(ElementNavigation, null, props.children));
};
exports.Router = Router;
exports.Router.displayName = "Optimizely CMS: Router";
exports.default = exports.Router;
const ElementNavigation = (props) => {
    const history = react_router_1.useHistory();
    const location = react_router_1.useLocation();
    const epi = Context_1.useEpiserver();
    const config = epi.config();
    react_1.useEffect(() => {
        if (epi.isInEditMode() || epi.isServerSideRendering()) {
            if (epi.isDebugActive())
                console.debug('ElementNavigation: Edit mode, or SSR, so not attaching events');
            return;
        }
        else {
            if (epi.isDebugActive())
                console.debug('ElementNavigation: Enabling catch-all click handling for navigation');
        }
        const onWindowClick = (event) => {
            const target = event.target;
            const currentUrl = new URL(window.location.href);
            let newPath = '';
            // Loop parents till we find the link
            let link = target;
            while (link.parentElement && link.tagName.toLowerCase() !== 'a')
                link = link.parentElement;
            // If we have a link, see if we need to navigate
            if (link.tagName.toLowerCase() === 'a') {
                const targetUrl = new URL(link.href, currentUrl);
                // Only act if we remain on the same domain
                if (targetUrl.origin === currentUrl.origin) {
                    newPath = targetUrl.pathname;
                }
            }
            // Do not navigate to the same page
            if (newPath === location.pathname) {
                if (config.enableDebug)
                    console.debug('ElementNavigation: Ignoring navigation to same path');
                event.preventDefault();
                return false;
            }
            // Navigate to the new path
            if (newPath) {
                if (config.basePath && newPath.substr(0, config.basePath.length) === config.basePath) {
                    newPath = newPath.substr(config.basePath.length);
                    if (newPath.substr(0, 1) !== '/')
                        newPath = '/' + newPath; // Ensure we've an absolute path
                }
                history.push(newPath);
                event.preventDefault();
                return false;
            }
        };
        try {
            window.scrollTo(0, 0);
        }
        catch (e) {
            if (epi.isDebugActive())
                console.warn('ElementNavigation: Failed to scroll to top');
        }
        document.addEventListener('click', onWindowClick);
        return () => {
            if (epi.isDebugActive())
                console.debug('ElementNavigation: Removing catch-all click handling for navigation');
            document.removeEventListener('click', onWindowClick);
        };
    });
    return props.children;
};
ElementNavigation.displayName = "Optimizely CMS: Generic click event handler";
const RoutedContent = (props) => {
    const ctx = Context_1.useEpiserver();
    const switchProps = { location: props.location };
    return react_1.default.createElement(react_router_1.Switch, Object.assign({}, switchProps),
        props.children,
        (props.config || []).map((item, idx) => createRouteNode(item, props.basePath, `${props.keyPrefix}-route-${idx}`, ctx)));
};
exports.RoutedContent = RoutedContent;
exports.RoutedContent.displayName = "Optimizely CMS: Route container";
function createRouteNode(route, basePath = "", key, ctx) {
    let createdRoute = basePath ? (basePath.substr(-1) === "/" ? basePath.substr(0, -1) : basePath) : "";
    createdRoute = createdRoute + "/" + (route.path ? (route.path.substr(0, 1) === "/" ? route.path.substr(1) : route.path) : "");
    if (ctx === null || ctx === void 0 ? void 0 : ctx.isDebugActive())
        console.debug('Generating Route Virtual DOM Node', createdRoute, route, key);
    const newRouteProps = {
        children: route.children,
        exact: route.exact,
        location: route.location,
        path: createdRoute,
        sensitive: route.sensitive,
        strict: route.strict,
        render: route.render ? (props) => { return route.render ? route.render(Object.assign(Object.assign({}, props), { routes: route.routes, path: route.path })) : react_1.default.createElement("div", null); } : undefined,
        component: route.component ? (props) => { const RouteComponent = route.component || 'div'; return react_1.default.createElement(RouteComponent, Object.assign({}, props, { routes: route.routes, path: route.path })); } : undefined
    };
    return react_1.default.createElement(react_router_1.Route, Object.assign({}, newRouteProps, { key: key }));
}
//# sourceMappingURL=EpiSpaRouter.js.map