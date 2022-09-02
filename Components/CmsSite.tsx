// Import libraries
import React, { FunctionComponent, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Provider as ReduxProvider } from 'react-redux';
import { Route, StaticRouterContext } from 'react-router';
import axios from 'axios';
import NProgress from 'nprogress';

// Import Episerver Core CMS
import IEpiserverContext from '../Core/IEpiserverContext';
import EpiserverContext, { useEpiserver } from '../Hooks/Context';

// Import Episerver Taxonomy
import Layout, { LayoutComponent, NotFoundComponent } from './Layout';

// Import Episerver Components
import EpiRouter, { RoutedContent } from '../Routing/EpiSpaRouter';
import IServerContextAccessor from '../ServerSideRendering/IServerContextAccessor';
import { DefaultServices } from '../Core/IServiceContainer';
import CmsCommunicator from './CmsCommunicator';
import getGlobal from '../AppGlobal';

/**
 * Define the property structure for the CmsSite component
 */
export interface CmsSiteProps {
  staticContext?: StaticRouterContext;
  context: IEpiserverContext;
}

let numberOfAjaxCAllPending = 0;

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    numberOfAjaxCAllPending++;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    numberOfAjaxCAllPending--;
    if (numberOfAjaxCAllPending === 0) {
      // hide loader
      NProgress.done();
    }
    return response;
  },
  function (error) {
    numberOfAjaxCAllPending--;
    if (numberOfAjaxCAllPending === 0) {
      // hide loader
      NProgress.done();
    }
    return Promise.reject(error);
  },
);

export const EpiserverWebsite: React.FunctionComponent<CmsSiteProps> = (props) => {
  const SiteLayout = getLayout(props.context);
  const NotFoundComponent = getNotFound(props.context);
  const ssr = props.context.serviceContainer.getService<IServerContextAccessor>(DefaultServices.ServerContext);
  const location = (props.context.isServerSideRendering() ? ssr.Path : window.location.pathname) || undefined;
  const epi = props.context.getStore();
  const global = getGlobal();

  useEffect(() => {
    if (!epi || !global?.__INITIAL__DATA__) return;

    epi.dispatch({
      type: 'OptiContentCloud/SetState',
      initialState: global.__INITIAL__DATA__,
    });
  }, [epi, global?.__INITIAL__DATA__]);

  useEffect(() => {
    NProgress.start();
  }, [location]);

  return (
    <ReduxProvider store={props.context.getStore()}>
      <EpiserverContext.Provider value={props.context}>
        <Helmet />
        <CmsCommunicator />
        <EpiRouter location={location} context={props.staticContext}>
          <SiteLayout context={props.context}>
            <RoutedContent config={props.context.config().routes || []} keyPrefix="CmsSite-RoutedContent" />
            <Route component={NotFoundComponent} />
            {props.children}
          </SiteLayout>
        </EpiRouter>
      </EpiserverContext.Provider>
    </ReduxProvider>
  );
};

function getLayout(context: IEpiserverContext): LayoutComponent {
  return context.config().layout || Layout;
}

function getNotFound(context: IEpiserverContext): FunctionComponent {
  return context.config().notFoundComponent || NotFoundComponent;
}

EpiserverWebsite.displayName = 'Optimizely CMS: Website';
export default EpiserverWebsite;
