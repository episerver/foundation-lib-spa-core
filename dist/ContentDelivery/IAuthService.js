export const networkErrorToOAuthError = (message) => {
    return {
        error: 'NetworkError',
        error_description: 'An unhandled network error occurred'
    };
};
export const IOAuthResponseIsError = (response) => {
    return typeof (response?.error) === 'string' ? true : false;
};
export const IOAuthResponseIsSuccess = (response) => {
    return typeof (response?.access_token) === 'string' ? true : false;
};
//# sourceMappingURL=IAuthService.js.map