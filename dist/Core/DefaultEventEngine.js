"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var AppGlobal_1 = __importDefault(require("../AppGlobal"));
/**
 * The default event engine for the SPA
 */
var DefaultEventEngine = /** @class */ (function () {
    function DefaultEventEngine() {
        this.listeners = {};
        this.events = [];
        var ctx = AppGlobal_1.default();
        if (ctx.addEventListener) {
            ctx.addEventListener('message', this.onPostMessageReceived.bind(this), false);
        }
    }
    DefaultEventEngine.prototype.onPostMessageReceived = function (event) {
        if (event.data.id) {
            if (this.registerEvent(event.data.id)) {
                this.dispatch(event.data.id, event.data.data);
            }
        }
    };
    DefaultEventEngine.prototype.registerEvent = function (event) {
        if (this.events.indexOf(event) == -1) {
            this.events.push(event);
            this.listeners[event] = [];
        }
        return this;
    };
    DefaultEventEngine.prototype.hasEvent = function (event) {
        return this.events.indexOf(event) >= 0;
    };
    DefaultEventEngine.prototype.addListener = function (event, id, handler, autoRegister) {
        if (autoRegister === void 0) { autoRegister = false; }
        if (!this.hasEvent(event)) {
            if (autoRegister) {
                this.registerEvent(event);
            }
            else {
                throw "The event " + event + " has not been registered.";
            }
        }
        if (this.listeners[event].some(function (value) { return value.id == id; })) {
            throw "There's already a listener with id " + id + " registered for the event " + event;
        }
        this.listeners[event].push({ callback: handler, id: id });
        return this;
    };
    DefaultEventEngine.prototype.dispatch = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.hasEvent(event)) {
            this.registerEvent(event);
        }
        var ctx = this;
        this.listeners[event].forEach(function (l) {
            l.callback.apply(ctx, args);
        });
    };
    DefaultEventEngine.prototype.removeListener = function (event, id) {
        return this;
    };
    return DefaultEventEngine;
}());
exports.default = DefaultEventEngine;
