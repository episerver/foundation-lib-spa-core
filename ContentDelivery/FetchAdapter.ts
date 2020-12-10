import { AxiosResponse, AxiosAdapter, AxiosRequestConfig } from 'axios';

export type CachingFetchAdapter = AxiosAdapter & {
    isCachable ?: ((url: URL) => boolean)[]
}

/**
 * A basic implementation of an AxiosAdapter to let Axios use the Fetch API to 
 * retrieve content.
 * 
 * @param   { AxiosRequestConfig }  config  The request configuration given by the implementing code
 * @returns { Promise<AxiosResponse> }      The response of the Fetch API Call
 */
export const FetchAdapter : CachingFetchAdapter = async (config: AxiosRequestConfig) : Promise<AxiosResponse> => 
{
    const userAgent : string = 'Axios-Fetch-Adapter/0.0.1';
    const requestUrl : URL = new URL(config.url || '', config.baseURL);
    if (config.auth) {
        requestUrl.username = config.auth.username
        requestUrl.password = config.auth.password
    }

    const headers = { ...config.headers }

    // Remove Authorization header if username & password are provided
    if (config.auth && headers.Authorization) {
        delete headers.Authorization;
    }

    // Set User-Agent (required by some servers)
    // Only set header if it hasn't been set in config
    // See https://github.com/axios/axios/issues/69
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = userAgent;
    }

    const requestConfig : RequestInit = {
        headers,
        credentials: config.withCredentials ? "include" : "omit",
        method: config.method,
        redirect: config.maxRedirects ? "follow" : "error", // @ToDo: Implement the actual maximum number of redirects
        body: config.data
    }

    const request = new Request(requestUrl.href, requestConfig);
    let r : Response;
    if (FetchAdapter.isCachable && caches && FetchAdapter.isCachable.some(test => test(requestUrl))) {
        const cache = await caches.open(userAgent);
        const cacheResponse = await cache.match(request);
        if (!cacheResponse) {
            r = await fetch(request);
            cache.put(request, r.clone());
        } else {
            r = cacheResponse;
        }
    } else {
        r = await fetch(request);
    }
    const responseHeaders: { [key: string]: string; } = {};
    r.headers.forEach((value, name) => responseHeaders[name] = value);
    const response: AxiosResponse = {
        config,
        request,
        status: r.status,
        statusText: r.statusText,
        headers: responseHeaders,
        data: undefined
    };
    switch (config.responseType) {
        case 'json':
            response.data = await r.json();
            break;
        case 'text':
            response.data = await r.text();
            break;
        case undefined:
        case 'stream':
            response.data = r.body;
            break;
        default:
            throw new Error(`Unsupported response type: ${config.responseType}`);
    }
    return response;
}
FetchAdapter.isCachable = [];
export default FetchAdapter;