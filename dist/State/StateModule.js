import { BaseInitializableModule } from '../Core/IInitializableModule';
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
        const store = context.getStore();
        const state = store.getState();
        const cfg = context.serviceContainer.getService("Config" /* Config */);
        const cdAPI = context.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
        // Setup CD-API Language to respond to the state changes.
        Tools.observeStore(store, (x) => x?.OptiContentCloud?.currentLanguage || cfg.defaultLanguage, (newValue) => {
            if (newValue)
                cdAPI.Language = newValue;
        });
        // Make sure the current language is applied
        const language = state?.OptiContentCloud?.currentLanguage;
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