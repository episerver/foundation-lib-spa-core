"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Set SSR
const AppGlobal_1 = __importDefault(require("./AppGlobal"));
const ctx = AppGlobal_1.default();
ctx.epi = ctx.epi || {};
ctx.epi.isServerSideRendering = true;
// Global Libraries && Poly-fills
require("core-js");
const server_1 = __importDefault(require("react-dom/server"));
const react_helmet_1 = require("react-helmet");
const react_1 = __importDefault(require("react"));
const DefaultServiceContainer_1 = __importDefault(require("./Core/DefaultServiceContainer"));
const Spa_1 = __importDefault(require("./Spa"));
const CmsSite_1 = __importDefault(require("./Components/CmsSite"));
function RenderServerSide(config, serviceContainer) {
    // Initialize Episerver Context, for Server Side Rendering
    // EpiContext.Instance = new SSRContext(new SSRPathProvider());
    serviceContainer = serviceContainer || new DefaultServiceContainer_1.default();
    config.enableSpinner = false;
    config.noAjax = true;
    config.enableDebug = true;
    Spa_1.default.init(config, serviceContainer, true);
    const body = server_1.default.renderToString(react_1.default.createElement(CmsSite_1.default, { context: Spa_1.default }));
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
