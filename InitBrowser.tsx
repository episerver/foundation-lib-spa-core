import ReactDOM from "react-dom";
import React from "react";
import CmsSite from './Components/CmsSite';
import AppConfig from './AppConfig';
import EpiContext from './Spa';
import ComponentPreLoader, { IComponentPreloadList } from "./Loaders/ComponentPreLoader";
import IServiceContainer from './Core/IServiceContainer';
import DefaultServiceContainer from './Core/DefaultServiceContainer';

export default function InitBrowser(config: AppConfig, containerId?: string, serviceContainer?: IServiceContainer)
{
    if (!serviceContainer) {
        serviceContainer = new DefaultServiceContainer();
    }
    EpiContext.init(config, serviceContainer);
    
    const container = document.getElementById(containerId ? containerId : "epi-page-container");
    if (container && container.childElementCount > 0) {
        const components : IComponentPreloadList = EpiContext.config().preLoadComponents || [];
        if (EpiContext.isDebugActive()) console.info('Hydrating existing render, Stage 1. Preloading components ...', components);
        const loader = EpiContext.componentLoader();
        ComponentPreLoader.load(components, loader).finally(() => {
            if (EpiContext.isDebugActive()) console.info('Hydrating existing render, Stage 2. Hydration ...');
            ReactDOM.hydrate(<CmsSite context={ EpiContext } />, container);
        });
    } else {
        if (EpiContext.isDebugActive()) console.info('Building new application');
        ReactDOM.render(<CmsSite context={ EpiContext } />, container);
    }
}