// Import libraries
import React, {ReactNode, ReactNodeArray, Component} from 'react';
import {Helmet} from 'react-helmet';
import { Provider, connect } from 'react-redux';

// Import Episerver CMS
import Layout, { LayoutComponent, LayoutProps } from './Layout';
import IContent from '../Models/IContent';
import ContentLink from '../Models/ContentLink';
import Website from '../Models/Website';
import IEpiserverContext from '../Core/IEpiserverContext';
import IContentRepository, { IContentRepoState, IContentActionFactory } from '../Repository/IContent';
import ServerContext, { isSerializedIContent, isSerializedWebsite, isSerializedContentLink } from '../ServerSideRendering/ServerContext';
import Spinner from './Spinner';

/**
 * Declare the context created by the Episerver Javascript ViewEngine, for both
 * initial data as well as server side rendering.
 */
declare let __INITIAL__DATA__ : ServerContext;

/**
 * Define the property structure for the CmsSite component
 */
interface CmsSiteProps {
    context: IEpiserverContext
    path?: string
    pageData?: ServerContext
}

/**
 * The current state of the CmsSite
 */
interface CmsSiteState {
    isStateLoading: boolean;
}

/**
 * CmsSite Container component
 */
export default class CmsSite extends Component<CmsSiteProps, CmsSiteState>
{
    private _myInitialData ?: ServerContext = undefined;

    constructor(props: CmsSiteProps) {
        super(props);
        if (this.props.pageData) {
            this._myInitialData = this.props.pageData;
        } else {
            try {
                this._myInitialData = __INITIAL__DATA__;
            } catch (e) { /* Ignored on purpose */ }
        }

        this.state = { isStateLoading: false }
    }

    public componentDidMount() : void
    {
        const me : CmsSite = this;
        this.setState({isStateLoading: true});
        this.initializeWebsiteAndPage().finally(() => {
            me.setState({isStateLoading: false});
        });
    }

    protected async initializeWebsiteAndPage() : Promise<boolean>
    {
        const me : CmsSite = this;
        try {
            const ws = await this.props.context.loadCurrentWebsite();
            const c = await me.props.context.loadContentByRef("startPage");
            me.props.context.dispatch(IContentActionFactory.registerPaths(c, ['/']));
            const cPath = me.props.context.getCurrentPath();
            if (!(cPath === '/' || cPath === c.contentLink.url)) {
                const cPage = await me.props.context.loadContentByPath(cPath);
                if (cPage.contentLink.url !== cPath) {
                    me.props.context.dispatch(IContentActionFactory.registerPaths(cPage, [cPath]));
                }
            }
            return true;
        }
        catch (e) {
            return false;
        }
    }

    public render() : ReactNode {
        if (this.props.context.isServerSideRendering()) {
            if (this.props.context.isDebugActive()) console.log(' - Rendering disconnected layout');
            return this.renderDisconnected();
        } else {
            return this.renderConnected();
        }
    }

    protected renderDisconnected() : ReactNodeArray
    {
        const MyLayout = this.getLayout();
        const myStartPage : IContent = this.getInitialStartPage();
        const myContentLink : ContentLink = this.getInitialContentLink();
        const myContent : IContent = this.getInitialIContent();
        const myPath : string = this.getInitialPath();
        return [
            <Helmet   key="main-helmet" />,
            <MyLayout key="main-layout" context={ this.props.context } path={ myPath } page={ myContentLink } expandedValue={ myContent } startPage={ myStartPage } />
        ]
    }

    /**
     * Render the entire site using a layout connected to the Redux store
     */
    protected renderConnected() : ReactNode
    {
        if (this.isStateValid()) {
            const ConnectedLayout = connect(this.buildLayoutPropsFromState.bind(this))(this.getLayout());
            return <Provider store={ this.props.context.getStore() }><Helmet/><ConnectedLayout context={this.props.context} /></Provider>;
        } else {
            return Spinner.CreateInstance({});
        }
    }

    protected buildLayoutPropsFromState(state: any, ownProps: LayoutProps) : LayoutProps
    {
        try {
            const path : string = state.ViewContext.currentPath;
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

    protected isStateValid() : boolean
    {
        return this.hasWebsite() && this.hasStartPage();
    }

    protected hasStartPage() : boolean
    {
        const totalState = this.props.context.getStore().getState();
        const iContentState : IContentRepoState = totalState[IContentRepository.StateKey];

        const spId = iContentState.refs.startPage;
        if (spId && iContentState.items[spId]) {
            return true;
        }
        return false;
    }

    protected hasWebsite() : boolean
    {
        const totalState = this.props.context.getStore().getState();
        const iContentState : IContentRepoState = totalState[IContentRepository.StateKey];
        
        if (!iContentState.website) return false;

        return true;
    }

    /**
     * Retrieve the Layout from the the current context of the CMS Site
     */
    protected getLayout() : LayoutComponent
    {
        if (this.props.context.config().layout) {
            return this.props.context.config().layout;
        }
        return Layout;
    }

    protected getInitialIContent() : IContent
    {
        if (!this._myInitialData) {
            throw 'No initial data found';
        }
        if (isSerializedIContent(this._myInitialData.IContent)) {
            return JSON.parse(this._myInitialData.IContent);
        }
        return this._myInitialData.IContent;
    }

    protected getInitialStartPage() : IContent
    {
        if (!this._myInitialData) {
            throw 'No initial data found';
        }
        if (isSerializedIContent(this._myInitialData.StartPageData)) {
            return JSON.parse(this._myInitialData.StartPageData);
        }
        return this._myInitialData.StartPageData;
    }

    protected getInitialWebsite() : Website
    {
        if (!this._myInitialData) {
            throw 'No initial data found';
        }
        if (isSerializedWebsite(this._myInitialData.Website)) {
            return JSON.parse(this._myInitialData.Website);
        }
        return this._myInitialData.Website;
    }

    protected getInitialContentLink() : ContentLink
    {
        if (!this._myInitialData) {
            throw 'No initial data found';
        }
        if (isSerializedContentLink(this._myInitialData.ContentLink)) {
            return JSON.parse(this._myInitialData.ContentLink);
        }
        return this._myInitialData.ContentLink;
    }

    protected getInitialPath() : string
    {
        if (!this._myInitialData) {
            throw 'No initial data found';
        }
        return this._myInitialData.Path;
    }
}