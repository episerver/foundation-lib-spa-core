import { ReactNode } from 'react';
import { BaseEpiComponent, ComponentProps } from '../../EpiComponent';
import IContent from '../../Models/IContent';
export interface ComponentNotFoundProps extends ComponentProps<IContent> {
}
export default class ComponentNotFound extends BaseEpiComponent<ComponentNotFoundProps> {
    static displayName: string;
    render(): ReactNode;
}
