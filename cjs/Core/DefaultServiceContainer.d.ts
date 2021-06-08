import IServiceContainer, { IContainerAwareService, IContextAwareService } from './IServiceContainer';
export declare class DefaultServiceContainer implements IServiceContainer {
    protected services: {
        [key: string]: any;
    };
    protected isContainerAwareService(service: any): service is IContainerAwareService;
    protected isContextAwareService(service: any): service is IContextAwareService;
    addService<T>(key: string, service: T): this;
    setService<T>(key: string, service: T): this;
    protected injectDependencies<T>(service: T): T;
    hasService(key: string): boolean;
    getService<T>(key: string): T;
    extendService<T>(key: string, service: T): this;
    protected getServiceNames(): string[];
}
export default DefaultServiceContainer;
