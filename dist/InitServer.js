// Set SSR
import getGlobal from './AppGlobal';
// Global Libraries && Poly-fills
import ReactDOMServer from 'react-dom/server';
import { Helmet } from 'react-helmet';
import React from 'react';
import DefaultServiceContainer from './Core/DefaultServiceContainer';
import EpiSpaContext from './Spa';
import CmsSite from './Components/CmsSite';
export default function RenderServerSide(config, serviceContainer) {
    // Update context
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const INITIAL__DATA__ = __INITIAL__DATA__ || {};
    console.warn(INITIAL__DATA__);
    const ctx = getGlobal();
    ctx.epi = ctx.epi || {};
    ctx.epi.isServerSideRendering = true;
    // Initialize Episerver Context, for Server Side Rendering
    serviceContainer = serviceContainer || new DefaultServiceContainer();
    config.enableSpinner = false;
    config.noAjax = true;
    config.enableDebug = true;
    EpiSpaContext.init(config, serviceContainer, true);
    const staticContext = {};
    const body = ReactDOMServer.renderToString(React.createElement(CmsSite, { context: EpiSpaContext, staticContext: staticContext }));
    const meta = Helmet.renderStatic();
    console.warn('Body', body);
    return {
        Body: body,
        HtmlAttributes: meta.htmlAttributes.toString(),
        Title: meta.title.toString(),
        Meta: meta.meta.toString(),
        Link: meta.link.toString(),
        Script: meta.script.toString(),
        Style: meta.style.toString(),
        BodyAttributes: meta.bodyAttributes.toString(),
    };
}
//# sourceMappingURL=InitServer.js.map