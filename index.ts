import { Action, AnyAction } from '@reduxjs/toolkit';


import initServer from './InitServer';
import initBrowser from './InitBrowser';
import AppConfig from './AppConfig';
import IServiceContainerBase, { DefaultServices as DefaultServicesBase } from './Core/IServiceContainer';
import DefaultServiceContainerBase from './Core/DefaultServiceContainer';
import IEpiserverContextBase from './Core/IEpiserverContext';
import SSRResponse from './ServerSideRendering/Response';
import Spa from './Spa';
import DefaultEventEngineBase from './Core/DefaultEventEngine';
import IEventEngineBase from './Core/IEventEngine';
import IInitializableModuleBase, { BaseInitializableModule as CoreBaseInitializableModule } from './Core/IInitializableModule';
import IStateReducerInfoBase from './Core/IStateReducerInfo';
import ContentDeliveryAPI, { PathResponse as BasePathResponse, NetworkErrorData as BaseNetworkErrorData, PathResponseIsIContent as BasePathResponseIsIContent } from './ContentDeliveryAPI';

//Routing
import * as RoutingNS from './Routing/EpiSpaRouter';
import IRouteConfigBase, { IRouteConfigItem as IRouteConfigItemBase, IRouteConfigComponentProps as IRouteConfigComponentPropsBase } from './Routing/IRouteConfig';

//Models
import * as IContentNS from './Models/IContent';
import * as ContentLinkNS from './Models/ContentLink';

//Components
import DefaultLayout, { LayoutComponent, LayoutProps, EpiserverLayout, LayoutState } from './Components/Layout';
import DefaultProperty from './Components/Property';
import DefaultLink from './Components/Link';
import DefaultLazyComponent from './Components/LazyComponent';
import DefaultContentArea from './Components/ContentArea';
import DefaultEpiComponent from './Components/EpiComponent';
import DefaultCmsSite from './Components/CmsSite';
import DefaultSpinner from './Components/Spinner';

//Utils
import StringUtils from './Util/StringUtils';

/**
 * Reexport core for ease of referencing
 */
export namespace Core {
    export const DefaultEventEngine = DefaultEventEngineBase;
    export const DefaultServiceContainer = DefaultServiceContainerBase;
    export const DefaultServices = DefaultServicesBase;
    export const BaseInitializableModule = CoreBaseInitializableModule;
    export type IEpiserverContext = IEpiserverContextBase;
    export type IEventEngine = IEventEngineBase;
    export type IInitializableModule = IInitializableModuleBase;
    export type IServiceContainer = IServiceContainerBase;
    export type IStateReducerInfo<S, A extends Action = AnyAction> = IStateReducerInfoBase<S, A>;
    export type IConfig = AppConfig;
}

export namespace ContentDelivery {
    export const PathResponseIsIContent = BasePathResponseIsIContent;
    
    export type API = ContentDeliveryAPI;
    export type NetworkErrorData = BaseNetworkErrorData;
    export type PathResponse = BasePathResponse;
}

/**
 * Generic initialization function, usable for both Browser & Server side rendering
 * 
 * @see     InitServer
 * @see     InitBrowser
 * @param   {AppConfig}         config              The main configuration object
 * @param   {ServiceContainer}  serviceContainer    The service container to use, if a specific one is desired
 * @param   {string}            containerElementId  The element that should be populated by React-DOM on the Browser
 * @param   {boolean}           ssr                 Marker to hint Server Side rendering
 * @returns {SSRResponse|void}  The result of the initialization method invoked
 */
export default function init (config: AppConfig, serviceContainer?: Core.IServiceContainer, containerElementId?: string, ssr: boolean = false) : SSRResponse | void
{
    serviceContainer = serviceContainer || new Core.DefaultServiceContainer();
    if (ssr) {
        return initServer(config, serviceContainer);
    } else {
        return initBrowser(config, containerElementId, serviceContainer);
    }
}

/**
 * React Hook for function components to expose the Episerver context.
 * 
 * @returns {IEpiserverContext} The current context instance
 */
export function useEpiserver() : Core.IEpiserverContext
{
    return Spa;
}

/**
 * Layout capability
 */
export namespace Layout {
    export const Default = DefaultLayout;
    export type Component = LayoutComponent;
    export type ILayout = EpiserverLayout;
    export type Props = LayoutProps;
    export type State = LayoutState;
}

/**
 * Routing capability
 */
export namespace Routing {
    export const Router = RoutingNS.Router;
    export const Content = RoutingNS.RoutedContent;
    export type RouterProps = RoutingNS.RouterProps;
    export type ContentProps = RoutingNS.RoutedContentProps;
    export type IRoutingConfig = IRouteConfigBase;
    export type IRoutingItem   = IRouteConfigItemBase;
    export type RoutedComponentProps<T> = IRouteConfigComponentPropsBase<T>;
}

export namespace Taxanomy {
    export type IContent = IContentNS.default
    export type IContentType = IContentNS.IContentType;
    export type ContentLink = ContentLinkNS.default;
    export type ContentReference = ContentLinkNS.ContentReference;
    export type ContentApiId = ContentLinkNS.ContentApiId;
}

export namespace Services {
    export const ContentLink = ContentLinkNS.ContentLinkService
    export const String = StringUtils;
}

export namespace Components {
    export const Property = DefaultProperty;
    export const Link = DefaultLink;
    export const LazyComponent = DefaultLazyComponent;
    export const ContentArea = DefaultContentArea;
    export const EpiserverContent = DefaultEpiComponent;
    export const Site = DefaultCmsSite;
    export const Spinner = DefaultSpinner;
}