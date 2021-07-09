// Global Libraries && Poly-fills
import ReactDOMServer from 'react-dom/server';
import { Helmet } from 'react-helmet';
import React from 'react';
import DefaultServiceContainer from './Core/DefaultServiceContainer';
import EpiSpaContext from './Spa';
import CmsSite from './Components/CmsSite';
// Episerver SPA/PWA Server Side Rendering libs
import ServerSideRenderingResponse from './ServerSideRendering/ServerSideRenderingResponse';
export default function RenderServerSide(config, serviceContainer) {
    // Initialize Episerver Context, for Server Side Rendering
    serviceContainer = serviceContainer || new DefaultServiceContainer();
    config.enableSpinner = false;
    config.noAjax = true;
    config.enableDebug = true;
    EpiSpaContext.init(config, serviceContainer, true);
    const staticContext = {};
    const body = ReactDOMServer.renderToString(React.createElement(CmsSite, { context: EpiSpaContext, staticContext: staticContext }));
    const meta = Helmet.renderStatic();
    const response = new ServerSideRenderingResponse();
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
//# sourceMappingURL=InitServer.js.map