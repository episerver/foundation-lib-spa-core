import IEventEngine from './IEventEngine';
import EventEmitter from 'eventemitter3';
/**
 * The default event engine for the SPA
 */
export default class DefaultEventEngine implements IEventEngine {
    protected _eventEmitter: EventEmitter<string, any>;
    protected _listeners: {
        [key: string]: (...args: any[]) => void;
    };
    protected _events: string[];
    constructor();
    protected onPostMessageReceived(event: MessageEvent): void;
    registerEvent(event: string): IEventEngine;
    hasEvent(event: string): boolean;
    addListener(event: string, id: string, handler: (...args: any[]) => void, autoRegister?: boolean): IEventEngine;
    dispatch(event: string, ...args: any[]): void;
    removeListener(event: string, id: string): IEventEngine;
}
