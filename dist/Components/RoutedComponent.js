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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var index_1 = require("../index");
var EpiComponent_1 = __importDefault(require("./EpiComponent"));
var Spinner_1 = __importDefault(require("./Spinner"));
var RoutedComponent;
(function (RoutedComponent) {
    function render(props) {
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
        else {
            return react_1.default.createElement(EpiComponent_1.default, { contentLink: iContent.contentLink, context: epi, expandedValue: iContent, path: props.location.pathname });
        }
    }
    RoutedComponent.render = render;
})(RoutedComponent || (RoutedComponent = {}));
exports.default = RoutedComponent.render;
