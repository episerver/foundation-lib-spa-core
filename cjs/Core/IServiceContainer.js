"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isContextAwareService = exports.isContainerAwareService = void 0;
function isContainerAwareService(toTest) {
    var _a;
    if (typeof (toTest) != 'object')
        return false;
    return typeof ((_a = toTest) === null || _a === void 0 ? void 0 : _a.setServiceContainer) == 'function';
}
exports.isContainerAwareService = isContainerAwareService;
function isContextAwareService(toTest) {
    var _a;
    if (typeof (toTest) != 'object')
        return false;
    return typeof ((_a = toTest) === null || _a === void 0 ? void 0 : _a.setContext) == 'function';
}
exports.isContextAwareService = isContextAwareService;
//# sourceMappingURL=IServiceContainer.js.map