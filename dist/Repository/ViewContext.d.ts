import { Action, AnyAction } from 'redux';
export declare type PartialStateWithViewContext = {
    ViewContext: ViewContextState;
};
/**
 * The list of action keys available for the view context
 */
declare enum ViewContextActions {
    INIT = "@@EPI/INIT",
    UPDATE_PATH = "UPDATE_PATH"
}
interface ViewContextState {
    currentPath?: string;
}
/**
 * Action data type for this reducer
 */
export interface ViewContextAction extends Action<ViewContextActions> {
    path?: string;
}
export default class ViewContext {
    static StateKey: string;
    /**
     * Get the state of this reducer from the global state
     *
     * @param state
     */
    protected static getMyState(state: any): ViewContextState;
    /**
     * Return the redux action to retrieve the current path
     */
    static getCurrentPath(): (dispatch: (action: AnyAction) => AnyAction, getState: () => any) => string;
    /**
     * Update the current path
     *
     * @param path
     */
    static updateCurrentPath(path: string): ViewContextAction;
    static reducer(state: ViewContextState, action: ViewContextAction): ViewContextState;
    protected static buildInitialState(): ViewContextState;
}
export {};
