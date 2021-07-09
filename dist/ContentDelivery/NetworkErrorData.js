import { v4 as generateGuid } from 'uuid';
let internalErrorCounter = 100000000001;
export function isNetworkError(content) {
    try {
        if (typeof (content) !== 'object')
            return false;
        const typeString = content?.contentType?.slice(0, 2).join('/') || '';
        const providerName = content?.contentLink?.providerName || '';
        return typeString === 'Errors/NetworkError' && providerName === 'EpiserverSPA';
    }
    catch (e) {
        return false;
    }
}
export class NetworkErrorContent {
    constructor(code, info, raw, response, group = "NetworkError") {
        let url = '';
        try {
            url = response ? (new URL(response.config.url || '', response.config.baseURL)).href : '';
        }
        catch {
            //Ignore
        }
        this.name = `Error ${code}: ${info}`;
        this.contentType = ['Errors', group, code.toString()];
        this.contentLink = {
            guidValue: generateGuid(),
            id: ++internalErrorCounter,
            providerName: 'EpiserverSPA',
            url: url,
            workId: 0
        };
        this.error = {
            propertyDataType: "PropertyErrorMessage",
            value: raw
        };
        this.response = response;
    }
    static get Error404() {
        return new NetworkErrorContent(404, 'Page not found', undefined);
    }
    static get Error500() {
        return new NetworkErrorContent(500, 'Unkown server error', undefined);
    }
    static CreateFromResponse(error, response) {
        return new NetworkErrorContent(response.status, response.statusText, error, response);
    }
    static Create(error, code, info) {
        return new NetworkErrorContent(code, info, error);
    }
}
//# sourceMappingURL=NetworkErrorData.js.map