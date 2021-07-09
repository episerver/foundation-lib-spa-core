"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Global Libraries && Poly-fills
const server_1 = require("react-dom/server");
const react_helmet_1 = require("react-helmet");
const react_1 = require("react");
const DefaultServiceContainer_1 = require("./Core/DefaultServiceContainer");
const Spa_1 = require("./Spa");
const CmsSite_1 = require("./Components/CmsSite");
// Episerver SPA/PWA Server Side Rendering libs
const ServerSideRenderingResponse_1 = require("./ServerSideRendering/ServerSideRenderingResponse");
function RenderServerSide(config, serviceContainer) {
    // Initialize Episerver Context, for Server Side Rendering
    serviceContainer = serviceContainer || new DefaultServiceContainer_1.default();
    config.enableSpinner = false;
    config.noAjax = true;
    config.enableDebug = true;
    Spa_1.default.init(config, serviceContainer, true);
    const staticContext = {};
    const body = server_1.default.renderToString(react_1.default.createElement(CmsSite_1.default, { context: Spa_1.default, staticContext: staticContext }));
    const meta = react_helmet_1.Helmet.renderStatic();
    const response = new ServerSideRenderingResponse_1.default();
    response.Body = body;
    response.HtmlAttributes = meta.htmlAttributes.toString();
    response.Title = meta.title.toString();
    response.Meta = meta.meta.toString();
    response.Link = meta.link.toString();
    response.Script = meta.script.toString();
    response.Style = meta.style.toString();
    response.BodyAttributes = meta.bodyAttributes.toString();
    return response;
}
exports.default = RenderServerSide;
//# sourceMappingURL=InitServer.js.map