import IServiceContainer from './Core/IServiceContainer';
import AppConfig from './AppConfig';
import ServerSideRenderingResponse from './ServerSideRendering/ServerSideRenderingResponse';
export default function RenderServerSide(config: AppConfig, serviceContainer?: IServiceContainer): ServerSideRenderingResponse;
