import { ComponentProps } from '../EpiComponent';
import IContent from '../Models/IContent';
import { IComponentLoader, TComponentTypePromise } from './ComponentLoader';
export default class CoreIComponentLoader implements IComponentLoader {
    private get PREFIX();
    get order(): number;
    protected debug: boolean;
    canLoad(componentName: string): boolean;
    load<T = ComponentProps<IContent>>(componentName: string): TComponentTypePromise<T>;
    setDebug(debug: boolean): void;
}
