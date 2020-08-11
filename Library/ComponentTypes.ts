import DefaultAbstractComponent, { ComponentProps as _ComponentProps } from '../EpiComponent';
import IContent from '../Models/IContent';
import { SpinnerInstance, SpinnerProps } from '../Components/Spinner';

export const AbstractComponent = DefaultAbstractComponent;
export type AbstractComponentProps<T extends IContent = IContent> = _ComponentProps<T>;
export type Spinner<P extends SpinnerProps = SpinnerProps> = SpinnerInstance<P>;