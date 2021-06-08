import IEventEngine from './IEventEngine';
import AppGlobal from '../AppGlobal';
import EventEmitter from 'eventemitter3';

/**
 * The default event engine for the SPA
 */
export class DefaultEventEngine implements IEventEngine {
    protected _eventEmitter : EventEmitter<string, unknown>;
    protected _listeners : { [key: string] : (...args: unknown[]) => void } = {};
    protected _events : string[] = [];
    protected _debug = false;

    public get debug() : boolean {
        return this._debug;
    }
    public set debug(val : boolean)
    {
        this._debug = val;
    }

    public constructor() {
        this._eventEmitter = new EventEmitter<string, unknown>();

        const ctx = AppGlobal();
        if (ctx.addEventListener) {
          ctx.addEventListener('message', this.onPostMessageReceived.bind(this), false);
        }
    }

    protected log(...args : unknown[]) : void
    {
        if (this.debug) console.debug(...args);
    }

    protected onPostMessageReceived(event: MessageEvent) : void
    {
        if (event.data.id) {
            if (this.registerEvent(event.data.id)) {
              this.dispatch(event.data.id, event.data.data);
            }
        }
    }

    public registerEvent(event: string): IEventEngine {
        if (!this.hasEvent(event)) {
            this.log('Registering event', event);
            this._events.push(event);
        }
        return this;
    }

    public hasEvent(event: string): boolean {
        return this._events.indexOf(event) >= 0;
    }

    public addListener(event: string, id: string, handler: (...args: unknown[]) => void, autoRegister = false): IEventEngine 
    {
        if (this._listeners[id]) {
            throw new Error(`There's already a listener with id ${ id } registered`);
        }
        if (!this.hasEvent(event)) {
            if (autoRegister) {
                this.registerEvent(event);
            } else {
                throw new Error(`The event ${event} has not been registered.`);
            }
        }

        this.log('Registering event handler', event, id, handler);
        this._listeners[id] = handler;
        this._eventEmitter.addListener(event, handler);
        return this;
    }

    public dispatch(event: string, ...args: unknown[]): void
    {
        if (!this.hasEvent(event)) this.registerEvent(event);
        this.log('Dispatching event', event, args);
        const emitArgs : [ event: string, ...args: unknown[] ] = [ event, ...args ];
        this._eventEmitter.emit( ...emitArgs );
    }

    public removeListener(event: string, id: string): IEventEngine 
    {
        if (!this._listeners[id])
            throw new Error(`There's no listner with ${ id } present`);
        
        this.log('Removing event handler', event, id);
        this._eventEmitter.removeListener(event, this._listeners[id]);
        delete this._listeners[id];
        return this;
    }
}
export default DefaultEventEngine;