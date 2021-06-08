"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyComponent = void 0;
const react_1 = require("react");
const Spinner_1 = require("./Spinner");
const index_1 = require("../index");
const LazyComponent = (props) => {
    const epi = index_1.useEpiserver();
    const [loadedComponent, setLoadedComponent] = react_1.useState(undefined);
    react_1.useEffect(() => { epi.componentLoader().LoadComponent(props.component, props).then(c => setLoadedComponent(c)); }, [props]);
    if (typeof (loadedComponent) === "undefined") {
        return props.noSpinner ? null : Spinner_1.default.CreateInstance(props);
    }
    return react_1.default.createElement(LazyComponentErrorBoundary, null, loadedComponent);
};
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
        // logErrorToMyService(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return react_1.default.createElement("div", { className: "alert alert-danger" }, "Uncaught error in lazy loaded component");
        }
        return this.props.children;
    }
}
exports.default = exports.LazyComponent;
//# sourceMappingURL=LazyComponent.js.map