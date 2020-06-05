import initServer from './InitServer';
import initBrowser from './InitBrowser';
import AppConfig from './AppConfig';
import ServiceContainer from './Core/IServiceContainer';
import SSRResponse from './ServerSideRendering/Response';

export default function init (config: AppConfig, container?: ServiceContainer, ssr: boolean = false) : SSRResponse | void
{
    if (ssr) {
        return initServer(config);
    } else {
        return initBrowser(config, undefined, container);
    }
}