"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppGlobal_1 = __importDefault(require("../AppGlobal"));
/**
 * The default event engine for the SPA
 */
class DefaultEventEngine {
    constructor() {
        this.listeners = {};
        this.events = [];
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
        if (this.events.indexOf(event) === -1) {
            this.events.push(event);
            this.listeners[event] = [];
        }
        return this;
    }
    hasEvent(event) {
        return this.events.indexOf(event) >= 0;
    }
    addListener(event, id, handler, autoRegister = false) {
        if (!this.hasEvent(event)) {
            if (autoRegister) {
                this.registerEvent(event);
            }
            else {
                throw new Error(`The event ${event} has not been registered.`);
            }
        }
        if (this.listeners[event].some(value => value.id === id)) {
            throw new Error(`There's already a listener with id ${id} registered for the event ${event}`);
        }
        this.listeners[event].push({ callback: handler, id });
        return this;
    }
    dispatch(event, ...args) {
        if (!this.hasEvent(event)) {
            this.registerEvent(event);
        }
        const ctx = this;
        this.listeners[event].forEach((l) => {
            l.callback.apply(ctx, args);
        });
    }
    removeListener(event, id) {
        return this;
    }
}
exports.default = DefaultEventEngine;
