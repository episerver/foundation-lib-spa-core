// Import libraries
import React from 'react';
import {Helmet} from 'react-helmet';
import { Provider as ReduxProvider } from 'react-redux';
import { StaticRouterContext } from 'react-router';

// Import Episerver Core CMS
import IEpiserverContext from '../Core/IEpiserverContext';
import EpiserverContext from '../Hooks/Context';
import AppConfig from '../AppConfig';

// Import Episerver Taxonomy
import Layout, { LayoutComponent } from './Layout';

// Import Episerver Components
import EpiRouter, {  RoutedContent } from '../Routing/EpiSpaRouter';
import ServerContextAccessor from '../ServerSideRendering/ServerContextAccessor';
import { DefaultServices } from '../Core/IServiceContainer';

/**
 * Define the property structure for the CmsSite component
 */
export interface CmsSiteProps {
    staticContext?: StaticRouterContext,
    context: IEpiserverContext
}

export const EpiserverWebsite : React.FunctionComponent<CmsSiteProps> = (props) => {
    const SiteLayout = getLayout(props.context.config());
    const ssr = props.context.serviceContainer.getService<ServerContextAccessor>(DefaultServices.ServerContext);
    const location = (props.context.isServerSideRendering() ? ssr.Path : window.location.pathname) || undefined;
    const mainSite = <EpiserverContext.Provider value={ props.context }>
        <EpiRouter location={ location } context={ props.staticContext }>
            <Helmet />
            <SiteLayout context={ props.context } >
                <RoutedContent config={ props.context.config().routes || [] } keyPrefix="CmsSite-RoutedContent" />
                { props.children }  
            </SiteLayout>
        </EpiRouter>
    </EpiserverContext.Provider>

    return props.context.isServerSideRendering() ? mainSite : <ReduxProvider store={ props.context.getStore() }>{ mainSite }</ReduxProvider>
}

function getLayout(config: AppConfig) : LayoutComponent
{
    return config.layout || Layout;
}

export default EpiserverWebsite;