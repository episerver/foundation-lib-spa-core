// Import libraries
import React, { useState, useEffect } from 'react';
import {Helmet} from 'react-helmet';
import { Provider as ReduxProvider } from 'react-redux';

// Import Episerver Core CMS
import IEpiserverContext from '../Core/IEpiserverContext';
import EpiserverContext from '../Hooks/Context';
import AppConfig from '../AppConfig';

// Import Episerver Taxonomy
import Website from '../Models/Website';
import IContent from '../Models/IContent';
import Layout, { LayoutComponent } from './Layout';

// Import Episerver Components
import Spinner from './Spinner';
import * as EpiSpaRouter from '../Routing/EpiSpaRouter';
import { IIContentRepository } from '../Repository/IContentRepository';
import { DefaultServices } from '../Core/IServiceContainer';

/**
 * Define the property structure for the CmsSite component
 */
export interface CmsSiteProps {
    context: IEpiserverContext
}

export const EpiserverWebsite : React.FunctionComponent<CmsSiteProps> = (props) => {
    const SiteLayout = getLayout(props.context.config());
    const mainSite = <EpiserverContext.Provider value={ props.context }>
        <EpiSpaRouter.Router>
            <Helmet />
            <SiteLayout context={ props.context } >
                <EpiSpaRouter.RoutedContent config={ props.context.config().routes || [] } keyPrefix="CmsSite-RoutedContent" />
                { props.children }  
            </SiteLayout>
        </EpiSpaRouter.Router>
    </EpiserverContext.Provider>

    return props.context.isServerSideRendering() ? mainSite : <ReduxProvider store={ props.context.getStore() }>{ mainSite }</ReduxProvider>
}

function getLayout(config: AppConfig) : LayoutComponent
{
    return config.layout || Layout;
}

export default EpiserverWebsite;