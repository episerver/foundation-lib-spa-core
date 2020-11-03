import { FunctionComponent } from 'react';
import IContent from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
import { ComponentProps } from '../EpiComponent';
/**
 * The base type for the Episerver CMS Component
 */
export declare type EpiComponentType<T extends IContent = IContent> = FunctionComponent<EpiComponentProps<T>> & {
    CreateComponent<C extends IContent = IContent>(context: IEpiserverContext): EpiComponentType<C>;
};
/**
 * The properties for the Episerver CMS Component
 */
export declare type EpiComponentProps<T extends IContent = IContent> = Omit<ComponentProps<T>, "data" | "context"> & {
    /**
     * The data for the component, if it has been fetched before.
     */
    expandedValue?: IContent;
    /**
     * Legacy context, kept as argument for now, but ignored by the implementation
     *
     * @deprecated
     */
    context?: IEpiserverContext;
};
/**
 * The Episerver CMS Component wrapper
 */
export declare const EpiComponent: EpiComponentType;
export default EpiComponent;
