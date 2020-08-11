import React from 'react';
import { SpinnerProps } from './Spinner';
export declare type LazyComponentProps<T = any> = React.PropsWithChildren<{
    /**
     * The name of the component to load, this is the component path after
     * app/Components/ e.g. a value of CheckoutPage will load the default export
     * of app/Components/CheckoutPage as ReactElement;
     *
     * @type    string
     */
    component: string;
    /**
     * If this property is set on the LazyComponent it will not show a spinner while
     * the referenced component is loading.
     *
     * @type    boolean
     */
    noSpinner?: boolean;
} & T>;
export declare function LazyComponent<P>(props: LazyComponentProps<P>, context?: any): React.ReactElement<P | SpinnerProps, any> | null;
export default LazyComponent;
