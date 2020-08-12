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
exports.EpiserverWebsite = void 0;
// Import libraries
var react_1 = __importStar(require("react"));
var react_helmet_1 = require("react-helmet");
var react_redux_1 = require("react-redux");
var Context_1 = __importDefault(require("../Hooks/Context"));
var Layout_1 = __importDefault(require("./Layout"));
// Import Episerver Repositories
var IContent_1 = require("../Repository/IContent");
// Import Episerver Components
var Spinner_1 = __importDefault(require("./Spinner"));
var EpiSpaRouter = __importStar(require("../Routing/EpiSpaRouter"));
exports.EpiserverWebsite = function (props) {
    var _a = react_1.useState(props.context.getCurrentWebsite()), website = _a[0], setWebsite = _a[1];
    var _b = react_1.useState(props.context.getContentByRef("startPage")), homepage = _b[0], setHomepage = _b[1];
    var _c = react_1.useState(props.context.getCurrentPath()), path = _c[0], setPath = _c[1];
    var _d = react_1.useState(props.context.getContentByPath(path)), firstpage = _d[0], setFirstPage = _d[1];
    var _e = react_1.useState(website === null || homepage === null), isInitializing = _e[0], setIsInitializing = _e[1];
    // Load website if needed, only once!
    react_1.useEffect(function () {
        if (!website)
            props.context.loadCurrentWebsite().then(function (w) { if (w) {
                setWebsite(w);
                setIsInitializing(homepage === null);
            } });
    }, []);
    // Load homepage if needed, only when the website changes
    react_1.useEffect(function () {
        props.context.loadContentByRef("startPage").then(function (c) {
            if (c) {
                props.context.dispatch(IContent_1.IContentActionFactory.registerPaths(c, ['/'])); // Ensure the start page is bound to '/';
                setHomepage(c);
                setIsInitializing(website === null);
            }
        });
    }, [website]);
    // Load current page
    react_1.useEffect(function () {
        props.context.loadContentByPath(path).then(function (c) {
            if (c) {
                if (c.contentLink.url !== path)
                    props.context.dispatch(IContent_1.IContentActionFactory.registerPaths(c, [path])); // Ensure the page is bound to the current path;
                setFirstPage(c);
            }
        });
    }, [path, website, homepage]);
    // If we're initializing, return a spinner
    if (isInitializing) {
        return Spinner_1.default.CreateInstance({ key: 'Episerver-Loading' });
    }
    // If we're server side rendering, ignore the connected components
    if (props.context.isServerSideRendering()) {
        var ServerLayout = getLayout(props.context.config());
        return react_1.default.createElement(Context_1.default.Provider, { value: props.context },
            react_1.default.createElement(EpiSpaRouter.Router, null,
                react_1.default.createElement(react_helmet_1.Helmet, null),
                react_1.default.createElement(ServerLayout, { context: props.context, page: firstpage === null || firstpage === void 0 ? void 0 : firstpage.contentLink, expandedValue: firstpage || undefined, path: path, startPage: homepage || undefined },
                    react_1.default.createElement(EpiSpaRouter.RoutedContent, { config: props.context.config().routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                    props.children)));
    }
    var BrowserLayout = react_redux_1.connect(buildLayoutPropsFromState)(getLayout(props.context.config()));
    return react_1.default.createElement(react_redux_1.Provider, { store: props.context.getStore() },
        react_1.default.createElement(Context_1.default.Provider, { value: props.context },
            react_1.default.createElement(EpiSpaRouter.Router, null,
                react_1.default.createElement(react_helmet_1.Helmet, null),
                react_1.default.createElement(BrowserLayout, { context: props.context, page: firstpage === null || firstpage === void 0 ? void 0 : firstpage.contentLink, expandedValue: firstpage || undefined, path: path, startPage: homepage || undefined },
                    react_1.default.createElement(EpiSpaRouter.RoutedContent, { config: props.context.config().routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                    props.children))));
};
function getLayout(config) {
    return config.layout || Layout_1.default;
}
function buildLayoutPropsFromState(state, ownProps) {
    try {
        var path = state.ViewContext.currentPath || '';
        var idx = state.iContentRepo.paths[path];
        if (!idx) {
            return __assign(__assign({}, ownProps), { path: path, page: undefined, expandedValue: undefined, startPage: undefined });
        }
        var contentLink = void 0;
        var contentItem = void 0;
        var startPage = void 0;
        contentItem = state.iContentRepo.items[idx].content;
        contentLink = contentItem.contentLink;
        var startIdx = state.iContentRepo.refs.startPage;
        if (startIdx && state.iContentRepo.items[startIdx]) {
            startPage = state.iContentRepo.items[startIdx].content;
        }
        var newProps = __assign(__assign({}, ownProps), { page: contentLink, expandedValue: contentItem, path: path,
            startPage: startPage });
        return newProps;
    }
    catch (e) {
        // Ignore layout property building errors
    }
    return ownProps;
}
exports.default = exports.EpiserverWebsite;
