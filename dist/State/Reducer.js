export const StateKey = 'OptiContentCloud';
export const CmsStateReducerInfo = {
    stateKey: StateKey,
    reducer: (state, action) => {
        let newState = {};
        switch (action.type) {
            case '@@EPI/INIT':
                console.warn('REDUX EPI INIT!');
                console.warn('epi init state', state === null || state === void 0 ? void 0 : state.currentLanguage);
                newState = state !== null && state !== void 0 ? state : loadInitialState();
                break;
            case 'OptiContentCloud/SetState':
                const toMerge = {};
                cpyAttr('currentLanguage', action, toMerge);
                cpyAttr('iContent', action, toMerge);
                cpyAttr('initialState', action, toMerge);
                newState = Object.assign(Object.assign({}, state), toMerge);
                storeState(newState);
                break;
        }
        return newState;
    },
};
function cpyAttr(key, from, to) {
    if (from[key])
        to[key] = from[key];
}
function loadInitialState() {
    try {
        const data = localStorage.getItem(StateKey);
        return data ? JSON.parse(data) : {};
    }
    catch (e) {
        // Ignored on purpose
    }
    return {};
}
function storeState(state) {
    try {
        localStorage.setItem(StateKey, JSON.stringify(state));
    }
    catch (e) {
        // Ignored on purpose
    }
}
export default CmsStateReducerInfo;
//# sourceMappingURL=Reducer.js.map