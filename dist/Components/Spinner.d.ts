import { ComponentType, ReactElement } from 'react';
/**
 * The property definition for a spinner
 */
export declare type SpinnerProps = {
    timeout?: number;
};
/**
 * Interface definition of the instance type of a Spinner
 * component.
 */
export declare type SpinnerComponent<P extends SpinnerProps = SpinnerProps> = ComponentType<P>;
export declare type SpinnerInstance<P extends SpinnerProps = SpinnerProps> = ReactElement<P> | null;
export declare type CoreSpinnerComponent = SpinnerComponent<SpinnerProps> & {
    createInstance: <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => SpinnerInstance<InstanceProps>;
    CreateInstance: <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => SpinnerInstance<InstanceProps>;
};
/**
 * Default spinner component, it will show either the children or the default
 * spinner. It has full support for a timeout before showing the spinner, to
 * prevent "jumpiness" the page due to spinners showing and hiding.
 *
 * @param props Spinner configuration
 * @returns The spinner
 */
declare const DefaultSpinner: CoreSpinnerComponent;
export declare const Spinner: SpinnerComponent;
export default DefaultSpinner;
