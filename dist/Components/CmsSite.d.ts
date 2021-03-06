import React from 'react';
import { StaticRouterContext } from 'react-router';
import IEpiserverContext from '../Core/IEpiserverContext';
/**
 * Define the property structure for the CmsSite component
 */
export interface CmsSiteProps {
    staticContext?: StaticRouterContext;
    context: IEpiserverContext;
}
export declare const EpiserverWebsite: React.FunctionComponent<CmsSiteProps>;
export default EpiserverWebsite;
