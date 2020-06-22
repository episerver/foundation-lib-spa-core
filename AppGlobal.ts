
declare let global: any;
declare let window: any;

const fallback : any = {};

/**
 * Get the global variable for the current environment, this method will
 * return:
 * - When running in NodeJS the global variable
 * - When running in a Browser the window variable
 * - If unknown: a fallback object
 */
export default function() : any
{
    let ctx: any = null;
    if (!ctx) try { ctx = window; } catch (e) { /* Ignore */ } 
    if (!ctx) try { ctx = global; } catch (e) { /* Ignore */ };
    ctx = ctx || fallback;

    return ctx;
}