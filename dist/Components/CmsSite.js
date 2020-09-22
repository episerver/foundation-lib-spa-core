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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpiserverWebsite = void 0;
// Import libraries
const react_1 = __importStar(require("react"));
const react_helmet_1 = require("react-helmet");
const react_redux_1 = require("react-redux");
const Context_1 = __importDefault(require("../Hooks/Context"));
const Layout_1 = __importDefault(require("./Layout"));
// Import Episerver Repositories
const IContent_1 = require("../Repository/IContent");
// Import Episerver Components
const Spinner_1 = __importDefault(require("./Spinner"));
const EpiSpaRouter = __importStar(require("../Routing/EpiSpaRouter"));
exports.EpiserverWebsite = (props) => {
    const [website, setWebsite] = react_1.useState(props.context.getCurrentWebsite());
    const [homepage, setHomepage] = react_1.useState(props.context.getContentByRef("startPage"));
    const [path, setPath] = react_1.useState(props.context.getCurrentPath());
    const [firstpage, setFirstPage] = react_1.useState(props.context.getContentByPath(path));
    const [isInitializing, setIsInitializing] = react_1.useState(website === null || homepage === null);
    // Load website if needed, only once!
    react_1.useEffect(() => {
        if (!website)
            props.context.loadCurrentWebsite().then(w => { if (w) {
                setWebsite(w);
                setIsInitializing(homepage === null);
            } });
    }, []);
    // Load homepage if needed, only when the website changes
    react_1.useEffect(() => {
        props.context.loadContentByRef("startPage").catch(c => undefined).then(c => {
            if (c) {
                props.context.dispatch(IContent_1.IContentActionFactory.registerPaths(c, ['/'])); // Ensure the start page is bound to '/';
                setHomepage(c);
                setIsInitializing(website === null);
            }
        });
    }, [website]);
    // Load current page
    react_1.useEffect(() => {
        props.context.loadContentByPath(path).then(c => {
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
        const ServerLayout = getLayout(props.context.config());
        return react_1.default.createElement(Context_1.default.Provider, { value: props.context },
            react_1.default.createElement(EpiSpaRouter.Router, null,
                react_1.default.createElement(react_helmet_1.Helmet, null),
                react_1.default.createElement(ServerLayout, { context: props.context, page: firstpage === null || firstpage === void 0 ? void 0 : firstpage.contentLink, expandedValue: firstpage || undefined, path: path, startPage: homepage || undefined },
                    react_1.default.createElement(EpiSpaRouter.RoutedContent, { config: props.context.config().routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                    props.children)));
    }
    const BrowserLayout = react_redux_1.connect(buildLayoutPropsFromState)(getLayout(props.context.config()));
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
        const path = state.ViewContext.currentPath || '';
        const idx = state.iContentRepo.paths[path];
        if (!idx) {
            return Object.assign(Object.assign({}, ownProps), { path, page: undefined, expandedValue: undefined, startPage: undefined });
        }
        let contentLink;
        let contentItem;
        let startPage;
        contentItem = state.iContentRepo.items[idx].content;
        contentLink = contentItem.contentLink;
        const startIdx = state.iContentRepo.refs.startPage;
        if (startIdx && state.iContentRepo.items[startIdx]) {
            startPage = state.iContentRepo.items[startIdx].content;
        }
        const newProps = Object.assign(Object.assign({}, ownProps), { page: contentLink, expandedValue: contentItem, path,
            startPage });
        return newProps;
    }
    catch (e) {
        // Ignore layout property building errors
    }
    return ownProps;
}
exports.default = exports.EpiserverWebsite;
