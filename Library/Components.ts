// Library
import React from 'react';
import IContent from '../Models/IContent';
import { PropertyProps } from '../Components/Property';

// Descriptors
export type PropertyComponent<T extends IContent> = React.ComponentType<PropertyProps<T>>;

// Components
export { default as Property} from '../Components/Property';
export { default as Link } from '../Components/Link';
export { default as LazyComponent } from '../Components/LazyComponent';
export { default as ContentArea } from '../Components/ContentArea';
export { default as EpiserverContent } from '../Components/EpiComponent';
export { default as Site } from '../Components/CmsSite';
export { default as Spinner } from '../Components/Spinner';
export { default as Page } from '../Page';