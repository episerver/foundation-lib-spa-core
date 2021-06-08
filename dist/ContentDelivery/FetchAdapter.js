/**
 * Check if the browser cache for Fetch Requests/Responses is available
 *
 * @returns Whether the caches are available
 */
export function cachesAvailable() {
    try {
        return caches ? true : false;
    }
    catch (e) {
        return false;
    }
}
const isCachesAvailable = cachesAvailable();
/**
 * A basic implementation of an AxiosAdapter to let Axios use the Fetch API to
 * retrieve content.
 *
 * @param   { AxiosRequestConfig }  config  The request configuration given by the implementing code
 * @returns { Promise<AxiosResponse> }      The response of the Fetch API Call
 */
export const FetchAdapter = async (config) => {
    const userAgent = 'Axios-Fetch-Adapter/0.0.1';
    const requestUrl = new URL(config.url || '', config.baseURL);
    if (config.auth) {
        requestUrl.username = config.auth.username;
        requestUrl.password = config.auth.password;
    }
    const headers = { ...config.headers };
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
    const requestConfig = {
        headers: new Headers(headers),
        mode: 'cors',
        referrerPolicy: 'no-referrer',
        credentials: config.withCredentials ? "include" : "omit",
        method: config.method,
        redirect: config.maxRedirects ? "follow" : "error",
        body: config.data,
        cache: 'no-store',
    };
    const request = new Request(requestUrl.href, requestConfig);
    let r;
    try {
        if (isCachesAvailable && FetchAdapter.isCachable && FetchAdapter.isCachable.some(test => test(request))) {
            const cache = await caches.open(userAgent);
            r = await cache.match(request).then(cr => cr || fetch(request).then(fr => { cache.put(request, fr.clone()); return fr; }));
        }
        else {
            r = await fetch(request);
        }
    }
    catch (e) {
        const errorResponse = {
            config,
            request,
            status: 500,
            statusText: 'Error fetching data',
            headers: {},
            data: undefined
        };
        return errorResponse;
    }
    const responseHeaders = {};
    for (const rh of r.headers)
        responseHeaders[rh[0]] = rh[1];
    const response = {
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
};
FetchAdapter.isCachable = [];
export default FetchAdapter;
//# sourceMappingURL=FetchAdapter.js.map