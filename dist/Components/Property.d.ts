import React, { HTMLAttributes, ReactElement } from 'react';
import IContent from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
export type PropertyProps<T extends IContent> = HTMLAttributes<HTMLElement> & {
    /**
     * The IContent from which a property will be rendered by this component
     *
     * @var { T }
     */
    iContent: T;
    /**
     * The property name of the property that will be rendered by this component
     *
     * @var { string }
     */
    field: keyof T;
    /**
     * The Episerver Context shouldn't be passed down, as it will be accessed through React Hooks
     *
     * @deprecated
     * @var { IEpiserverContext }
     */
    context?: IEpiserverContext;
    /**
     * The CSS class that must be applied to this property when it's rendered
     *
     * @var { string }
     */
    className?: string;
};
export declare function Property<T extends IContent>(props: React.PropsWithChildren<PropertyProps<T>>): ReactElement<unknown> | null;
export declare namespace Property {
    var displayName: string;
}
export default Property;
