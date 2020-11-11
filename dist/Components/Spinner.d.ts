import { Component, ReactNode, ComponentType, ReactElement } from 'react';
/**
 * Interface definition of the instance type of a Spinner
 * component.
 */
export declare type SpinnerComponent<P extends SpinnerProps = SpinnerProps> = ComponentType<P>;
export declare type SpinnerInstance<P extends SpinnerProps = SpinnerProps> = ReactElement<P>;
/**
 * The property definition for a spinner
 */
export declare type SpinnerProps = {};
export default class Spinner extends Component<SpinnerProps> {
    /**
     * Create a new instance of a spinner component, used to mark
     * the loading state of the application.
     *
     * @param 	props 	The properties of the spinner
     */
    static CreateInstance(props: SpinnerProps): SpinnerInstance | null;
    render(): ReactNode;
}
