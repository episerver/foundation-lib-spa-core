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
    const SiteLayout = getLayout(props.context);
    const ssr = props.context.serviceContainer.getService(DefaultServices.ServerContext);
    const location = (props.context.isServerSideRendering() ? ssr.Path : window.location.pathname) || undefined;
    return React.createElement(ReduxProvider, { store: props.context.getStore() },
        React.createElement(EpiserverContext.Provider, { value: props.context },
            React.createElement(Helmet, null),
            React.createElement(EpiRouter, { location: location, context: props.staticContext },
                React.createElement(SiteLayout, { context: props.context },
                    React.createElement(RoutedContent, { config: props.context.config().routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                    props.children))));
};
function getLayout(context) {
    return context.config().layout || Layout;
}
EpiserverWebsite.displayName = "Optimizely CMS: Website";
export default EpiserverWebsite;
//# sourceMappingURL=CmsSite.js.map