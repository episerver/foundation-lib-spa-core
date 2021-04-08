import React, { ReactNode, ComponentType, ReactElement, useState, useEffect } from 'react';
import { useEpiserver } from '../Hooks/Context';
import EpiContext from '../Spa';

/**
 * Interface definition of the instance type of a Spinner
 * component.
 */
export type SpinnerComponent<P extends SpinnerProps = SpinnerProps> = ComponentType<P>
export type SpinnerInstance<P extends SpinnerProps = SpinnerProps> = ReactElement<P>
export type CoreSpinnerComponent = SpinnerComponent<SpinnerProps> & {
	createInstance: <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => ReactElement<InstanceProps, any> | null
	CreateInstance: <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => ReactElement<InstanceProps, any> | null
}

/**
 * The property definition for a spinner
 */
export type SpinnerProps = React.PropsWithChildren<{
	timeout?: number
}>

/**
 * Default spinner component, it will show either the children or the default 
 * spinner. It has full support for a timeout before showing the spinner, to 
 * prevent "jumpiness" the page due to spinners showing and hiding.
 * 
 * @param props Spinner configuration
 * @returns The spinner
 */
const Spinner : CoreSpinnerComponent = (props) => {
	var ctx = useEpiserver();
	var timeout = props.timeout || ctx.config().spinnerTimeout || 0;
	var [isVisible, setIsVisible] = useState<boolean>(timeout === 0);
	if (ctx.config().enableSpinner) return null;

	useEffect(() => {
		if (timeout === 0) return;
		setIsVisible(false);
		const timeoutHandle = setTimeout(() => { setIsVisible(true) }, timeout);
		return () => {
			clearTimeout(timeoutHandle)
		}
	}, []);

	if (isVisible) {
		if (props.children) return <div className="spinner">{ props.children }</div>
		return <div className="spinner alert alert-secondary" role="alert">
			<div className="spinner-border text-primary" role="status">
				<span className="sr-only">Loading...</span>
			</div>
			Loading...
		</div>
	}
	return null;
}

Spinner.displayName = "Default spinner";

/**
 * Create a spinner instance that can be returned from a component
 * 
 * @deprecated	Use createSpinner instead
 * @param 		props 	The props for the spinner
 * @returns 	The spinner element
 */
Spinner.CreateInstance = <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => {
	if (!EpiContext.config().enableSpinner) return null;
	const SpinnerType : React.ComponentType<any> = EpiContext.config().spinner || Spinner;
	return <SpinnerType {...props} />
}

/**
 * Create a spinner instance that can be returned from a component
 * 
 * @param 		props 	The props for the spinner
 * @returns 	The spinner element
 */
Spinner.createInstance = <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => {
	if (!EpiContext.config().enableSpinner) return null;
	const SpinnerType : React.ComponentType<any> = EpiContext.config().spinner || Spinner;
	return <SpinnerType {...props} />
}

export default Spinner;