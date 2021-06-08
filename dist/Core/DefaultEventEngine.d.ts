import IEventEngine from './IEventEngine';
import EventEmitterStatic from 'eventemitter3';
/**
 * The default event engine for the SPA
 */
export declare class DefaultEventEngine implements IEventEngine {
    protected _eventEmitter: EventEmitterStatic<string, unknown>;
    protected _listeners: {
        [key: string]: (...args: unknown[]) => void;
    };
    protected _events: string[];
    protected _debug: boolean;
    get debug(): boolean;
    set debug(val: boolean);
    constructor();
    protected log(...args: unknown[]): void;
    protected onPostMessageReceived(event: MessageEvent): void;
    registerEvent(event: string): IEventEngine;
    hasEvent(event: string): boolean;
    addListener(event: string, id: string, handler: (...args: unknown[]) => void, autoRegister?: boolean): IEventEngine;
    dispatch(event: string, ...args: unknown[]): void;
    removeListener(event: string, id: string): IEventEngine;
}
export default DefaultEventEngine;
