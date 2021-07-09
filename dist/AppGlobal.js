const fallback = {};
/**
 * Get the global variable for the current environment, this method will
 * return:
 * - When running in NodeJS the global variable
 * - When running in a Browser the window variable
 * - If unknown: a fallback object
 */
export const getGlobal = () => {
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
export default getGlobal;
//# sourceMappingURL=AppGlobal.js.map