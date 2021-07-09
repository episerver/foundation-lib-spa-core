import IServiceContainer from './IServiceContainer';
export declare class DefaultServiceContainer implements IServiceContainer {
    protected services: {
        [key: string]: unknown;
    };
    protected factories: {
        [key: string]: (container: IServiceContainer) => unknown;
    };
    addService<T>(key: string, service: T): IServiceContainer;
    addFactory<T>(key: string, service: (container: IServiceContainer) => T): IServiceContainer;
    setService<T>(key: string, service: T): IServiceContainer;
    setFactory<T>(key: string, service: (container: IServiceContainer) => T): IServiceContainer;
    protected injectDependencies<T>(service: T): T;
    hasService(key: string): boolean;
    protected hasInstantiatedService(key: string): boolean;
    protected hasFactoryService(key: string): boolean;
    getService<T>(key: string, guard?: (toTest: unknown) => toTest is T): T;
    extendService<T>(key: string, service: T): IServiceContainer;
    protected getServiceNames(): string[];
}
export default DefaultServiceContainer;
