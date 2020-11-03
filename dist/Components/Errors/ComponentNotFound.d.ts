import { ReactNode } from 'react';
import EpiComponent from '../../EpiComponent';
import IContent from '../../Models/IContent';
export default class ComponentNotFound extends EpiComponent<IContent> {
    static displayName: string;
    render(): ReactNode;
}
