var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useHistory } from 'react-router';
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
export const FetchAdapter = (config) => __awaiter(void 0, void 0, void 0, function* () {
    const history = useHistory();
    const userAgent = 'Axios-Fetch-Adapter/0.0.1';
    const requestUrl = new URL(config.url || '', config.baseURL);
    if (config.auth) {
        requestUrl.username = config.auth.username;
        requestUrl.password = config.auth.password;
    }
    const headers = Object.assign({}, config.headers);
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
    config.maxRedirects = 3;
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
            const cache = yield caches.open(userAgent);
            r = yield cache.match(request).then(cr => cr || fetch(request).then(fr => { cache.put(request, fr.clone()); return fr; }));
        }
        else {
            r = yield fetch(request);
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
    r.headers.forEach((value, name) => responseHeaders[name] = value);
    const response = {
        config,
        request,
        status: r.status,
        statusText: r.statusText,
        headers: responseHeaders,
        data: undefined
    };
    if (r.url != requestUrl.href && requestConfig.method === "get") {
        history.push(r.url);
    }
    switch (config.responseType) {
        case 'json':
            response.data = yield r.json().catch(_ => undefined);
            break;
        case 'text':
            response.data = yield r.text().catch(_ => undefined);
            break;
        case undefined:
        case 'stream':
            response.data = r.body;
            break;
        case 'arraybuffer':
            response.data = yield r.arrayBuffer().catch(_ => undefined);
            break;
        default:
            throw new Error(`Unsupported response type: ${config.responseType}`);
    }
    return response;
});
FetchAdapter.isCachable = [];
export default FetchAdapter;
//# sourceMappingURL=FetchAdapter.js.map