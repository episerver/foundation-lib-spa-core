"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Set SSR
const AppGlobal_1 = require("./AppGlobal");
// Global Libraries && Poly-fills
const server_1 = require("react-dom/server");
const react_helmet_1 = require("react-helmet");
const react_1 = require("react");
const DefaultServiceContainer_1 = require("./Core/DefaultServiceContainer");
const Spa_1 = require("./Spa");
const CmsSite_1 = require("./Components/CmsSite");
function RenderServerSide(config, serviceContainer) {
    // Update context
    const ctx = AppGlobal_1.default();
    ctx.epi = ctx.epi || {};
    ctx.epi.isServerSideRendering = true;
    // Initialize Episerver Context, for Server Side Rendering
    serviceContainer = serviceContainer || new DefaultServiceContainer_1.default();
    config.enableSpinner = false;
    config.noAjax = true;
    config.enableDebug = true;
    Spa_1.default.init(config, serviceContainer, true);
    const staticContext = {};
    const body = server_1.default.renderToString(react_1.default.createElement(CmsSite_1.default, { context: Spa_1.default, staticContext: staticContext }));
    const meta = react_helmet_1.Helmet.renderStatic();
    return {
        Body: body,
        HtmlAttributes: meta.htmlAttributes.toString(),
        Title: meta.title.toString(),
        Meta: meta.meta.toString(),
        Link: meta.link.toString(),
        Script: meta.script.toString(),
        Style: meta.style.toString(),
        BodyAttributes: meta.bodyAttributes.toString()
    };
}
exports.default = RenderServerSide;
//# sourceMappingURL=InitServer.js.map