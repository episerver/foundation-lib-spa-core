import { BaseInitializableModule } from '../Core/IInitializableModule';
import { DefaultServices } from '../Core/IServiceContainer';
import CmsStateReducer from './Reducer';
import * as Tools from './Tools';
export class StateModule extends BaseInitializableModule {
    constructor() {
        super(...arguments);
        this.name = "Core State Engine";
        this.SortOrder = 40;
        /**
         * Return the standard state reducer for the CMS Status
         */
        this.GetStateReducer = () => CmsStateReducer;
    }
    StartModule(context) {
        var _a;
        const store = context.getStore();
        const state = store.getState();
        const cfg = context.serviceContainer.getService(DefaultServices.Config);
        const cdAPI = context.serviceContainer.getService(DefaultServices.ContentDeliveryAPI_V2);
        // Setup CD-API Language to respond to the state changes.
        Tools.observeStore(store, (x) => { var _a; return ((_a = x === null || x === void 0 ? void 0 : x.OptiContentCloud) === null || _a === void 0 ? void 0 : _a.currentLanguage) || cfg.defaultLanguage; }, (newValue) => {
            if (newValue)
                cdAPI.Language = newValue;
        });
        // Make sure the current language is applied
        const language = (_a = state === null || state === void 0 ? void 0 : state.OptiContentCloud) === null || _a === void 0 ? void 0 : _a.currentLanguage;
        if (!language)
            store.dispatch({
                type: "OptiContentCloud/SetState",
                currentLanguage: cfg.defaultLanguage
            });
        else
            cdAPI.Language = language || cfg.defaultLanguage;
    }
}
export default StateModule;
//# sourceMappingURL=StateModule.js.map