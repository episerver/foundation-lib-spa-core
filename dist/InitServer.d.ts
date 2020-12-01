import IServiceContainer from './Core/IServiceContainer';
import AppConfig from './AppConfig';
import SSRResponse from './ServerSideRendering/Response';
export default function RenderServerSide(config: AppConfig, serviceContainer?: IServiceContainer): SSRResponse;
