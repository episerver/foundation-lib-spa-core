/// <reference types="react" />
import DefaultProperty from '../Components/Property';
import DefaultLink from '../Components/Link';
import DefaultLazyComponent from '../Components/LazyComponent';
import DefaultContentArea from '../Components/ContentArea';
import DefaultSpinner from '../Components/Spinner';
import DefaultPage from '../Page';
export declare const Property: typeof DefaultProperty;
export declare const Link: typeof DefaultLink;
export declare const LazyComponent: typeof DefaultLazyComponent;
export declare const ContentArea: typeof DefaultContentArea;
export declare const EpiserverContent: import("../Components/EpiComponent").EpiComponentType<import("../Models/IContent").default>;
export declare const Site: import("react").FunctionComponent<import("../Components/CmsSite").CmsSiteProps>;
export declare const Spinner: typeof DefaultSpinner;
export declare const Page: typeof DefaultPage;
