// Import libraries
import React, {ReactNode, Component, PropsWithChildren} from 'react';
import {Helmet} from 'react-helmet';
import { Provider, connect } from 'react-redux';

// Import Episerver CMS
import Layout, { LayoutComponent, LayoutProps } from './Layout';
import IContent from '../Models/IContent';
import ContentLink from '../Models/ContentLink';
import IEpiserverContext from '../Core/IEpiserverContext';
import { IContentActionFactory } from '../Repository/IContent';
import ServerContext from '../ServerSideRendering/ServerContext';
import Spinner from './Spinner';
import { DefaultServices } from '../Core/IServiceContainer';
import * as EpiSpaRouter from '../Routing/EpiSpaRouter';
import AppConfig from '../AppConfig';


/**
 * Define the property structure for the CmsSite component
 */
interface CmsSiteProps {
    context: IEpiserverContext
    path?: string
    serverContext?: ServerContext
}

interface CmsSiteState {
    isInitializing: boolean
}

/**
 * CmsSite Container component
 */
export default class CmsSite extends Component<PropsWithChildren<CmsSiteProps>, CmsSiteState>
{
    constructor(props: PropsWithChildren<CmsSiteProps>) {
        super(props);
        this.state = {
            isInitializing: false
        }
    }

    public componentDidMount() : void
    {
        if (this.isStateValid()) return;
        this.setState({isInitializing: true});
        this.initializeWebsiteAndPage().finally(() => {
            this.setState({isInitializing: false});
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
        if (!this.isStateValid()) {
            return Spinner.CreateInstance({});
        }
        const config = this.props.context.serviceContainer.getService<AppConfig>(DefaultServices.Config);
        let props : LayoutProps = { context: this.props.context };
        let MyLayout : LayoutComponent = this.getLayout();
        if (this.props.context.isServerSideRendering()) {
            if (this.props.context.isDebugActive()) console.log(' - Server side: building layout props');
            props = {
                ...props,
                path: this.props.context.getCurrentPath(),
                page: this.props.context.getRoutedContent().contentLink,
                expandedValue: this.props.context.getRoutedContent(),
                startPage: this.props.context.getContentByRef('startPage') as IContent
            }
        } else {
            if (this.props.context.isDebugActive()) console.log(' - Browser side: connecting layout');
            MyLayout = connect(this.buildLayoutPropsFromState.bind(this))(MyLayout) as unknown as LayoutComponent;
        }

        return <Provider store={ this.props.context.getStore() }>
            <EpiSpaRouter.Router>
                <Helmet />
                <MyLayout { ...props }>
                    <EpiSpaRouter.RoutedContent config={ config.routes || [] } keyPrefix="CmsSite-RoutedContent" />
                    { this.props.children }
                </MyLayout>
            </EpiSpaRouter.Router>
        </Provider>
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
        return this.state.isInitializing === false && this.hasWebsite() && this.hasStartPage();
    }

    protected hasStartPage() : boolean
    {
        return this.props.context.getContentByRef('startPage') ? true : false;
    }

    protected hasWebsite() : boolean
    {
        return this.props.context.getCurrentWebsite() ? true : false;
    }

    protected hasPath() : boolean
    {
        let isPath : boolean = false;
        try {
            const p = this.props.context.getCurrentPath();
            isPath = typeof(p) === "string" && p.length >= 0;
        } catch (e) {
            return false;
        }
        return isPath;
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
}