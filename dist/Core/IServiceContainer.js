export function isContainerAwareService(toTest) {
    if (typeof (toTest) != 'object')
        return false;
    return typeof (toTest?.setServiceContainer) == 'function';
}
export function isContextAwareService(toTest) {
    if (typeof (toTest) != 'object')
        return false;
    return typeof (toTest?.setContext) == 'function';
}
//# sourceMappingURL=IServiceContainer.js.map