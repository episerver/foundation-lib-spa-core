import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IConfig from '../AppConfig';
import IStateReducerInfo from '../Core/IStateReducerInfo';
import IEpiserverContext from '../Core/IEpiserverContext';
import { DefaultServices } from '../Core/IServiceContainer';
import CmsStateReducer, { PartialAppState, ContentAppState as CmsAppState } from './Reducer';
import * as Tools  from './Tools';
import IContentDeliveryAPI from '../ContentDelivery/IContentDeliveryAPI';

export class StateModule extends BaseInitializableModule implements IInitializableModule
{
    protected name = "Core State Engine";

    public SortOrder = 40;

    public StartModule(context: IEpiserverContext): void
    {
        const store = context.getStore();
        const state = store.getState() as PartialAppState;
        const cfg = context.serviceContainer.getService<Readonly<IConfig>>(DefaultServices.Config);

        // Setup CD-API Language to respond to the state changes, ensuring
        // that it always takes the current CD-API instance from the container.
        Tools.observeStore<string, CmsAppState>(
            store, 
            (x) => x?.OptiContentCloud?.currentLanguage || cfg.defaultLanguage,
            (newValue) => {
                if (newValue) {
                    const cdAPI = context.serviceContainer.getService<IContentDeliveryAPI>(DefaultServices.ContentDeliveryAPI_V2);
                    cdAPI.Language = newValue;
                }
            }
        );

        // Make sure the current language is applied
        const language = state?.OptiContentCloud?.currentLanguage;
        if (!language) {
            store.dispatch({
                type: "OptiContentCloud/SetState",
                currentLanguage: cfg.defaultLanguage
            })
        } else {
            const cdAPI = context.serviceContainer.getService<IContentDeliveryAPI>(DefaultServices.ContentDeliveryAPI_V2);
            cdAPI.Language = language || cfg.defaultLanguage;
        }

    }

    /**
     * Return the standard state reducer for the CMS Status
     */
    public GetStateReducer : () => IStateReducerInfo<any> = () => CmsStateReducer;
}

export default StateModule;