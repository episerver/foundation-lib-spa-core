import AppGlobal from '../AppGlobal';
import EventEmitter from 'eventemitter3';
/**
 * The default event engine for the SPA
 */
export default class DefaultEventEngine {
    constructor() {
        this._listeners = {};
        this._events = [];
        this._debug = false;
        this._eventEmitter = new EventEmitter();
        const ctx = AppGlobal();
        if (ctx.addEventListener) {
            ctx.addEventListener('message', this.onPostMessageReceived.bind(this), false);
        }
    }
    get debug() {
        return this._debug;
    }
    set debug(val) {
        this._debug = val;
    }
    log(...args) {
        if (this.debug)
            console.debug(...args);
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
            this.log('Registering event', event);
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
        this.log('Registering event handler', event, id, handler);
        this._listeners[id] = handler;
        this._eventEmitter.addListener(event, handler);
        return this;
    }
    dispatch(event, ...args) {
        if (!this.hasEvent(event))
            this.registerEvent(event);
        this.log('Dispatching event', event, args);
        const emitArgs = [event, ...args];
        this._eventEmitter.emit(...emitArgs);
    }
    removeListener(event, id) {
        if (!this._listeners[id])
            throw new Error(`There's no listner with ${id} present`);
        this.log('Removing event handler', event, id);
        this._eventEmitter.removeListener(event, this._listeners[id]);
        delete this._listeners[id];
        return this;
    }
}
//# sourceMappingURL=DefaultEventEngine.js.map