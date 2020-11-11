export interface IEvent {
    data?: object;
    args?: any[];
}
/**
 * Main descriptor of the EventEngine, as provided by the Episerver SPA
 * framework
 */
export default interface IEventEngine {
    /**
     * Register an event so it can be dispatched and caught by the engine
     *
     * @param event The event code to register
     */
    registerEvent(event: string): IEventEngine;
    /**
     * The listener to attach
     *
     * @param event
     * @param id
     * @param handler
     */
    addListener(event: string, id: string, handler: (...args: any[]) => void, autoRegister?: boolean): IEventEngine;
    /**
     * Dispatch an event
     *
     * @param event
     * @param args
     */
    dispatch(event: string, ...args: any[]): void;
    removeListener(event: string, id: string): IEventEngine;
}
