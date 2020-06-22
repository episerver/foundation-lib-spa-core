import IEventEngine, { IListener } from './IEventEngine';
import AppGlobal from '../AppGlobal';

/**
 * The store of registered listeners
 */
interface IListenerStore {
    [event: string]: Array<IListener>;
}

/**
 * The default event engine for the SPA
 */
export default class DefaultEventEngine implements IEventEngine {
    protected listeners: IListenerStore;
    protected events: Array<string>;

    public constructor() {
        this.listeners = {};
        this.events = [];

        let ctx = AppGlobal();
        if (ctx.addEventListener) {
          ctx.addEventListener('message', this.onPostMessageReceived.bind(this), false);
        }
    }

    protected onPostMessageReceived(event: MessageEvent) {
        if (event.data.id) {
            if (this.registerEvent(event.data.id)) {
              this.dispatch(event.data.id, event.data.data);
            }
        }
    }

    public registerEvent(event: string): IEventEngine {
        if (this.events.indexOf(event) == -1) {
            this.events.push(event);
            this.listeners[event] = [];
        }
        return this;
    }

    public hasEvent(event: string): boolean {
        return this.events.indexOf(event) >= 0;
    }

    public addListener(event: string, id: string, handler: (...args: any[]) => void, autoRegister: boolean = false): IEventEngine 
    {
        if (!this.hasEvent(event)) {
            if (autoRegister) {
                this.registerEvent(event);
            } else {
                throw `The event ${event} has not been registered.`;
            }
        }
        if (this.listeners[event].some(value => value.id == id)) {
            throw `There's already a listener with id ${id} registered for the event ${event}`;
        }

        this.listeners[event].push({ callback: handler, id: id });
        return this;
    }

    public dispatch(event: string, ...args: any[]): void {
        if (!this.hasEvent(event)) {
            this.registerEvent(event);
        }
        let ctx = this;
        this.listeners[event].forEach((l: IListener) => {
            l.callback.apply(ctx, args);
        });
    }

    public removeListener(event: string, id: string): IEventEngine {
        return this;
    }
}