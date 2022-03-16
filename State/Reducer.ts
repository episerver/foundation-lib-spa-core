import IStateReducerInfo, { InitializationAction } from '../Core/IStateReducerInfo';
import CmsState from './CmsState';

export const StateKey = 'OptiContentCloud';

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

export const CmsStateReducerInfo: IStateReducerInfo<CmsState, CmsStateActionType> = {
  stateKey: StateKey,

  reducer: (state: CmsState | undefined, action: CmsStateActionType) => {
    let newState: CmsState = {};

    switch (action.type) {
      case '@@EPI/INIT':
        newState = loadInitialState();
        break;
      case 'OptiContentCloud/SetState':
        const toMerge: Partial<CmsState> = {};
        cpyAttr<CmsState>('currentLanguage', action, toMerge);
        cpyAttr<CmsState>('iContent', action, toMerge);
        cpyAttr<CmsState>('initialState', action, toMerge);
        newState = { ...state, ...toMerge };
        storeState(newState);
        break;
    }

    return newState;
  },
};

function cpyAttr<T>(key: keyof T, from: Partial<T>, to: Partial<T>) {
  if (from[key]) to[key] = from[key];
}

function loadInitialState(): CmsState {
  try {
    const data = localStorage.getItem(StateKey);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    // Ignored on purpose
  }
  return {};
}

function storeState(state: Readonly<CmsState>) {
  try {
    localStorage.setItem(StateKey, JSON.stringify(state));
  } catch (e) {
    // Ignored on purpose
  }
}

export default CmsStateReducerInfo;
