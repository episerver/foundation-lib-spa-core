import React, { ComponentType, ComponentElement } from 'react';
import EpiComponent, { EpiComponentProps } from './EpiComponent';

namespace CmsComponentNamespace {
    export function render (props: EpiComponentProps) : ComponentElement<EpiComponentProps, any> {
        if (props.context.isDebugActive()) {
            console.warn('The CmsComponent has been depricated, use the EpiComponent instead.');
        }
        const DynamicComponent = EpiComponent.CreateComponent(props.context);
        return <DynamicComponent {...props} />
    }
}

/**
 * Dynamic component which loads both the ReactComponent & iContent data based upon the content link
 * provided.
 * 
 * @deprecated
 */
const CmsComponent : ComponentType<EpiComponentProps> = CmsComponentNamespace.render;
export default CmsComponent;
export { CmsComponent } 