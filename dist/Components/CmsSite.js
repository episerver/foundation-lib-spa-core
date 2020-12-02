// Import libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider as ReduxProvider } from 'react-redux';
import EpiserverContext from '../Hooks/Context';
// Import Episerver Taxonomy
import Layout from './Layout';
// Import Episerver Components
import EpiRouter, { RoutedContent } from '../Routing/EpiSpaRouter';
import { DefaultServices } from '../Core/IServiceContainer';
export const EpiserverWebsite = (props) => {
    const SiteLayout = getLayout(props.context.config());
    const ssr = props.context.serviceContainer.getService(DefaultServices.ServerContext);
    const location = (props.context.isServerSideRendering() ? ssr.Path : window.location.pathname) || undefined;
    const mainSite = React.createElement(EpiserverContext.Provider, { value: props.context },
        React.createElement(EpiRouter, { location: location, context: props.staticContext },
            React.createElement(Helmet, null),
            React.createElement(SiteLayout, { context: props.context },
                React.createElement(RoutedContent, { config: props.context.config().routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                props.children)));
    return props.context.isServerSideRendering() ? mainSite : React.createElement(ReduxProvider, { store: props.context.getStore() }, mainSite);
};
function getLayout(config) {
    return config.layout || Layout;
}
export default EpiserverWebsite;
