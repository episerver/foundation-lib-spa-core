export function isNetworkError(content) {
    var _a, _b;
    try {
        if (typeof (content) !== 'object')
            return false;
        const typeString = ((_a = content === null || content === void 0 ? void 0 : content.contentType) === null || _a === void 0 ? void 0 : _a.join('/')) || '';
        const providerName = ((_b = content === null || content === void 0 ? void 0 : content.contentLink) === null || _b === void 0 ? void 0 : _b.providerName) || '';
        return typeString === 'Errors/NetworkError' && providerName === 'EpiserverSPA';
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=IContentDeliveryAPI.js.map