import ServerContext from './ServerSideRendering/ServerContext';
import { LoadedModuleList } from './Loaders/ComponentLoader';
import IEpiserverContext from './Core/IEpiserverContext';
import IServiceContainer from './Core/IServiceContainer';
/**
 * The global variable scope, as defined by the Episerver SPA
 */
export type GlobalContext = {
    __INITIAL__DATA__?: ServerContext;
    EpiserverSpa?: {
        Context: IEpiserverContext;
        serviceContainer: IServiceContainer;
    };
    PreLoad?: LoadedModuleList;
    addEventListener?: (event: string, handler: any, context: boolean) => void;
    epi?: {
        isServerSideRendering?: boolean;
    };
};
/**
 * Get the global variable for the current environment, this method will
 * return:
 * - When running in NodeJS the global variable
 * - When running in a Browser the window variable
 * - If unknown: a fallback object
 */
export declare const getGlobal: <T extends unknown = GlobalContext>() => T;
export default getGlobal;
