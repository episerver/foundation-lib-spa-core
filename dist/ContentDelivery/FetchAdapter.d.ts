import { AxiosAdapter } from 'axios';
export type CachingFetchAdapter = AxiosAdapter & {
    isCachable?: ((request: Readonly<Request>) => boolean)[];
};
/**
 * Check if the browser cache for Fetch Requests/Responses is available
 *
 * @returns Whether the caches are available
 */
export declare function cachesAvailable(): boolean;
/**
 * A basic implementation of an AxiosAdapter to let Axios use the Fetch API to
 * retrieve content.
 *
 * @param   { AxiosRequestConfig }  config  The request configuration given by the implementing code
 * @returns { Promise<AxiosResponse> }      The response of the Fetch API Call
 */
export declare const FetchAdapter: CachingFetchAdapter;
export default FetchAdapter;
