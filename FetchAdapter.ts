import Axios, { AxiosRequestConfig, Method, AxiosResponse, AxiosAdapter, AxiosPromise } from 'axios';

export const FetchAdapter : AxiosAdapter = async (config) => 
{
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
      headers['User-Agent'] = 'Axios-Fetch-Adapter/0.0.1';
    }

    const requestConfig : RequestInit = {
        headers: headers,
        credentials: config.withCredentials ? "include" : "omit",
        method: config.method,
        redirect: config.maxRedirects ? "follow" : "error", // @ToDo: Implement the actual maximum number of redirects
    }

    var request = new Request(requestUrl.href, requestConfig);
    const r = await fetch(request);
    let responseHeaders: { [key: string]: string; } = {};
    r.headers.forEach((value, name) => responseHeaders[name] = value);
    let response: AxiosResponse = {
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

export default FetchAdapter;