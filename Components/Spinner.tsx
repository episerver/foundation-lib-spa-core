import React, { Component, ReactNode, ComponentType, ReactElement } from 'react';
import EpiContext from '../Spa';

/**
 * Interface definition of the instance type of a Spinner
 * component.
 */
export type SpinnerComponent<P extends SpinnerProps = SpinnerProps> = ComponentType<P>
export type SpinnerInstance<P extends SpinnerProps = SpinnerProps> = ReactElement<P>

/**
 * The property definition for a spinner
 */
export type SpinnerProps = {}

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
		if (!EpiContext.config().enableSpinner) return null;
		const SpinnerType : ComponentType<SpinnerProps> = EpiContext.config().spinner || Spinner;
		return React.createElement<SpinnerProps>(SpinnerType, props);
	}

	render() : ReactNode {
		return <div className="alert alert-secondary" role="alert">
			<div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>
			Loading...
		</div>;
	}
}