// Set SSR
import getGlobal from './AppGlobal';

// Global Libraries && Poly-fills
import ReactDOMServer from 'react-dom/server';
import { Helmet } from 'react-helmet';
import React from 'react';
import { StaticRouterContext } from 'react-router';

// Episerver Libraries
import IServiceContainer from './Core/IServiceContainer';
import DefaultServiceContainer from './Core/DefaultServiceContainer'; 
import EpiSpaContext from './Spa';
import CmsSite from './Components/CmsSite';
import AppConfig from './AppConfig';
import {
    StylesProvider,
    ServerStyleSheets,createGenerateClassName
  } from "@material-ui/core/styles";

  
// Episerver SPA/PWA Server Side Rendering libs
import SSRResponse from './ServerSideRendering/Response';

export default function RenderServerSide(config: AppConfig, serviceContainer?: IServiceContainer): SSRResponse
{
    // Update context
    const ctx = getGlobal();
    ctx.epi = ctx.epi || {};
    ctx.epi.isServerSideRendering = true;

    // Initialize Episerver Context, for Server Side Rendering
    serviceContainer = serviceContainer || new DefaultServiceContainer();
    config.enableSpinner = false;
    config.noAjax = true;
    config.enableDebug = true;
    EpiSpaContext.init(config, serviceContainer, true);
    const classPrefix = "MO";
    const generateClassName = () => createGenerateClassName({
        productionPrefix: classPrefix
    });

    const staticContext : StaticRouterContext = {};
    const sheets = new ServerStyleSheets({
        serverGenerateClassName: generateClassName()
    });
    const body = ReactDOMServer.renderToString(sheets.collect(<CmsSite context={ EpiSpaContext } staticContext={ staticContext } />));
    const meta = Helmet.renderStatic();

    return {
        Body: body,
        HtmlAttributes: meta.htmlAttributes.toString(),
        Title: meta.title.toString(),
        Meta: meta.meta.toString(),
        Link: meta.link.toString(),
        Script: meta.script.toString(),
        Style: sheets.toString(),
        BodyAttributes: meta.bodyAttributes.toString()
    };
}