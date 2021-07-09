"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobal = void 0;
const fallback = {};
/**
 * Get the global variable for the current environment, this method will
 * return:
 * - When running in NodeJS the global variable
 * - When running in a Browser the window variable
 * - If unknown: a fallback object
 */
const getGlobal = () => {
    let ctx = null;
    if (!ctx)
        try {
            ctx = window;
        }
        catch (e) { /* Ignore */ }
    if (!ctx)
        try {
            ctx = global;
        }
        catch (e) { /* Ignore */ }
    ctx = ctx || fallback;
    return ctx;
};
exports.getGlobal = getGlobal;
exports.default = exports.getGlobal;
//# sourceMappingURL=AppGlobal.js.map