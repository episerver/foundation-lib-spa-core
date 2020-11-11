"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppGlobal_1 = __importDefault(require("../AppGlobal"));
const eventemitter3_1 = __importDefault(require("eventemitter3"));
/**
 * The default event engine for the SPA
 */
class DefaultEventEngine {
    constructor() {
        this._listeners = {};
        this._events = [];
        this._eventEmitter = new eventemitter3_1.default();
        const ctx = AppGlobal_1.default();
        if (ctx.addEventListener) {
            ctx.addEventListener('message', this.onPostMessageReceived.bind(this), false);
        }
    }
    onPostMessageReceived(event) {
        if (event.data.id) {
            if (this.registerEvent(event.data.id)) {
                this.dispatch(event.data.id, event.data.data);
            }
        }
    }
    registerEvent(event) {
        if (!this.hasEvent(event)) {
            this._events.push(event);
        }
        return this;
    }
    hasEvent(event) {
        return this._events.indexOf(event) >= 0;
    }
    addListener(event, id, handler, autoRegister = false) {
        if (this._listeners[id]) {
            throw new Error(`There's already a listener with id ${id} registered`);
        }
        if (!this.hasEvent(event)) {
            if (autoRegister) {
                this.registerEvent(event);
            }
            else {
                throw new Error(`The event ${event} has not been registered.`);
            }
        }
        this._listeners[id] = handler;
        this._eventEmitter.addListener(event, handler);
        return this;
    }
    dispatch(event, ...args) {
        if (!this.hasEvent(event))
            this.registerEvent(event);
        const emitArgs = [event];
        for (const arg of args)
            emitArgs.push(arg);
        this._eventEmitter.emit.apply(this._eventEmitter, emitArgs);
    }
    removeListener(event, id) {
        if (!this._listeners[id]) {
            throw new Error(`There's no listner with ${id} present`);
        }
        this._eventEmitter.removeListener(event, this._listeners[id]);
        delete this._listeners[id];
        return this;
    }
}
exports.default = DefaultEventEngine;
