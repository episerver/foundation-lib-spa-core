"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotNetAccessor = exports.BrowserAccessor = exports.Accessor = exports.Factory = exports.Response = exports.ServerSideRenderingResponse = void 0;
var ServerSideRenderingResponse_1 = require("../ServerSideRendering/ServerSideRenderingResponse");
Object.defineProperty(exports, "ServerSideRenderingResponse", { enumerable: true, get: function () { return ServerSideRenderingResponse_1.ServerSideRenderingResponse; } });
Object.defineProperty(exports, "Response", { enumerable: true, get: function () { return ServerSideRenderingResponse_1.ServerSideRenderingResponse; } });
var IServerContextAccessor_1 = require("../ServerSideRendering/IServerContextAccessor");
Object.defineProperty(exports, "Factory", { enumerable: true, get: function () { return IServerContextAccessor_1.Factory; } });
var BrowserServerContextAccessor_1 = require("../ServerSideRendering/BrowserServerContextAccessor");
Object.defineProperty(exports, "Accessor", { enumerable: true, get: function () { return BrowserServerContextAccessor_1.BrowserServerContextAccessor; } });
Object.defineProperty(exports, "BrowserAccessor", { enumerable: true, get: function () { return BrowserServerContextAccessor_1.BrowserServerContextAccessor; } });
var DotNetServerContextAccessor_1 = require("../ServerSideRendering/DotNetServerContextAccessor");
Object.defineProperty(exports, "DotNetAccessor", { enumerable: true, get: function () { return DotNetServerContextAccessor_1.DotNetServerContextAccessor; } });
//# sourceMappingURL=ServerSideRendering.js.map