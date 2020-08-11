import { Action } from 'redux';
/**
 *
 */
export declare enum RepositoryActions {
    INIT = "@@EPI/INIT"
}
/**
 *
 */
export interface RepositoryAction<ActionEnum, RepositoryType> extends Action<ActionEnum> {
    item?: RepositoryType;
    error?: string;
    args?: Array<any>;
}
export declare type DispatchMethod<T> = (action: RepositoryAction<any, any> | DispatchableMethod<T>) => RepositoryAction<any, any> | T;
export declare type DispatchableMethod<T> = (dispatch: DispatchMethod<T>, getState: () => any) => T;
