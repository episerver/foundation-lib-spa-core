"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fallback = {};
/**
 * Get the global variable for the current environment, this method will
 * return:
 * - When running in NodeJS the global variable
 * - When running in a Browser the window variable
 * - If unknown: a fallback object
 */
function default_1() {
    var ctx = null;
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
    ;
    ctx = ctx || fallback;
    return ctx;
}
exports.default = default_1;
