import IServiceContainer from './Core/IServiceContainer';
import AppConfig from './AppConfig';
import SSRResponse from './ServerSideRendering/Response';
import ServerContext from './ServerSideRendering/ServerContext';
export default function RenderServerSide(config: AppConfig, serviceContainer?: IServiceContainer, hydrateData?: ServerContext): SSRResponse;
