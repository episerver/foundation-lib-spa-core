"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.LazyComponent = void 0;
var react_1 = __importStar(require("react"));
var Spinner_1 = __importDefault(require("./Spinner"));
var index_1 = require("../index");
function LazyComponent(props, context) {
    var epi = index_1.useEpiserver();
    var _a = react_1.useState(undefined), loadedComponent = _a[0], setLoadedComponent = _a[1];
    react_1.useEffect(function () { epi.componentLoader().LoadComponent(props.component, props).then(function (c) { return setLoadedComponent(c); }); }, [props]);
    if (typeof (loadedComponent) === "undefined") {
        return props.noSpinner ? null : Spinner_1.default.CreateInstance({});
    }
    return react_1.default.createElement(LazyComponentErrorBoundary, null, loadedComponent);
}
exports.LazyComponent = LazyComponent;
var LazyComponentErrorBoundary = /** @class */ (function (_super) {
    __extends(LazyComponentErrorBoundary, _super);
    function LazyComponentErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { hasError: false };
        return _this;
    }
    LazyComponentErrorBoundary.getDerivedStateFromError = function (error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    };
    LazyComponentErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        console.error('LazyComponentErrorBoundary caught error', error, errorInfo);
        // You can also log the error to an error reporting service
        //logErrorToMyService(error, errorInfo);
    };
    LazyComponentErrorBoundary.prototype.render = function () {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return react_1.default.createElement("div", { className: "alert alert-danger" }, "Uncaught error in lazy loaded component");
        }
        return this.props.children;
    };
    return LazyComponentErrorBoundary;
}(react_1.default.Component));
exports.default = LazyComponent;
