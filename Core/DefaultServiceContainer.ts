import IServiceContainer, { isContainerAwareService, isContextAwareService, DefaultServices } from './IServiceContainer';

export class DefaultServiceContainer implements IServiceContainer
{
    protected services : { [key: string] : unknown } = {};
    protected factories : { [ key: string ] : (container: IServiceContainer) => unknown } = {};

    public addService<T> (key: string, service: T) : IServiceContainer
    {
        if (this.services[key]) throw new Error(`The service ${ key } has already been registered`);
        this.services[key] = this.injectDependencies(service);
        return this;
    }

    public addFactory<T> (key: string, service: (container: IServiceContainer) => T) : IServiceContainer
    {
        if (this.factories[key] || this.services[key]) throw new Error(`The service ${ key } has already been registered`);
        this.factories[key] = service;
        return this;
    }

    public setService<T> (key: string, service: T) : IServiceContainer
    {
        this.services[key] = this.injectDependencies(service);
        return this;
    }

    public setFactory<T> (key: string, service: (container: IServiceContainer) => T) : IServiceContainer
    {
        this.factories[key] = service;
        return this;
    }

    protected injectDependencies<T>(service: T): T
    {
        if (isContainerAwareService(service))
            service.setServiceContainer(this);
        if (isContextAwareService(service))
            service.setContext(this.getService(DefaultServices.Context));
        this.getServiceNames().forEach(key => {
            if (key == DefaultServices.Context) 
                return;
            const methodName = `set${ key }`;
            if ((service as any)[methodName] && typeof((service as any)[methodName]) === 'function') {
                console.debug(`Injecting service ${key} into`, service);
                (service as any)[methodName](this.getService(key));
            }
        })
        return service;
    }

    public hasService(key: string) : boolean
    {
        return this.hasInstantiatedService(key) || this.hasFactoryService(key);
    }

    protected hasInstantiatedService(key: string) : boolean
    {
        return this.services[key] !== undefined;
    }

    protected hasFactoryService(key: string) : boolean
    {
        return this.factories[key] !== undefined;
    }

    public getService<T>(key: string, guard ?: (toTest: unknown) => toTest is T) : T
    {
        if (this.hasInstantiatedService(key)) {
            const service = this.services[key];
            if (guard && !guard(service))
                throw(`The service ${ key } exists but is rejected by the guard`);
            return service as T;
        } else if (this.hasFactoryService(key)) {
            const service = this.injectDependencies(this.factories[key](this) as T);
            if (guard && !guard(service))
                throw(`The service ${ key } exists but is rejected by the guard`);
            this.services[key] = service;
            return service as T;
        }
        throw new Error(`The service ${ key } has not been registered in the container.`);
    }

    public extendService<T>(key: string, service: T) : IServiceContainer
    {
        if (!this.hasService(key)) {
            throw new Error('Cannot extend an unknown service');
        }
        this.services[key] = Object.assign(this.services[key], service);
        console.warn(`Extended service ${ key }:`,this.services[key]);

        return this;
    }

    protected getServiceNames() : string[]
    {
        return Object.keys(this.services);
    }
}
export default DefaultServiceContainer;