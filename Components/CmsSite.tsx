// Import libraries
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider as ReduxProvider } from 'react-redux';
import { StaticRouterContext } from 'react-router';

// Import Episerver Core CMS
import IEpiserverContext from '../Core/IEpiserverContext';
import EpiserverContext from '../Hooks/Context';

// Import Episerver Taxonomy
import Layout, { LayoutComponent } from './Layout';

// Import Episerver Components
import EpiRouter, {  RoutedContent } from '../Routing/EpiSpaRouter';
import IServerContextAccessor from '../ServerSideRendering/IServerContextAccessor';
import { DefaultServices } from '../Core/IServiceContainer';
import CmsCommunicator from './CmsCommunicator';

/**
 * Define the property structure for the CmsSite component
 */
export interface CmsSiteProps {
    staticContext?: StaticRouterContext,
    context: IEpiserverContext
}

export const EpiserverWebsite : React.FunctionComponent<CmsSiteProps> = (props) => {
    const SiteLayout = getLayout(props.context);
    const ssr = props.context.serviceContainer.getService<IServerContextAccessor>(DefaultServices.ServerContext);
    const location = (props.context.isServerSideRendering() ? ssr.Path : window.location.pathname) || undefined;
    return <ReduxProvider store={ props.context.getStore() }>
        <EpiserverContext.Provider value={ props.context }>
            <Helmet/>
            <CmsCommunicator />
            <EpiRouter location={ location } context={ props.staticContext }>
                <SiteLayout context={ props.context } >
                    <RoutedContent config={ props.context.config().routes || [] } keyPrefix="CmsSite-RoutedContent" />
                    { props.children }  
                </SiteLayout>
            </EpiRouter>
        </EpiserverContext.Provider>
    </ReduxProvider>
}

function getLayout(context: IEpiserverContext) : LayoutComponent
{
    return context.config().layout || Layout;
}

EpiserverWebsite.displayName = "Optimizely CMS: Website";
export default EpiserverWebsite;