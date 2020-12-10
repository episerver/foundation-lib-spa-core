export const IOAuthResponseIsError = (response) => {
    var _a;
    return typeof ((_a = response) === null || _a === void 0 ? void 0 : _a.error) === 'string' ? true : false;
};
export const IOAuthResponseIsSuccess = (response) => {
    var _a;
    return typeof ((_a = response) === null || _a === void 0 ? void 0 : _a.access_token) === 'string' ? true : false;
};
