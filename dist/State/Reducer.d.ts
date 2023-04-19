import IStateReducerInfo, { InitializationAction } from '../Core/IStateReducerInfo';
import CmsState from './CmsState';
export declare const StateKey = "OptiContentCloud";
export type CmsSetStateAction = {
    type: 'OptiContentCloud/SetState';
} & CmsState;
export type CmsStateActionType = InitializationAction | CmsSetStateAction;
export type ContentAppState = {
    OptiContentCloud?: CmsState;
};
export type PartialAppState = ContentAppState & {
    [key: string]: any;
};
export declare const CmsStateReducerInfo: IStateReducerInfo<CmsState, CmsStateActionType>;
export default CmsStateReducerInfo;
