import { ReactNode, Component, PropsWithChildren } from 'react';
import { LayoutComponent, LayoutProps } from './Layout';
import IEpiserverContext from '../Core/IEpiserverContext';
import ServerContext from '../ServerSideRendering/ServerContext';
/**
 * Define the property structure for the CmsSite component
 */
interface CmsSiteProps {
    context: IEpiserverContext;
    path?: string;
    serverContext?: ServerContext;
}
interface CmsSiteState {
    isInitializing: boolean;
}
/**
 * CmsSite Container component
 */
export default class CmsSite extends Component<PropsWithChildren<CmsSiteProps>, CmsSiteState> {
    constructor(props: PropsWithChildren<CmsSiteProps>);
    componentDidMount(): void;
    protected initializeWebsiteAndPage(): Promise<boolean>;
    render(): ReactNode;
    protected buildLayoutPropsFromState(state: any, ownProps: LayoutProps): LayoutProps;
    protected isStateValid(): boolean;
    protected hasStartPage(): boolean;
    protected hasWebsite(): boolean;
    protected hasPath(): boolean;
    /**
     * Retrieve the Layout from the the current context of the CMS Site
     */
    protected getLayout(): LayoutComponent;
}
export {};
