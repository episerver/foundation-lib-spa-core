"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsStateReducerInfo = exports.StateKey = void 0;
exports.StateKey = "OptiContentCloud";
exports.CmsStateReducerInfo = {
    stateKey: exports.StateKey,
    reducer: (state, action) => {
        let newState = {};
        switch (action.type) {
            case "@@EPI/INIT":
                newState = loadInitialState();
                break;
            case "OptiContentCloud/SetState":
                const toMerge = {};
                cpyAttr("currentLanguage", action, toMerge);
                newState = Object.assign(Object.assign({}, state), toMerge);
                storeState(newState);
                break;
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
        const data = localStorage.getItem(exports.StateKey);
        return data ? JSON.parse(data) : {};
    }
    catch (e) {
        // Ignored on purpose
    }
    return {};
}
function storeState(state) {
    try {
        localStorage.setItem(exports.StateKey, JSON.stringify(state));
    }
    catch (e) {
        // Ignored on purpose
    }
}
exports.default = exports.CmsStateReducerInfo;
//# sourceMappingURL=Reducer.js.map