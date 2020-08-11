import DefaultAbstractComponent, { ComponentProps as _ComponentProps } from '../EpiComponent';
import IContent from '../Models/IContent';
import { SpinnerInstance, SpinnerProps } from '../Components/Spinner';
export declare const AbstractComponent: typeof DefaultAbstractComponent;
export declare type AbstractComponentProps<T extends IContent = IContent> = _ComponentProps<T>;
export declare type Spinner<P extends SpinnerProps = SpinnerProps> = SpinnerInstance<P>;
