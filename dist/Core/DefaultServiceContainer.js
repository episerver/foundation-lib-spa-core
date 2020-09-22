"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultServiceContainer {
    constructor() {
        this.services = {};
    }
    isContainerAwareService(service) {
        try {
            return service.setServiceContainer && typeof (service.setServiceContainer) === "function";
        }
        catch (e) {
            // Intentionally ignore errors
        }
        return false;
    }
    isContextAwareService(service) {
        try {
            return service.setContext && typeof (service.setContext) === "function";
        }
        catch (e) {
            // Intentionally ignore errors
        }
        return false;
    }
    addService(key, service) {
        if (this.services[key])
            throw new Error(`The service ${key} has already been registered`);
        this.services[key] = this.injectDependencies(service);
        return this;
    }
    setService(key, service) {
        this.services[key] = this.injectDependencies(service);
        return this;
    }
    injectDependencies(service) {
        if (this.isContainerAwareService(service)) {
            service.setServiceContainer(this);
        }
        this.getServiceNames().forEach(key => {
            const methodName = `set${key}`;
            if (service[methodName] && typeof (service[methodName]) == 'function') {
                console.debug(`Injecting service ${key} into`, service);
                service[methodName](this.getService(key));
            }
        });
        return service;
    }
    hasService(key) {
        return this.services[key] !== undefined;
    }
    getService(key) {
        if (this.hasService(key)) {
            return this.services[key];
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
        const services = [];
        for (const key in this.services) {
            services.push(key);
        }
        return services;
    }
}
exports.default = DefaultServiceContainer;
