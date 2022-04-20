// Set SSR
import getGlobal from './AppGlobal';
import { ServerStyleSheet } from 'styled-components';
// Global Libraries && Poly-fills
import ReactDOMServer from 'react-dom/server';
import { Helmet } from 'react-helmet';
import React from 'react';
import DefaultServiceContainer from './Core/DefaultServiceContainer';
import EpiSpaContext from './Spa';
import CmsSite from './Components/CmsSite';
export default function RenderServerSide(config, serviceContainer, hydrateData) {
    // Update context
    const ctx = getGlobal();
    ctx.epi = ctx.epi || {};
    ctx.epi.isServerSideRendering = true;
    // Initialize Episerver Context, for Server Side Rendering
    serviceContainer = serviceContainer || new DefaultServiceContainer();
    config.enableSpinner = false;
    config.noAjax = true;
    config.enableDebug = true;
    EpiSpaContext.init(config, serviceContainer, true, hydrateData);
    const sheet = new ServerStyleSheet();
    const staticContext = {};
    let html = '';
    let styles = '';
    try {
        html = ReactDOMServer.renderToString(sheet.collectStyles(React.createElement(CmsSite, { context: EpiSpaContext, staticContext: staticContext })));
        styles = sheet.getStyleTags(); // or sheet.getStyleElement();
    }
    catch (error) {
        // handle error
        console.error(error);
    }
    finally {
        sheet.seal();
    }
    const meta = Helmet.renderStatic();
    return {
        Body: html,
        HtmlAttributes: meta.htmlAttributes.toString(),
        Title: meta.title.toString(),
        Meta: meta.meta.toString(),
        Link: meta.link.toString(),
        Script: meta.script.toString(),
        Style: styles,
        BodyAttributes: meta.bodyAttributes.toString(),
    };
}
//# sourceMappingURL=InitServer.js.map