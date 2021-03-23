import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import { useEpiserver } from '../index';
export const LazyComponent = (props) => {
    const epi = useEpiserver();
    const [loadedComponent, setLoadedComponent] = useState(undefined);
    useEffect(() => { epi.componentLoader().LoadComponent(props.component, props).then(c => setLoadedComponent(c)); }, [props]);
    if (typeof (loadedComponent) === "undefined") {
        return props.noSpinner ? null : Spinner.CreateInstance(props);
    }
    return React.createElement(LazyComponentErrorBoundary, null, loadedComponent);
};
class LazyComponentErrorBoundary extends React.Component {
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
            return React.createElement("div", { className: "alert alert-danger" }, "Uncaught error in lazy loaded component");
        }
        return this.props.children;
    }
}
export default LazyComponent;
//# sourceMappingURL=LazyComponent.js.map