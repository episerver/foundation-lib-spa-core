// Import libraries
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Provider as ReduxProvider } from 'react-redux';
import { Route } from 'react-router';
import axios from 'axios';
import NProgress from 'nprogress';
import EpiserverContext from '../Hooks/Context';
// Import Episerver Taxonomy
import Layout, { NotFoundComponent } from './Layout';
// Import Episerver Components
import EpiRouter, { RoutedContent } from '../Routing/EpiSpaRouter';
import { DefaultServices } from '../Core/IServiceContainer';
import CmsCommunicator from './CmsCommunicator';
import getGlobal from '../AppGlobal';
let numberOfAjaxCAllPending = 0;
// Add a request interceptor
axios.interceptors.request.use(function (config) {
    numberOfAjaxCAllPending++;
    return config;
}, function (error) {
    return Promise.reject(error);
});
// Add a response interceptor
axios.interceptors.response.use(function (response) {
    numberOfAjaxCAllPending--;
    if (numberOfAjaxCAllPending === 0) {
        // hide loader
        NProgress.done();
    }
    return response;
}, function (error) {
    numberOfAjaxCAllPending--;
    if (numberOfAjaxCAllPending === 0) {
        // hide loader
        NProgress.done();
    }
    return Promise.reject(error);
});
export const EpiserverWebsite = (props) => {
    const SiteLayout = getLayout(props.context);
    const NotFoundComponent = getNotFound(props.context);
    const ssr = props.context.serviceContainer.getService(DefaultServices.ServerContext);
    const location = (props.context.isServerSideRendering() ? ssr.Path : window.location.pathname) || undefined;
    const epi = props.context.getStore();
    const global = getGlobal();
    useEffect(() => {
        if (!epi || !(global === null || global === void 0 ? void 0 : global.__INITIAL__DATA__))
            return;
        epi.dispatch({
            type: 'OptiContentCloud/SetState',
            initialState: global.__INITIAL__DATA__,
        });
    }, [epi, global === null || global === void 0 ? void 0 : global.__INITIAL__DATA__]);
    useEffect(() => {
        NProgress.start();
    }, [location]);
    return (React.createElement(ReduxProvider, { store: props.context.getStore() },
        React.createElement(EpiserverContext.Provider, { value: props.context },
            React.createElement(Helmet, null),
            React.createElement(CmsCommunicator, null),
            React.createElement(EpiRouter, { location: location, context: props.staticContext },
                React.createElement(SiteLayout, { context: props.context },
                    React.createElement(RoutedContent, { config: props.context.config().routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                    React.createElement(Route, { component: NotFoundComponent }),
                    props.children)))));
};
function getLayout(context) {
    return context.config().layout || Layout;
}
function getNotFound(context) {
    return context.config().notFoundComponent || NotFoundComponent;
}
EpiserverWebsite.displayName = 'Optimizely CMS: Website';
export default EpiserverWebsite;
//# sourceMappingURL=CmsSite.js.map