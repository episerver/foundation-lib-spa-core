import IServiceContainer from './IServiceContainer';
import IEpiserverContext from './IEpiserverContext';
import IStateReducerInfo from './IStateReducerInfo';
export default interface IInitializableModule {
    /**
     * Retrieve the name of the module
     *
     * @returns {string}
     */
    GetName(): string;
    ConfigureContainer(container: IServiceContainer): void;
    StartModule(context: IEpiserverContext): void;
    GetStateReducer(): IStateReducerInfo<any> | null;
}
export declare abstract class BaseInitializableModule implements IInitializableModule {
    protected name: string;
    GetName(): string;
    ConfigureContainer(container: IServiceContainer): void;
    StartModule(context: IEpiserverContext): void;
    GetStateReducer(): IStateReducerInfo<any> | null;
}
