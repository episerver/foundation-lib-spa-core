import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IStateReducerInfo from '../Core/IStateReducerInfo';
import IEpiserverContext from '../Core/IEpiserverContext';
export declare class StateModule extends BaseInitializableModule implements IInitializableModule {
    protected name: string;
    SortOrder: number;
    StartModule(context: IEpiserverContext): void;
    /**
     * Return the standard state reducer for the CMS Status
     */
    GetStateReducer: () => IStateReducerInfo<any>;
}
export default StateModule;
