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
exports.RoutedComponent = void 0;
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const index_1 = require("../index");
const ContentLink_1 = require("../Models/ContentLink");
const EpiComponent_1 = __importDefault(require("./EpiComponent"));
const Spinner_1 = __importDefault(require("./Spinner"));
function RoutedComponent(props) {
    const epi = index_1.useEpiserver();
    const path = props.location.pathname;
    const [iContent, setIContent] = react_1.useState(null);
    react_1.useEffect(() => {
        const newContent = epi.getContentByPath(path);
        if (!newContent) {
            epi.loadContentByPath(path).then((c) => {
                setIContent(c);
            });
        }
        else {
            setIContent(newContent);
        }
    }, [props.location]);
    if (iContent === null) {
        return Spinner_1.default.CreateInstance({});
    }
    else if (epi.isServerSideRendering()) {
        return react_1.default.createElement(EpiComponent_1.default, { contentLink: iContent.contentLink, context: epi, expandedValue: iContent, path: props.location.pathname });
    }
    else {
        const myProps = {
            contentLink: iContent.contentLink,
            context: epi,
            expandedValue: iContent,
            path: props.location.pathname
        };
        const ConnectedEpiComponent = react_redux_1.connect((state, baseProps) => {
            const repoContentId = ContentLink_1.ContentLinkService.createApiId(baseProps.contentLink);
            if (state.iContentRepo.items[repoContentId]) {
                return Object.assign({}, baseProps, {
                    expandedValue: state.iContentRepo.items[repoContentId].content
                });
            }
            return baseProps;
        })(EpiComponent_1.default);
        return react_1.default.createElement(ConnectedEpiComponent, Object.assign({}, myProps));
    }
}
exports.RoutedComponent = RoutedComponent;
exports.default = RoutedComponent;
