import IStateReducerInfo, { InitializationAction } from '../Core/IStateReducerInfo';
import CmsState from './CmsState';
export declare const StateKey = "OptiContentCloud";
export declare type CmsSetStateAction = {
    type: 'OptiContentCloud/SetState';
} & CmsState;
export declare type CmsStateActionType = InitializationAction | CmsSetStateAction;
export declare type ContentAppState = {
    OptiContentCloud?: CmsState;
};
export declare type PartialAppState = ContentAppState & {
    [key: string]: any;
};
export declare const CmsStateReducerInfo: IStateReducerInfo<CmsState, CmsStateActionType>;
export default CmsStateReducerInfo;
