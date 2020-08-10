import React, { Component, ReactNode, ComponentElement, ComponentType } from 'react';
import EpiContext from '../Spa';

/**
 * Interface definition of the instance type of a Spinner
 * component.
 */
export type SpinnerComponent<P extends SpinnerProps = SpinnerProps> = ComponentType<P>;
export type SpinnerInstance<P extends SpinnerProps = SpinnerProps> = ComponentElement<P, any>

/**
 * The property definition for a spinner
 */
export interface SpinnerProps {

}

export default class Spinner extends Component<SpinnerProps>
{
	/**
	 * Create a new instance of a spinner component, used to mark
	 * the loading state of the application.
	 * 
	 * @param 	props 	The properties of the spinner
	 */
	static CreateInstance(props: SpinnerProps) : SpinnerInstance | null
	{
		if (!EpiContext.config().enableSpinner) {
			return null;
		}
		const SpinnerType = EpiContext.config().spinner;
		if (!SpinnerType) {
			return React.createElement(this, props);
		}
		return <SpinnerType {...props} />;
	}

	render() : ReactNode {
		return <div className="alert alert-secondary" role="alert">
			<div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>
			Loading...
		</div>;
	}
}