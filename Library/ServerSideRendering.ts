import DefaultResponse from '../ServerSideRendering/Response';
import DefaultServerContext from '../ServerSideRendering/ServerContext';
import * as DefaultAccessorNS from '../ServerSideRendering/ServerContextAccessor';

export type Response = DefaultResponse;
export type Context  = DefaultServerContext;
export const Accessor : DefaultAccessorNS.IServerContextAccessor = DefaultAccessorNS.ServerContextAccessor;
