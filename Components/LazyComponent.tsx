import React, { useState, useEffect, Component, FunctionComponent, ReactElement, PropsWithChildren } from 'react';
import Spinner, { SpinnerProps } from './Spinner';
import { useEpiserver } from '../index';

export type LazyComponentProps<T = any> = {
    /**
     * The name of the component to load, this is the component path after
     * app/Components/ e.g. a value of CheckoutPage will load the default export
     * of app/Components/CheckoutPage as ReactElement;
     * 
     * @type    string
     */
    component: string

    /**
     * If this property is set on the LazyComponent it will not show a spinner while
     * the referenced component is loading.
     * 
     * @type    boolean
     */
    noSpinner?: boolean
} & SpinnerProps & T;

export const LazyComponent : FunctionComponent<LazyComponentProps> = (props) =>
{
    const epi = useEpiserver();
    const [ loadedComponent, setLoadedComponent ] = useState<ReactElement | undefined>(undefined);
    useEffect(() => { epi.componentLoader().LoadComponent(props.component, props).then(c => setLoadedComponent(c)); }, [props]);
    if (typeof(loadedComponent) === "undefined" ) {
        return props.noSpinner ? null : Spinner.CreateInstance(props);
    }
    return <LazyComponentErrorBoundary>{ loadedComponent }</LazyComponentErrorBoundary>
}

class LazyComponentErrorBoundary extends Component<PropsWithChildren<Record<string, unknown>>, { hasError: boolean }>
{
    constructor(props: PropsWithChildren<Record<string, unknown>>) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
    
    componentDidCatch(error: any, errorInfo: any) {
        console.error('LazyComponentErrorBoundary caught error', error, errorInfo);
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div className="alert alert-danger">Uncaught error in lazy loaded component</div>;
        }
    
        return this.props.children; 
    }
}

export default LazyComponent;