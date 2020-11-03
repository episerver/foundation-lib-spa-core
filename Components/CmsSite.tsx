// Import libraries
import React, { useState, useEffect } from 'react';
import {Helmet} from 'react-helmet';
import { Provider, connect } from 'react-redux';

// Import Episerver Core CMS
import IEpiserverContext from '../Core/IEpiserverContext';
import EpiserverContext from '../Hooks/Context';
import AppConfig from '../AppConfig';
import { DefaultServices } from '../Core/IServiceContainer';

// Import Episerver Taxonomy
import Website from '../Models/Website';
import IContent from '../Models/IContent';
import Layout, { LayoutComponent, LayoutProps } from './Layout';
import ContentLink from '../Models/ContentLink';

// Import Episerver Repositories
import { IContentActionFactory, PartialStateWithIContentRepoState } from '../Repository/IContent';
import { PartialStateWithViewContext } from '../Repository/ViewContext';
import IContentRepository_V2 from '../Repository/IContentRepository';

// Import Episerver Components
import Spinner from './Spinner';
import * as EpiSpaRouter from '../Routing/EpiSpaRouter';

/**
 * Define the property structure for the CmsSite component
 */
export interface CmsSiteProps {
    context: IEpiserverContext
}

export const EpiserverWebsite : React.FunctionComponent<CmsSiteProps> = (props) => {
    const [website, setWebsite] = useState<Website | null>(props.context.getCurrentWebsite());
    const [homepage, setHomepage] = useState<IContent | null>(props.context.getContentByRef("startPage"));
    const [isInitializing, setIsInitializing] = useState<boolean>(website === null || homepage === null);
    const SiteLayout = getLayout(props.context.config());

    // Load website if needed, only once!
    useEffect(() => {
        if (!website) props.context.loadCurrentWebsite().then(w => { if (w) {setWebsite(w); setIsInitializing( homepage === null ); } });
    }, []);

    // Load homepage if needed, only when the website changes
    useEffect(() => {
        props.context.loadContentByRef("startPage").catch(c => undefined).then(c => { 
            if (c) { 
                props.context.dispatch(IContentActionFactory.registerPaths(c, ['/'])); // Ensure the start page is bound to '/';
                setHomepage(c); 
                setIsInitializing( website === null ); 
            }
        });
    }, [ website ]);

    // If we're initializing, return a spinner
    if (isInitializing) {
        return Spinner.CreateInstance({key: 'Episerver-Loading'});
    }

    // If we're server side rendering, ignore the connected components
    if (props.context.isServerSideRendering()) {
        return <EpiserverContext.Provider value={ props.context }>
            <EpiSpaRouter.Router>
                <Helmet />
                <SiteLayout context={ props.context } >
                    <EpiSpaRouter.RoutedContent config={ props.context.config().routes || [] } keyPrefix="CmsSite-RoutedContent" />
                    { props.children }  
                </SiteLayout>
            </EpiSpaRouter.Router>
        </EpiserverContext.Provider>
    }

    return <Provider store={ props.context.getStore() }>
        <EpiserverContext.Provider value={ props.context }>
            <EpiSpaRouter.Router>
                <Helmet />
                <SiteLayout context={ props.context } >
                    <EpiSpaRouter.RoutedContent config={ props.context.config().routes || [] } keyPrefix="CmsSite-RoutedContent" />
                    { props.children }
                </SiteLayout>
            </EpiSpaRouter.Router>
        </EpiserverContext.Provider>
    </Provider>
}

function getLayout(config: AppConfig) : LayoutComponent
{
    return config.layout || Layout;
}

export default EpiserverWebsite;