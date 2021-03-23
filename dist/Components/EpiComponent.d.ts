import React from 'react';
import IContent from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
import { ComponentProps } from '../EpiComponent';
/**
 * The base type for the Episerver CMS Component
 */
export declare type EpiBaseComponentType<T extends IContent = IContent> = React.ComponentType<EpiComponentProps<T>>;
export declare type EpiComponentType<T extends IContent = IContent> = EpiBaseComponentType<T> & {
    CreateComponent(context: IEpiserverContext): EpiBaseComponentType<IContent>;
};
/**
 * The properties for the Episerver CMS Component
 */
export declare type EpiComponentProps<T extends IContent = IContent> = Omit<ComponentProps<T>, "data" | "context"> & {
    /**
     * The data for the component, if it has been fetched before.
     */
    expandedValue: T | undefined;
    /**
     * Legacy context, kept as argument for now, but ignored by the implementation
     *
     * @deprecated
     */
    context?: IEpiserverContext;
};
declare const EpiComponent: EpiComponentType;
export default EpiComponent;
