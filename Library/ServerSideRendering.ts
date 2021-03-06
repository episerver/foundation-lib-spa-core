import * as ResponseNS from '../ServerSideRendering/Response';
import * as ServerContextNS from '../ServerSideRendering/ServerContext';
import * as DefaultAccessorNS from '../ServerSideRendering/IServerContextAccessor';
import * as BrowserAccessorNS from '../ServerSideRendering/BrowserServerContextAccessor';
import * as DotNetAccessorNS from '../ServerSideRendering/DotNetServerContextAccessor';

export import Response = ResponseNS.Response;
export import Context  = ServerContextNS.ServerContext;
export import IAccessor = DefaultAccessorNS.IServerContextAccessor;
export import IStaticAccessor = DefaultAccessorNS.IStaticServerContextAccessor;
export import Factory = DefaultAccessorNS.Factory;

export import Accessor = BrowserAccessorNS.BrowserServerContextAccessor;
export import BrowserAccessor = BrowserAccessorNS.BrowserServerContextAccessor;
export import DotNetAccessor = DotNetAccessorNS.DotNetServerContextAccessor;
