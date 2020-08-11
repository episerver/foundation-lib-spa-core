"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutedContent = exports.Router = void 0;
var react_1 = __importStar(require("react"));
var jQuery_1 = __importDefault(require("jQuery"));
var react_router_1 = require("react-router");
var react_router_dom_1 = require("react-router-dom");
var index_1 = require("../index");
exports.Router = function (props) {
    var epi = index_1.useEpiserver();
    if (epi.isServerSideRendering()) {
        var RouterProps_1 = {
            basename: props.basename,
            context: props.context,
            location: props.location
        };
        return react_1.default.createElement(react_router_1.StaticRouter, __assign({}, RouterProps_1), props.children);
    }
    var RouterProps = {
        basename: props.basename,
        forceRefresh: props.forceRefresh,
        getUserConfirmation: props.getUserConfirmation,
        keyLength: props.keyLength
    };
    return react_1.default.createElement(react_router_dom_1.BrowserRouter, __assign({}, RouterProps),
        react_1.default.createElement(ElementNavigation, null, props.children));
};
exports.default = exports.Router;
;
var ElementNavigation = function (props) {
    var history = react_router_1.useHistory();
    var location = react_router_1.useLocation();
    var epi = index_1.useEpiserver();
    var config = epi.config();
    if (!(epi.isInEditMode() || epi.isServerSideRendering()))
        react_1.useEffect(function () {
            var onWindowClick = function (event) {
                var target = event.target;
                var currentUrl = new URL(window.location.href);
                var link;
                var newPath = '';
                if (target.tagName.toLowerCase() == 'a') {
                    var targetUrl = new URL(target.href);
                    // Only act if we remain on the same domain
                    if (targetUrl.origin === currentUrl.origin) {
                        newPath = targetUrl.pathname;
                    }
                }
                else if ((link = jQuery_1.default(target).parents('a').first()).length) {
                    var targetUrl = new URL(link.get(0).href);
                    // Only act if we remain on the same domain
                    if (targetUrl.origin === currentUrl.origin) {
                        newPath = targetUrl.pathname;
                    }
                }
                if (newPath === location.pathname) {
                    if (config.enableDebug)
                        console.warn('Ignoring navigation to same path');
                    event.preventDefault();
                    return false;
                }
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
            jQuery_1.default(window).on('click', onWindowClick);
            return function () {
                jQuery_1.default(window).off('click', onWindowClick);
            };
        });
    return props.children;
};
exports.RoutedContent = function (props) {
    var switchProps = {
        location: props.location
    };
    return react_1.default.createElement(react_router_1.Switch, __assign({}, switchProps),
        props.children,
        (props.config || []).map(function (item, idx) { return createRouteNode(item, props.basePath, props.keyPrefix + "-route-" + idx); }));
};
function createRouteNode(route, basePath, key) {
    if (basePath === void 0) { basePath = ""; }
    var createdRoute = basePath ? (basePath.substr(-1) === "/" ? basePath.substr(0, -1) : basePath) : "";
    createdRoute = createdRoute + "/" + (route.path ? (route.path.substr(0, 1) === "/" ? route.path.substr(1) : route.path) : "");
    console.log('Generating Route Virtual DOM Node', createdRoute, route, key);
    var newRouteProps = {
        children: route.children,
        exact: route.exact,
        location: route.location,
        path: createdRoute,
        sensitive: route.sensitive,
        strict: route.strict,
        render: function (props) {
            console.log('Executing Route Node', route, key, props);
            if (route.render)
                return route.render(__assign(__assign({}, props), { routes: route.routes, path: route.path }));
            if (route.component) {
                var RouteComponent = route.component;
                return react_1.default.createElement(RouteComponent, __assign({}, props, { routes: route.routes, path: route.path }));
            }
        }
    };
    return react_1.default.createElement(react_router_1.Route, __assign({}, newRouteProps, { key: key }));
}
