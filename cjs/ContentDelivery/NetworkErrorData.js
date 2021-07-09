"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkErrorContent = exports.isNetworkError = void 0;
const uuid_1 = require("uuid");
let internalErrorCounter = 100000000001;
function isNetworkError(content) {
    var _a, _b, _c, _d;
    try {
        if (typeof (content) !== 'object')
            return false;
        const typeString = ((_b = (_a = content) === null || _a === void 0 ? void 0 : _a.contentType) === null || _b === void 0 ? void 0 : _b.slice(0, 2).join('/')) || '';
        const providerName = ((_d = (_c = content) === null || _c === void 0 ? void 0 : _c.contentLink) === null || _d === void 0 ? void 0 : _d.providerName) || '';
        return typeString === 'Errors/NetworkError' && providerName === 'EpiserverSPA';
    }
    catch (e) {
        return false;
    }
}
exports.isNetworkError = isNetworkError;
class NetworkErrorContent {
    constructor(code, info, raw, response, group = "NetworkError") {
        let url = '';
        try {
            url = response ? (new URL(response.config.url || '', response.config.baseURL)).href : '';
        }
        catch (_a) {
            //Ignore
        }
        this.name = `Error ${code}: ${info}`;
        this.contentType = ['Errors', group, code.toString()];
        this.contentLink = {
            guidValue: uuid_1.v4(),
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
exports.NetworkErrorContent = NetworkErrorContent;
//# sourceMappingURL=NetworkErrorData.js.map