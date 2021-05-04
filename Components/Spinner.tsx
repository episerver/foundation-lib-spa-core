import React, { ComponentType, ReactElement, useState, useEffect, useCallback } from 'react';
import { useEpiserver } from '../Hooks/Context';
import EpiContext from '../Spa';

/**
 * The property definition for a spinner
 */
export type SpinnerProps = {
	timeout?: number
}

/**
 * Interface definition of the instance type of a Spinner
 * component.
 */
export type SpinnerComponent<P extends SpinnerProps = SpinnerProps> = ComponentType<P>
export type SpinnerInstance<P extends SpinnerProps = SpinnerProps> = ReactElement<P> | null
export type CoreSpinnerComponent = SpinnerComponent<SpinnerProps> & {
	createInstance: <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => SpinnerInstance<InstanceProps>
	CreateInstance: <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => SpinnerInstance<InstanceProps>
}

/**
 * Default spinner component, it will show either the children or the default 
 * spinner. It has full support for a timeout before showing the spinner, to 
 * prevent "jumpiness" the page due to spinners showing and hiding.
 * 
 * @param props Spinner configuration
 * @returns The spinner
 */
const DefaultSpinner : CoreSpinnerComponent = (props) => {
	const cfg = useEpiserver().config();
	const timeout = useCallback(() => { return props.timeout || cfg?.spinnerTimeout || 0; }, [ props.timeout, cfg?.spinnerTimeout ])();
	const [isVisible, setIsVisible] = useState<boolean>(timeout === 0);

	useEffect(() => {
		if (timeout === 0) return;
		if (cfg?.enableSpinner !== true) return;
		setIsVisible(false);
		const timeoutHandle = setTimeout(() => { setIsVisible(true) }, timeout);
		return () => {
			clearTimeout(timeoutHandle)
		}
	}, [ cfg, timeout ]);

	if (cfg?.enableSpinner && isVisible) {
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

DefaultSpinner.displayName = "Default spinner";

/**
 * Create a spinner instance that can be returned from a component
 * 
 * @deprecated	Use createSpinner instead
 * @param 		props 	The props for the spinner
 * @returns 	The spinner element
 */
DefaultSpinner.CreateInstance = DefaultSpinner.createInstance = <InstanceProps extends SpinnerProps = SpinnerProps>(props: InstanceProps) => {
	if (!EpiContext.config().enableSpinner) return null;
	const SpinnerType : SpinnerComponent<InstanceProps> = (EpiContext.config().spinner || DefaultSpinner) as SpinnerComponent<InstanceProps>;
	return <SpinnerType {...props} />
}

export const Spinner : SpinnerComponent = (props) =>
{
	const cfg = useEpiserver().config();
	if (cfg.enableSpinner !== true) return null;
	const SpinnerType = cfg.spinner || DefaultSpinner;
	return <SpinnerType { ...props } />
}
Spinner.displayName = "Spinner wrapper"

export default DefaultSpinner;