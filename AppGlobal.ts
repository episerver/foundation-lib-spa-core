import ServerContext from './ServerSideRendering/ServerContext';
import { LoadedModuleList } from './Loaders/ComponentLoader';
import IEpiserverContext from './Core/IEpiserverContext';
import IServiceContainer from './Core/IServiceContainer';

declare let global: any;
declare let window: any;

const fallback : any = {};

/**
 * The global variable scope, as defined by the Episerver SPA
 */
export type GlobalContext = {
    __INITIAL__DATA__ ?: ServerContext
    EpiserverSpa ?: {
        Context: IEpiserverContext
        serviceContainer: IServiceContainer
    }
    PreLoad ?: LoadedModuleList
    addEventListener ?: (event: string, handler: any, context: boolean) => void
    epi ?: {
        isServerSideRendering ?: boolean 
    }
}

/**
 * Get the global variable for the current environment, this method will
 * return:
 * - When running in NodeJS the global variable
 * - When running in a Browser the window variable
 * - If unknown: a fallback object
 */
export const getGlobal : <T extends unknown = GlobalContext>() => T = () =>
{
    let ctx: any = null;
    if (!ctx) try { ctx = window; } catch (e) { /* Ignore */ } 
    if (!ctx) try { ctx = global; } catch (e) { /* Ignore */ }
    ctx = ctx || fallback;

    return ctx;
}
export default getGlobal;