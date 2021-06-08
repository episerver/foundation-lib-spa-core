import IServiceContainer from './IServiceContainer';
import IEpiserverContext from './IEpiserverContext';
import IStateReducerInfo from './IStateReducerInfo';

export interface IInitializableModule
{
    /**
     * The sort order of the modules when loaded using the initial bootstrapping
     * sequence.
     */
    readonly SortOrder: number;

    /**
     * Retrieve the name of the module
     * 
     * @returns { string }
     */
    GetName(): string;

    ConfigureContainer(container: IServiceContainer) : void;

    StartModule(context: IEpiserverContext): void;

    GetStateReducer(): IStateReducerInfo<any> | null;
}
export default IInitializableModule;
export abstract class BaseInitializableModule implements IInitializableModule
{
    protected name = "Unnamed module";

    public readonly SortOrder: number = 100;

    public GetName() : string
    {
        return this.name;
    }

    public ConfigureContainer(container: IServiceContainer) : void
    {
        //No action taken by default
    }

    public StartModule(context: IEpiserverContext): void
    {
        if (context.isDebugActive()) {
            console.debug(`Starting ${ this.GetName() }`);
        }
    }

    public GetStateReducer() : IStateReducerInfo<any> | null
    {
        return null;
    }
}