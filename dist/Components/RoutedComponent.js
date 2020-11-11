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
const Context_1 = require("../Hooks/Context");
const EpiComponent_1 = __importDefault(require("./EpiComponent"));
const Spinner_1 = __importDefault(require("./Spinner"));
exports.RoutedComponent = (props) => {
    const epi = Context_1.useEpiserver();
    const repo = Context_1.useIContentRepository();
    const path = props.location.pathname;
    const [iContent, setIContent] = react_1.useState(null);
    react_1.useEffect(() => {
        repo.getByRoute(path).then(c => {
            epi.setRoutedContent(c || undefined);
            setIContent(c);
        });
        return () => { epi.setRoutedContent(); };
    }, [path]);
    if (iContent === null) {
        return Spinner_1.default.CreateInstance({});
    }
    return react_1.default.createElement(EpiComponent_1.default, { contentLink: iContent.contentLink, expandedValue: iContent, path: props.location.pathname });
};
exports.default = exports.RoutedComponent;
