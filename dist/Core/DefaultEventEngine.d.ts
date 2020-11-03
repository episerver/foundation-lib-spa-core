import IEventEngine, { IListener } from './IEventEngine';
/**
 * The store of registered listeners
 */
declare type IListenerStore = {
    [event: string]: IListener[];
};
/**
 * The default event engine for the SPA
 */
export default class DefaultEventEngine implements IEventEngine {
    protected listeners: IListenerStore;
    protected events: string[];
    constructor();
    protected onPostMessageReceived(event: MessageEvent): void;
    registerEvent(event: string): IEventEngine;
    hasEvent(event: string): boolean;
    addListener(event: string, id: string, handler: (...args: any[]) => void, autoRegister?: boolean): IEventEngine;
    dispatch(event: string, ...args: any[]): void;
    removeListener(event: string, id: string): IEventEngine;
}
export {};
