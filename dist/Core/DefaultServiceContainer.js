"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultServiceContainer = /** @class */ (function () {
    function DefaultServiceContainer() {
        this.services = {};
    }
    DefaultServiceContainer.prototype.isContainerAwareService = function (service) {
        try {
            return service.setServiceContainer && typeof (service.setServiceContainer) === "function";
        }
        catch (e) {
            // Intentionally ignore errors
        }
        return false;
    };
    DefaultServiceContainer.prototype.isContextAwareService = function (service) {
        try {
            return service.setContext && typeof (service.setContext) === "function";
        }
        catch (e) {
            // Intentionally ignore errors
        }
        return false;
    };
    DefaultServiceContainer.prototype.addService = function (key, service) {
        if (this.services[key])
            throw new Error("The service " + key + " has already been registered");
        this.services[key] = this.injectDependencies(service);
        return this;
    };
    DefaultServiceContainer.prototype.setService = function (key, service) {
        this.services[key] = this.injectDependencies(service);
        return this;
    };
    DefaultServiceContainer.prototype.injectDependencies = function (service) {
        var _this = this;
        if (this.isContainerAwareService(service)) {
            service.setServiceContainer(this);
        }
        this.getServiceNames().forEach(function (key) {
            var methodName = "set" + key;
            if (service[methodName] && typeof (service[methodName]) == 'function') {
                console.debug("Injecting service " + key + " into", service);
                service[methodName](_this.getService(key));
            }
        });
        return service;
    };
    DefaultServiceContainer.prototype.hasService = function (key) {
        return this.services[key] !== undefined;
    };
    DefaultServiceContainer.prototype.getService = function (key) {
        if (this.hasService(key)) {
            return this.services[key];
        }
        throw new Error("The service " + key + " has not been registered in the container.");
    };
    DefaultServiceContainer.prototype.extendService = function (key, service) {
        if (!this.hasService(key)) {
            throw new Error('Cannot extend an unknown service');
        }
        this.services[key] = Object.assign(this.services[key], service);
        console.warn("Extended service " + key + ":", this.services[key]);
        return this;
    };
    DefaultServiceContainer.prototype.getServiceNames = function () {
        var services = [];
        for (var key in this.services) {
            services.push(key);
        }
        return services;
    };
    return DefaultServiceContainer;
}());
exports.default = DefaultServiceContainer;
