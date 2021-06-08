"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLanguage = exports.observeStore = void 0;
function observeStore(store, select, onChange) {
    let currentState;
    function handleChange() {
        const nextState = select(store.getState());
        if (nextState !== currentState) {
            currentState = nextState;
            onChange(currentState);
        }
    }
    const unsubscribe = store.subscribe(handleChange);
    handleChange();
    return unsubscribe;
}
exports.observeStore = observeStore;
function setLanguage(newLanguage, store) {
    const action = {
        type: 'OptiContentCloud/SetState',
        currentLanguage: newLanguage
    };
    store.dispatch(action);
}
exports.setLanguage = setLanguage;
//# sourceMappingURL=Tools.js.map