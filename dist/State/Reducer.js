export const StateKey = "OptiContentCloud";
export const CmsStateReducerInfo = {
    stateKey: StateKey,
    reducer: (state, action) => {
        let newState = {};
        switch (action.type) {
            case "@@EPI/INIT":
                newState = loadInitialState();
                break;
            case "OptiContentCloud/SetState":
                {
                    const toMerge = {};
                    cpyAttr("currentLanguage", action, toMerge);
                    newState = { ...state, ...toMerge };
                    storeState(newState);
                    break;
                }
        }
        return newState;
    }
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