export function isNetworkError(content) {
    try {
        if (typeof (content) !== 'object')
            return false;
        const typeString = content?.contentType?.join('/') || '';
        const providerName = content?.contentLink?.providerName || '';
        return typeString === 'Errors/NetworkError' && providerName === 'EpiserverSPA';
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=IContentDeliveryAPI.js.map