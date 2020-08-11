import IEventEngine, { IListener } from './IEventEngine';
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
    constructor();
    protected onPostMessageReceived(event: MessageEvent): void;
    registerEvent(event: string): IEventEngine;
    hasEvent(event: string): boolean;
    addListener(event: string, id: string, handler: (...args: any[]) => void, autoRegister?: boolean): IEventEngine;
    dispatch(event: string, ...args: any[]): void;
    removeListener(event: string, id: string): IEventEngine;
}
export {};
