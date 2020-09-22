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
exports.LazyComponent = void 0;
const react_1 = __importStar(require("react"));
const Spinner_1 = __importDefault(require("./Spinner"));
const index_1 = require("../index");
function LazyComponent(props, context) {
    const epi = index_1.useEpiserver();
    const [loadedComponent, setLoadedComponent] = react_1.useState(undefined);
    react_1.useEffect(() => { epi.componentLoader().LoadComponent(props.component, props).then(c => setLoadedComponent(c)); }, [props]);
    if (typeof (loadedComponent) === "undefined") {
        return props.noSpinner ? null : Spinner_1.default.CreateInstance({});
    }
    return react_1.default.createElement(LazyComponentErrorBoundary, null, loadedComponent);
}
exports.LazyComponent = LazyComponent;
class LazyComponentErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error('LazyComponentErrorBoundary caught error', error, errorInfo);
        // You can also log the error to an error reporting service
        //logErrorToMyService(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return react_1.default.createElement("div", { className: "alert alert-danger" }, "Uncaught error in lazy loaded component");
        }
        return this.props.children;
    }
}
exports.default = LazyComponent;
