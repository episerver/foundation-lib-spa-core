"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOAuthResponseIsSuccess = exports.IOAuthResponseIsError = exports.networkErrorToOAuthError = void 0;
const networkErrorToOAuthError = (message) => {
    return {
        error: 'NetworkError',
        error_description: 'An unhandled network error occurred'
    };
};
exports.networkErrorToOAuthError = networkErrorToOAuthError;
const IOAuthResponseIsError = (response) => {
    var _a;
    return typeof ((_a = response) === null || _a === void 0 ? void 0 : _a.error) === 'string' ? true : false;
};
exports.IOAuthResponseIsError = IOAuthResponseIsError;
const IOAuthResponseIsSuccess = (response) => {
    var _a;
    return typeof ((_a = response) === null || _a === void 0 ? void 0 : _a.access_token) === 'string' ? true : false;
};
exports.IOAuthResponseIsSuccess = IOAuthResponseIsSuccess;
//# sourceMappingURL=IAuthService.js.map