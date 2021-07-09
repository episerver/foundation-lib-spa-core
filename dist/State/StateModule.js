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
        // Setup CD-API Language to respond to the state changes, ensuring
        // that it always takes the current CD-API instance from the container.
        Tools.observeStore(store, (x) => x?.OptiContentCloud?.currentLanguage || cfg.defaultLanguage, (newValue) => {
            if (newValue) {
                const cdAPI = context.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
                cdAPI.Language = newValue;
            }
        });
        // Make sure the current language is applied
        const language = state?.OptiContentCloud?.currentLanguage;
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
export default StateModule;
//# sourceMappingURL=StateModule.js.map