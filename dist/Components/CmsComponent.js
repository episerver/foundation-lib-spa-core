import React from 'react';
import { useEpiserver } from '../Hooks/Context';
import EpiComponent from './EpiComponent';
/**
 * Dynamic component which loads both the ReactComponent & iContent data based upon the content link
 * provided.
 *
 * @deprecated  Use the EpiComponent Component instead
 */
export const CmsComponent = (props) => {
    const ctx = useEpiserver();
    if (ctx.isDebugActive()) {
        console.warn('The CmsComponent has been depricated, use the EpiComponent instead.');
    }
    const DynamicComponent = EpiComponent.CreateComponent(ctx);
    return React.createElement(DynamicComponent, Object.assign({}, props));
};
export default CmsComponent;
//# sourceMappingURL=CmsComponent.js.map