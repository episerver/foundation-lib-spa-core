import { AxiosAdapter } from 'axios';
/**
 * ContentDeliveryAPI Configuration definition
 */
export type Config = {
    /**
     * The Base URL where Episerver is running. In normal scenario's this is
     * the primary domain of the Episerver installation.
     */
    BaseURL: string;
    /**
     * The adapter to use when connecting to the Content Delivery API
     */
    Adapter?: AxiosAdapter;
    /**
     * Enable debugging of requests and responses from the Content Delivery API
     */
    Debug: boolean;
    /**
     * Marker to inform the ContentDeliveryAPI if EditMode URLs must be used
     */
    InEditMode: boolean;
    /**
     * The language branch to request
     */
    Language: string;
    /**
     * Whether or not auto-expansion of Content Attributes must be performed, the
     * value of this setting is always overridden by the expand parameter of specific
     * functions.
     */
    AutoExpandAll: boolean;
    /**
     * Configuration flag to indicate whether or not the additional services provided by
     * Foundation CMS/Commerce SPA are available. These services provide access to:
     *
     * - IContent models
     * - Controller methods
     * - Routing
     */
    EnableExtensions: boolean;
};
/**
 * Default configuration for the ContentDeliveryAPI
 */
export declare const DefaultConfig: Config;
export default Config;
