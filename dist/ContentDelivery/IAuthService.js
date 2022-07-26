export const networkErrorToOAuthError = (message) => {
    return {
        error: 'NetworkError',
        error_description: 'An unhandled network error occurred'
    };
};
export const IOAuthResponseIsError = (response) => {
    return typeof (response === null || response === void 0 ? void 0 : response.error) === 'string' ? true : false;
};
export const IOAuthResponseIsSuccess = (response) => {
    return typeof (response === null || response === void 0 ? void 0 : response.access_token) === 'string' ? true : false;
};
//# sourceMappingURL=IAuthService.js.map