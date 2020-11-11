"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutedContent = exports.Router = void 0;
const react_1 = __importStar(require("react"));
const react_router_1 = require("react-router");
const react_router_dom_1 = require("react-router-dom");
const index_1 = require("../index");
exports.Router = (props) => {
    const epi = index_1.useEpiserver();
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
    return react_1.default.createElement(react_router_dom_1.BrowserRouter, Object.assign({}, browserRouterProps),
        react_1.default.createElement(ElementNavigation, null, props.children));
};
exports.default = exports.Router;
const ElementNavigation = (props) => {
    const history = react_router_1.useHistory();
    const location = react_router_1.useLocation();
    const epi = index_1.useEpiserver();
    const config = epi.config();
    react_1.useEffect(() => {
        if (epi.isInEditMode() || epi.isServerSideRendering()) {
            if (config.enableDebug)
                console.info('ElementNavigation: Edit mode, or SSR, so not attaching events');
            return;
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
                    console.info('ElementNavigation: Ignoring navigation to same path');
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
        if (epi.isDebugActive())
            console.info('ElementNavigation: Attaching listener');
        document.addEventListener('click', onWindowClick);
        return () => {
            if (epi.isDebugActive())
                console.info('ElementNavigation: Removing listener');
            document.removeEventListener('click', onWindowClick);
        };
    });
    return props.children;
};
exports.RoutedContent = (props) => {
    const ctx = index_1.useEpiserver();
    const switchProps = {
        location: props.location
    };
    return react_1.default.createElement(react_router_1.Switch, Object.assign({}, switchProps),
        props.children,
        (props.config || []).map((item, idx) => createRouteNode(item, props.basePath, `${props.keyPrefix}-route-${idx}`, ctx)));
};
function createRouteNode(route, basePath = "", key, ctx) {
    let createdRoute = basePath ? (basePath.substr(-1) === "/" ? basePath.substr(0, -1) : basePath) : "";
    createdRoute = createdRoute + "/" + (route.path ? (route.path.substr(0, 1) === "/" ? route.path.substr(1) : route.path) : "");
    if (ctx === null || ctx === void 0 ? void 0 : ctx.isDebugActive())
        console.log('Generating Route Virtual DOM Node', createdRoute, route, key);
    const newRouteProps = {
        children: route.children,
        exact: route.exact,
        location: route.location,
        path: createdRoute,
        sensitive: route.sensitive,
        strict: route.strict,
        render: (props) => {
            if (ctx === null || ctx === void 0 ? void 0 : ctx.isDebugActive())
                console.log('Executing Route Node', route, key, props);
            if (route.render)
                return route.render(Object.assign(Object.assign({}, props), { routes: route.routes, path: route.path }));
            if (route.component) {
                const RouteComponent = route.component;
                return react_1.default.createElement(RouteComponent, Object.assign({}, props, { routes: route.routes, path: route.path }));
            }
        }
    };
    return react_1.default.createElement(react_router_1.Route, Object.assign({}, newRouteProps, { key: key }));
}
