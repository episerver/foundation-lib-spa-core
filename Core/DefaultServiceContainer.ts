import IServiceContainer, { IContainerAwareService, IContextAwareService, DefaultServices } from './IServiceContainer';

export default class DefaultServiceContainer implements IServiceContainer
{
    protected services : { [key: string] : any } = {};

    protected isContainerAwareService(service: any) : service is IContainerAwareService
    {
        try {
            return (service as unknown as IContainerAwareService).setServiceContainer && typeof((service as unknown as IContainerAwareService).setServiceContainer) === "function";
        } catch (e) {
            // Intentionally ignore errors
        }
        return false;
    }

    protected isContextAwareService(service: any) : service is IContextAwareService
    {
        try {
            return (service as unknown as IContextAwareService).setContext && typeof((service as unknown as IContextAwareService).setContext) === "function";
        } catch (e) {
            // Intentionally ignore errors
        }
        return false;
    }

    public addService<T> (key: string, service: T)
    {
        if (this.services[key]) throw new Error(`The service ${ key } has already been registered`);
        this.services[key] = this.injectDependencies(service);
        return this;
    }

    public setService<T> (key: string, service: T)
    {
        this.services[key] = this.injectDependencies(service);
        return this;
    }

    protected injectDependencies<T>(service: T): T
    {
        if (this.isContainerAwareService(service))
        {
            service.setServiceContainer(this);
        }
        this.getServiceNames().forEach(key => {
            const methodName = `set${key}`;
            if ((service as any)[methodName] && typeof((service as any)[methodName]) == 'function') {
                console.debug(`Injecting service ${key} into`, service);
                (service as any)[methodName](this.getService(key));
            }
        })
        return service;
    }

    public hasService(key: string)
    {
        return this.services[key] !== undefined;
    }

    public getService<T>(key: string) : T
    {
        if (this.hasService(key)) {
            return this.services[key] as T;
        }
        throw new Error(`The service ${ key } has not been registered in the container.`);
    }

    public extendService<T>(key: string, service: T)
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
        const services : string[] = [];
        for (const key in this.services) {
            services.push(key);
        }
        return services;
    }
}