import { AxiosResponse, AxiosAdapter, AxiosRequestConfig } from 'axios';

export type CachingFetchAdapter = AxiosAdapter & {
    isCachable ?: ((request: Readonly<Request>) => boolean)[]
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
        headers: new Headers(headers),
        mode: 'cors',
        referrerPolicy: 'no-referrer',
        credentials: config.withCredentials ? "include" : "omit",
        method: config.method,
        redirect: config.maxRedirects ? "follow" : "error", // @ToDo: Implement the actual maximum number of redirects
        body: config.data,
        cache: 'no-store',
    }

    const request = new Request(requestUrl.href, requestConfig);
    let r : Response;
    try {
        if (FetchAdapter.isCachable && caches && FetchAdapter.isCachable.some(test => test(request))) {
            const cache = await caches.open(userAgent);
            r = await cache.match(request).then(cr => cr || fetch(request).then(fr => { cache.put(request, fr.clone()); return fr; }))
        } else {
            r = await fetch(request);
        }
    } catch (e) {
        console.error('Fetch Error', e);
        const errorResponse: AxiosResponse = {
            config,
            request,
            status: 500,
            statusText: 'Error fetching data',
            headers: {},
            data: undefined
        }
        return errorResponse;
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
            response.data = await r.json().catch(_ => undefined);
            break;
        case 'text':
            response.data = await r.text().catch(_ => undefined);
            break;
        case undefined:
        case 'stream':
            response.data = r.body;
            break;
        case 'arraybuffer':
            response.data = await r.arrayBuffer().catch(_ => undefined);
            break;
        default:
            throw new Error(`Unsupported response type: ${config.responseType}`);
    }
    return response;
}
FetchAdapter.isCachable = [];
export default FetchAdapter;