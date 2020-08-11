"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Spa_1 = __importDefault(require("../Spa"));
var AppGlobal_1 = __importDefault(require("../AppGlobal"));
// Build context
var ctx = AppGlobal_1.default();
/**
 * The list of action keys available for the view context
 */
var ViewContextActions;
(function (ViewContextActions) {
    ViewContextActions["INIT"] = "@@EPI/INIT";
    ViewContextActions["UPDATE_PATH"] = "UPDATE_PATH";
})(ViewContextActions || (ViewContextActions = {}));
var ViewContext = /** @class */ (function () {
    function ViewContext() {
    }
    /**
     * Get the state of this reducer from the global state
     *
     * @param state
     */
    ViewContext.getMyState = function (state) {
        return state && state[this.StateKey] ? state[this.StateKey] : {};
    };
    /**
     * Return the redux action to retrieve the current path
     */
    ViewContext.getCurrentPath = function () {
        var _this = this;
        return function (dispatch, getState) {
            var myState = _this.getMyState(getState());
            return myState && myState.currentPath ? myState.currentPath : '';
        };
    };
    /**
     * Update the current path
     *
     * @param path
     */
    ViewContext.updateCurrentPath = function (path) {
        return {
            type: ViewContextActions.UPDATE_PATH,
            path: path,
        };
    };
    ViewContext.reducer = function (state, action) {
        switch (action.type) {
            case ViewContextActions.INIT:
                return this.buildInitialState();
            case ViewContextActions.UPDATE_PATH:
                var newState = Object.assign({}, state, { currentPath: action.path });
                // window.history.pushState(newState, '', SpaContext.config().basePath + action.path);
                return newState;
            default:
                // No action
                break;
        }
        return Object.assign({}, state); // No action, return unmodified
    };
    ViewContext.buildInitialState = function () {
        if (Spa_1.default.isDebugActive())
            console.debug('Initializing ViewContext state');
        return {
            currentPath: ctx.location && ctx.location.pathname ? ctx.location.pathname : '',
        };
    };
    ViewContext.StateKey = 'ViewContext';
    return ViewContext;
}());
exports.default = ViewContext;
