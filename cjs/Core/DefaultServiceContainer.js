"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultServiceContainer = void 0;
const IServiceContainer_1 = require("./IServiceContainer");
class DefaultServiceContainer {
    constructor() {
        this.services = {};
        this.factories = {};
    }
    addService(key, service) {
        if (this.services[key])
            throw new Error(`The service ${key} has already been registered`);
        this.services[key] = this.injectDependencies(service);
        return this;
    }
    addFactory(key, service) {
        if (this.factories[key] || this.services[key])
            throw new Error(`The service ${key} has already been registered`);
        this.factories[key] = service;
        return this;
    }
    setService(key, service) {
        this.services[key] = this.injectDependencies(service);
        return this;
    }
    setFactory(key, service) {
        this.factories[key] = service;
        return this;
    }
    injectDependencies(service) {
        if (IServiceContainer_1.isContainerAwareService(service))
            service.setServiceContainer(this);
        if (IServiceContainer_1.isContextAwareService(service))
            service.setContext(this.getService("Context" /* Context */));
        this.getServiceNames().forEach(key => {
            if (key == "Context" /* Context */)
                return;
            const methodName = `set${key}`;
            if (service[methodName] && typeof (service[methodName]) === 'function') {
                console.debug(`Injecting service ${key} into`, service);
                service[methodName](this.getService(key));
            }
        });
        return service;
    }
    hasService(key) {
        return this.hasInstantiatedService(key) || this.hasFactoryService(key);
    }
    hasInstantiatedService(key) {
        return this.services[key] !== undefined;
    }
    hasFactoryService(key) {
        return this.factories[key] !== undefined;
    }
    getService(key, guard) {
        if (this.hasInstantiatedService(key)) {
            const service = this.services[key];
            if (guard && !guard(service))
                throw (`The service ${key} exists but is rejected by the guard`);
            return service;
        }
        else if (this.hasFactoryService(key)) {
            const service = this.injectDependencies(this.factories[key](this));
            if (guard && !guard(service))
                throw (`The service ${key} exists but is rejected by the guard`);
            this.services[key] = service;
            return service;
        }
        throw new Error(`The service ${key} has not been registered in the container.`);
    }
    extendService(key, service) {
        if (!this.hasService(key)) {
            throw new Error('Cannot extend an unknown service');
        }
        this.services[key] = Object.assign(this.services[key], service);
        console.warn(`Extended service ${key}:`, this.services[key]);
        return this;
    }
    getServiceNames() {
        return Object.keys(this.services);
    }
}
exports.DefaultServiceContainer = DefaultServiceContainer;
exports.default = DefaultServiceContainer;
//# sourceMappingURL=DefaultServiceContainer.js.map