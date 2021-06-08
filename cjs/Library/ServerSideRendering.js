"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotNetAccessor = exports.BrowserAccessor = exports.Accessor = exports.Factory = void 0;
const DefaultAccessorNS = require("../ServerSideRendering/IServerContextAccessor");
const BrowserAccessorNS = require("../ServerSideRendering/BrowserServerContextAccessor");
const DotNetAccessorNS = require("../ServerSideRendering/DotNetServerContextAccessor");
exports.Factory = DefaultAccessorNS.Factory;
exports.Accessor = BrowserAccessorNS.BrowserServerContextAccessor;
exports.BrowserAccessor = BrowserAccessorNS.BrowserServerContextAccessor;
exports.DotNetAccessor = DotNetAccessorNS.DotNetServerContextAccessor;
//# sourceMappingURL=ServerSideRendering.js.map