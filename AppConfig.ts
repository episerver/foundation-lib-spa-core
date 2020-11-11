import { SpinnerComponent } from './Components/Spinner';
import { LayoutComponent } from './Components/Layout';
import { ContentAreaSiteConfig } from './Components/ContentArea';
import { IComponentPreloadList } from './Loaders/ComponentPreLoader';
import IInitializableModule from './Core/IInitializableModule';
import IRouteConfig from './Routing/IRouteConfig';
import { AxiosAdapter } from 'axios';
import { IRepositoryConfig } from './Repository/IRepository';
import { IComponentLoaderConfig } from './Loaders/ComponentLoader'

export default interface AppConfig {
  /**
   * Enable debug logging to the console
   */
  enableDebug?: boolean;

  /**
   * Prefer guid for content fetching (preferred if running
   * multiple domains).
   */
  preferGuid?: boolean;

  /**
   * Disable all communication with the ContentDelivery API
   */
  noAjax?: boolean;

  /**
   * The base URL where the SPA is running
   */
  basePath: string;

  /**
   * The URL where Episerver is running, may or may not be the same as the basePath
   */
  epiBaseUrl: string;

  /**
   * The default language to use, if none specified
   */
  defaultLanguage: string;

  /**
   * Should sub-requests be minimized by loading related content (1 level deep)
   * by default?
   */
  autoExpandRequests?: boolean;

  /**
   *
   */
  enableSpinner?: boolean;

  /**
   * If this value is set to a number greater then 0, this is the amount of
   * miliseconds to wait before a spinner will be shown
   */
  spinnerTimeout?: number;

  /**
   * The spinner to use
   */
  spinner?: SpinnerComponent;

  /**
   * Layout
   */
  layout: LayoutComponent;

  /**
   * Content Area configuration
   */
  contentArea?: ContentAreaSiteConfig;

  /**
   * List of components to be preloaded before hydration of the content, this
   * ensures "error-free" hydration at the chance of visitors clicking on links
   * before the full SPA has been loaded.
   */
  preLoadComponents?: IComponentPreloadList;

  /**
   * The list of module initializers to included into the bootstrapping process
   */
  modules ?: IInitializableModule[];

  /**
   * The list of routes to be pre-pended to the Episerver route-handler (e.g. the * handler)
   */
  routes ?: IRouteConfig

  /**
   * Override the standard adapter used by Axios to connect to the ContentDelivery API.
   */
  networkAdapter ?: AxiosAdapter

  /**
   * Additional configuration for the IContentRepository
   */
  iContentRepository ?: IRepositoryConfig

  /**
   * Configure the component loaders
   */
  componentLoaders ?: IComponentLoaderConfig
}
