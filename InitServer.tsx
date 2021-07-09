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

// Episerver SPA/PWA Server Side Rendering libs
import ServerSideRenderingResponse from './ServerSideRendering/ServerSideRenderingResponse';

export default function RenderServerSide(config: AppConfig, serviceContainer?: IServiceContainer): ServerSideRenderingResponse
{
    // Initialize Episerver Context, for Server Side Rendering
    serviceContainer = serviceContainer || new DefaultServiceContainer();
    config.enableSpinner = false;
    config.noAjax = true;
    config.enableDebug = true;
    EpiSpaContext.init(config, serviceContainer, true);

    const staticContext : StaticRouterContext = {};
    const body = ReactDOMServer.renderToString(<CmsSite context={ EpiSpaContext } staticContext={ staticContext } />);
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