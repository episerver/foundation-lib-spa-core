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
exports.RoutedComponent = void 0;
var react_1 = __importStar(require("react"));
var react_redux_1 = require("react-redux");
var index_1 = require("../index");
var ContentLink_1 = require("../Models/ContentLink");
var EpiComponent_1 = __importDefault(require("./EpiComponent"));
var Spinner_1 = __importDefault(require("./Spinner"));
function RoutedComponent(props) {
    var epi = index_1.useEpiserver();
    var path = props.location.pathname;
    var _a = react_1.useState(null), iContent = _a[0], setIContent = _a[1];
    react_1.useEffect(function () {
        var newContent = epi.getContentByPath(path);
        if (!newContent) {
            epi.loadContentByPath(path).then(function (c) {
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
        var myProps = {
            contentLink: iContent.contentLink,
            context: epi,
            expandedValue: iContent,
            path: props.location.pathname
        };
        var ConnectedEpiComponent = react_redux_1.connect(function (state, baseProps) {
            var repoContentId = ContentLink_1.ContentLinkService.createApiId(baseProps.contentLink);
            if (state.iContentRepo.items[repoContentId]) {
                return Object.assign({}, baseProps, {
                    expandedValue: state.iContentRepo.items[repoContentId].content
                });
            }
            return baseProps;
        })(EpiComponent_1.default);
        return react_1.default.createElement(ConnectedEpiComponent, __assign({}, myProps));
    }
}
exports.RoutedComponent = RoutedComponent;
exports.default = RoutedComponent;
