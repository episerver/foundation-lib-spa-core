import { Reducer, Action, AnyAction } from '@reduxjs/toolkit';

export const EpiInitAction = '@@EPI/INIT';

export interface InitializationAction extends Action<string> {
    type: '@@EPI/INIT';
}

export interface IStateReducerInfo<S, A extends Action = AnyAction> {
    stateKey : string;
    reducer: Reducer<S, A>
}
export default IStateReducerInfo;