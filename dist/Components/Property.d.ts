import { HTMLAttributes, PropsWithChildren, ReactElement } from 'react';
import IContent from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
export declare type PropertyProps<T extends IContent> = HTMLAttributes<HTMLElement> & {
    iContent: T;
    field: keyof T;
    context?: IEpiserverContext;
    className?: string;
};
export declare function Property<T extends IContent>(props: PropsWithChildren<PropertyProps<T>>): ReactElement<any, any> | null;
export default Property;
