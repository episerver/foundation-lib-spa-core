// Components
import DefaultProperty, { PropertyProps} from '../Components/Property';
import DefaultLink from '../Components/Link';
import DefaultLazyComponent from '../Components/LazyComponent';
import DefaultContentArea from '../Components/ContentArea';
import DefaultEpiComponent from '../Components/EpiComponent';
import DefaultCmsSite from '../Components/CmsSite';
import DefaultSpinner from '../Components/Spinner';
import DefaultPage from '../Page';

// Library
import IContent from '../Models/IContent'
import { PropsWithChildren, ReactElement } from 'react';

export function Property<T extends IContent>(props: PropsWithChildren<PropertyProps<T>>) : ReactElement<any, any> | null { return DefaultProperty(props); }
export const Link = DefaultLink;
export const LazyComponent = DefaultLazyComponent;
export const ContentArea = DefaultContentArea;
export const EpiserverContent = DefaultEpiComponent;
export const Site = DefaultCmsSite;
export const Spinner = DefaultSpinner;
export const Page = DefaultPage;
export type PropertyComponent<T extends IContent> = React.FunctionComponent<PropertyProps<T>>;