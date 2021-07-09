import { SpinnerComponent } from './Components/Spinner';
import { LayoutComponent } from './Components/Layout';
import { ContentAreaSiteConfig } from './Components/ContentArea';
import { IComponentPreloadList } from './Loaders/ComponentPreLoader';
import IInitializableModule from './Core/IInitializableModule';
import IRouteConfig from './Routing/IRouteConfig';
import { AxiosAdapter } from 'axios';
import { IRepositoryConfig } from './Repository/IRepository';
import { IComponentLoaderConfig } from './Loaders/ComponentLoader'
import IContentDeliveryConfig from './ContentDelivery/Config';
import { TypeMapperType } from './Loaders/BaseTypeMapper';
import { IContentSchema } from './Core/IContentSchema';

export type AppConfig = {
  /**
   * Enable debug logging to the console
   * 
   * @default false
   */
  enableDebug?: boolean;

  /**
   * Prefer guid for content fetching (preferred if running
   * multiple domains).
   * 
   * @default false
   */
  preferGuid?: boolean;

  /**
   * Disable all communication with the ContentDelivery API
   * 
   * @default false
   */
  noAjax?: boolean;

  /**
   * The base path, relative to the domain where the SPA is running.
   * 
   * The Full SPA URL is determined by new URL({basePath}, {spaBaseUrl});
   * 
   * @default ""
   */
  basePath: string;

  /**
   * The path prefix for assets, this used in the following pattern
   * {epiBaseUrl}{assetPath} to detect downloadable assets for which
   * the link should not be handled by the SPA.
   * 
   * @default "/globalassets"
   */
  assetPath?: string;

  /**
   * The base URL where the spa is running, if not provided the value
   * for epiBaseUrl is used.
   * 
   * The Full SPA URL is determined by new URL({basePath}, {spaBaseUrl});
   * 
   * @default ""
   */
  spaBaseUrl?: string

  /**
   * The URL where Episerver is running.
   */
  epiBaseUrl: string;

  /**
   * The default language to use, if none specified
   */
  defaultLanguage: string;

  /**
   * Should sub-requests be minimized by loading related content (1 level deep)
   * by default.
   * 
   * @default false
   */
  autoExpandRequests?: boolean;

  /**
   * Marker to indicate if the spinner component must be shown while components and
   * content are being loaded.
   *
   * @default false
   */
  enableSpinner?: boolean;

  /**
   * If this value is set to a number greater then 0, this is the amount of
   * miliseconds to wait before a spinner will be shown.
   * 
   * @default 0
   */
  spinnerTimeout?: number;

  /**
   * The spinner component to use
   * 
   * @default undefined
   */
  spinner?: SpinnerComponent;

  /**
   * Define the schema explictly (for bundling), if not set it will be imported
   * from app/Models/Content/schema.json.
   * 
   * @default {}
   */
  schema ?: IContentSchema;

  /**
   * The layout to apply to the website, this is the "frame" around the routed
   * content.
   * 
   * @default undefined
   */
  layout?: LayoutComponent;

  /**
   * Content Area configuration
   */
  contentArea?: ContentAreaSiteConfig;

  /**
   * List of components to be preloaded before hydration of the content, this
   * ensures "error-free" hydration at the chance of visitors clicking on links
   * before the full SPA has been loaded.
   * 
   * @default []
   */
  preLoadComponents?: IComponentPreloadList;

  /**
   * The list of module initializers to included into the bootstrapping process
   * 
   * @default []
   */
  modules ?: IInitializableModule[];

  /**
   * The list of routes to be pre-pended to the Episerver route-handler (e.g. the * handler)
   * 
   * @default []
   */
  routes ?: IRouteConfig

  /**
   * Override the standard adapter used by Axios to connect to the ContentDelivery API.
   * 
   * @default undefined
   */
  networkAdapter ?: AxiosAdapter

  /**
   * Additional configuration for the IContentRepository
   * 
   * @default undefined
   */
  iContentRepository ?: Partial<IRepositoryConfig>

  /**
   * New configuration location for the ContentDelivery API
   * 
   * @default undefined
   */
  iContentDelivery ?: Partial<IContentDeliveryConfig>

  /**
   * Configure the component loaders
   * 
   * @default undefined
   */
  componentLoaders ?: IComponentLoaderConfig

  /**
   * Create instance objects from raw iContent data
   * 
   * @default undefined
   */
  typeMapper ?: TypeMapperType
}

export default AppConfig;