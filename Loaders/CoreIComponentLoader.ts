import { ComponentProps } from '../EpiComponent';
import IContent from '../Models/IContent';
import { IComponentLoader, TComponentType } from './ComponentLoader';

export default class CoreIComponentLoader implements IComponentLoader 
{
    private get PREFIX() : string {
        return "app/Components/";
    }

    public get order() : number {
        return 100;
    }

    protected debug = false;

    public canLoad(componentName: string) : boolean {
        return componentName.startsWith(this.PREFIX);
    }

    public async load<T = ComponentProps<IContent>>(componentName: string) : Promise<TComponentType<T>>
    {
        if (this.debug) console.debug(`Loading component: ${ componentName }`);
        const component = componentName.substr(15);
        return import(
            /* webpackInclude: /\.tsx$/ */
            /* webpackExclude: /\.noimport\.tsx$/ */
            /* webpackChunkName: "components" */
            /* webpackPrefetch: true */
            /* webpackMode: "lazy-once" */
            "app/Components/" + component) // Can't use the constant here, as it will Prevent Webpack from properly loading the component
            .then(exports => {
                if (!(exports && exports.default)) throw new Error(`The component ${ componentName } does not have a default export`);
                const c = exports.default;
                if (this.debug) console.debug(`Finished loading component: ${ componentName }`, c);
                return c;
            });
    }

    public setDebug(debug: boolean) : void
    {
        this.debug = debug;
    }
    
}