import ReactDOM from "react-dom";
import React from "react";
import CmsSite from './Components/CmsSite';
import AppConfig from './AppConfig';
import EpiContext from './Spa';
import ComponentPreLoader, { IComponentPreloadList } from "./Loaders/ComponentPreLoader";
import IServiceContainer from './Core/IServiceContainer';
import DefaultServiceContainer from './Core/DefaultServiceContainer';
import ServerContextType from './ServerSideRendering/ServerContext';

import {
    StylesProvider,
    createGenerateClassName,
  } from "@material-ui/core/styles";

declare let __INITIAL_DATA__ : ServerContextType;

export function InitBrowser(config: AppConfig, containerId?: string, serviceContainer?: IServiceContainer) : void
{
    try {
        if (__INITIAL_DATA__?.status === 'loading') {
            __INITIAL_DATA__.onReady = () => _doInitBrowser(config, containerId, serviceContainer);
            return;
        }
    } catch (e) {
        // Ignore on purpose
    }
    return _doInitBrowser(config, containerId, serviceContainer);
}

function _doInitBrowser(config: AppConfig, containerId?: string, serviceContainer?: IServiceContainer) : void
{
    const generateClassName = createGenerateClassName({
        productionPrefix: "MO"
        //disableGlobal: true
    });
    EpiContext.init(config, serviceContainer || new DefaultServiceContainer());
    
    const container = document.getElementById(containerId ? containerId : "epi-page-container");
    if (container && container.childElementCount > 0) {
        const components : IComponentPreloadList = EpiContext.config().preLoadComponents || [];
        if (EpiContext.isDebugActive()) console.info('Hydrating existing render, Stage 1. Preloading components ...', components);
        const loader = EpiContext.componentLoader();
        ComponentPreLoader.load(components, loader).finally(() => {
            if (EpiContext.isDebugActive()) console.info('Hydrating existing render, Stage 2. Hydration ...');
            ReactDOM.hydrate(<StylesProvider generateClassName={generateClassName}><CmsSite context={ EpiContext } /></StylesProvider>, container);
        });
    } else {
        if (EpiContext.isDebugActive()) console.info('Building new application');
        ReactDOM.render(<CmsSite context={ EpiContext } />, container);
    }
}

export default InitBrowser;