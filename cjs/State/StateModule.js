"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateModule = void 0;
const IInitializableModule_1 = require("../Core/IInitializableModule");
const Reducer_1 = require("./Reducer");
const Tools = require("./Tools");
class StateModule extends IInitializableModule_1.BaseInitializableModule {
    constructor() {
        super(...arguments);
        this.name = "Core State Engine";
        this.SortOrder = 40;
        /**
         * Return the standard state reducer for the CMS Status
         */
        this.GetStateReducer = () => Reducer_1.default;
    }
    StartModule(context) {
        var _a;
        const store = context.getStore();
        const state = store.getState();
        const cfg = context.serviceContainer.getService("Config" /* Config */);
        // Setup CD-API Language to respond to the state changes, ensuring
        // that it always takes the current CD-API instance from the container.
        Tools.observeStore(store, (x) => { var _a; return ((_a = x === null || x === void 0 ? void 0 : x.OptiContentCloud) === null || _a === void 0 ? void 0 : _a.currentLanguage) || cfg.defaultLanguage; }, (newValue) => {
            if (newValue) {
                const cdAPI = context.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
                cdAPI.Language = newValue;
            }
        });
        // Make sure the current language is applied
        const language = (_a = state === null || state === void 0 ? void 0 : state.OptiContentCloud) === null || _a === void 0 ? void 0 : _a.currentLanguage;
        if (!language) {
            store.dispatch({
                type: "OptiContentCloud/SetState",
                currentLanguage: cfg.defaultLanguage
            });
        }
        else {
            const cdAPI = context.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
            cdAPI.Language = language || cfg.defaultLanguage;
        }
    }
}
exports.StateModule = StateModule;
exports.default = StateModule;
//# sourceMappingURL=StateModule.js.map