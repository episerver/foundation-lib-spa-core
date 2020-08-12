// Import libraries
import React, { useState, useEffect } from 'react';
import {Helmet} from 'react-helmet';
import { Provider, connect } from 'react-redux';

// Import Episerver Core CMS
import IEpiserverContext from '../Core/IEpiserverContext';
import EpiserverContext from '../Hooks/Context';
import AppConfig from '../AppConfig';

// Import Episerver Taxonomy
import Website from '../Models/Website';
import IContent from '../Models/IContent';
import Layout, { LayoutComponent, LayoutProps } from './Layout';
import ContentLink from '../Models/ContentLink';

// Import Episerver Repositories
import { IContentActionFactory, PartialStateWithIContentRepoState } from '../Repository/IContent';
import { PartialStateWithViewContext } from '../Repository/ViewContext';

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
    const [path, setPath] = useState<string>(props.context.getCurrentPath());
    const [firstpage, setFirstPage] = useState<IContent | null>(props.context.getContentByPath(path));
    const [isInitializing, setIsInitializing] = useState<boolean>(website === null || homepage === null);

    // Load website if needed, only once!
    useEffect(() => {
        if (!website) props.context.loadCurrentWebsite().then(w => { if (w) {setWebsite(w); setIsInitializing( homepage === null ); } });
    }, []);

    // Load homepage if needed, only when the website changes
    useEffect(() => {
        props.context.loadContentByRef("startPage").then(c => { 
            if (c) { 
                props.context.dispatch(IContentActionFactory.registerPaths(c, ['/'])); // Ensure the start page is bound to '/';
                setHomepage(c); 
                setIsInitializing( website === null ); 
            }
        });
    }, [ website ]);

    // Load current page
    useEffect(() => {
        props.context.loadContentByPath(path).then(c => {
            if (c) {
                if (c.contentLink.url !== path)
                    props.context.dispatch(IContentActionFactory.registerPaths(c, [ path ])); // Ensure the page is bound to the current path;
                setFirstPage(c);
            }
        });
    }, [path, website, homepage]);

    // If we're initializing, return a spinner
    if (isInitializing) {
        return Spinner.CreateInstance({key: 'Episerver-Loading'});
    }

    // If we're server side rendering, ignore the connected components
    if (props.context.isServerSideRendering()) {
        const ServerLayout = getLayout(props.context.config());
        return <EpiserverContext.Provider value={ props.context }>
            <EpiSpaRouter.Router>
                <Helmet />
                <ServerLayout context={ props.context } page={ firstpage?.contentLink } expandedValue={ firstpage || undefined } path={ path } startPage={ homepage || undefined }>
                    <EpiSpaRouter.RoutedContent config={ props.context.config().routes || [] } keyPrefix="CmsSite-RoutedContent" />
                    { props.children }  
                </ServerLayout>
            </EpiSpaRouter.Router>
        </EpiserverContext.Provider>
    }

    const BrowserLayout = connect<LayoutProps, {}, LayoutProps, PartialStateWithIContentRepoState & PartialStateWithViewContext>(buildLayoutPropsFromState)(getLayout(props.context.config()));
    return <Provider store={ props.context.getStore() }>
        <EpiserverContext.Provider value={ props.context }>
            <EpiSpaRouter.Router>
                <Helmet />
                <BrowserLayout context={ props.context } page={ firstpage?.contentLink } expandedValue={ firstpage || undefined } path={ path } startPage={ homepage || undefined }>
                    <EpiSpaRouter.RoutedContent config={ props.context.config().routes || [] } keyPrefix="CmsSite-RoutedContent" />
                    { props.children }
                </BrowserLayout>
            </EpiSpaRouter.Router>
        </EpiserverContext.Provider>
    </Provider>
}

function getLayout(config: AppConfig) : LayoutComponent
{
    return config.layout || Layout;
}

function buildLayoutPropsFromState(state: PartialStateWithIContentRepoState & PartialStateWithViewContext, ownProps: LayoutProps) : LayoutProps
{
    try {
        const path : string = state.ViewContext.currentPath || '';
        const idx = state.iContentRepo.paths[path];
        if (!idx) {
            return {...ownProps, path, page: undefined, expandedValue: undefined, startPage: undefined};
        }
        let contentLink : ContentLink;
        let contentItem : IContent;
        let startPage : IContent | undefined;
        contentItem = state.iContentRepo.items[idx].content;
        contentLink = contentItem.contentLink;
        const startIdx = state.iContentRepo.refs.startPage;
        if (startIdx && state.iContentRepo.items[startIdx]) {
            startPage = state.iContentRepo.items[startIdx].content;
        }
        const newProps : LayoutProps = { 
            ...ownProps,
            page: contentLink,
            expandedValue: contentItem,
            path,
            startPage
        }
        return newProps;
    } catch (e) {
        // Ignore layout property building errors
    }
    return ownProps;
}

export default EpiserverWebsite;