import { ComponentProps } from '../EpiComponent';
import IContent from '../Models/IContent';
import { IComponentLoader, TComponentType } from './ComponentLoader';
export default class CoreIComponentLoader implements IComponentLoader {
    private get PREFIX();
    get order(): number;
    protected debug: boolean;
    canLoad(componentName: string): boolean;
    load<T = ComponentProps<IContent>>(componentName: string): Promise<TComponentType<T>>;
    setDebug(debug: boolean): void;
}
