import dotenv from 'dotenv';
export declare type TypeOverviewResponse = TypeDefinitionData[];
export declare type TypeDefinitionData = {
    Name: string;
    DisplayName: string;
    Description: string;
    GUID: string;
    Properties: {
        Name: string;
        DisplayName: string;
        Description: string;
        Type: string;
    }[];
};
/**
 * Episerver Model Synchronization Job
 */
export declare class EpiModelSync {
    protected _servicePath: string;
    protected _rootDir: string;
    protected _config: dotenv.DotenvParseOutput;
    protected _iContentProps: string[];
    /**
     * Create a new instance of the job
     *
     * @param {string} spaDir       The directory where the SPA is located
     * @param {string} envFile      The environment file to use as configuration source
     */
    constructor(spaDir: string, envFile: string);
    /**
     * Run the configuration job
     */
    run(): void;
    /**
     * Generate a TypeMapper component which enables loading of the types from Episerver
     *
     * @protected
     * @param {string[]} allItemNames The model names fetched from Episerver
     * @returns {void}
     */
    protected createAsyncTypeMapper(allItemNames: string[]): void;
    /**
     * Create a model file for the specified type
     *
     * @protected
     * @param {string}      typeName
     * @param {string[]}    allItemNames
     * @param {void}
     */
    protected createModelFile(typeName: string, allItemNames: string[]): void;
    /**
     * Convert the reported model type to a TypeScript type
     *
     * @protected
     * @param {string}      typeName        The name of the type
     * @param {string[]}    allItemNames    The list of types in Episerver (for property blocks)
     * @returns {string}
     */
    protected ConvertTypeToSpaProperty(typeName: string, allItemNames: string[]): string;
    /**
     * Remove all models from the models folder, except thos explicitly kept
     *
     * @protected
     * @param {string[]} keep The model names to keep in the output folder
     */
    protected clearModels(keep: string[]): void;
    /**
     * Build the service path within Episerver to fetch the model
     *
     * @protected
     * @param {string} modelName The name of the model
     * @returns {string}
     */
    protected getServiceUrl(modelName?: string): string;
    /**
     * Get (and create if needed) the path where the models must be stored
     *
     * @protected
     * @returns {string}
     */
    protected getModelPath(): string;
    /**
     * Generate the TypeScript interface name
     *
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @returns {string}
     */
    protected getModelInterfaceName(modelName: string): string;
    /**
     * Generate the TypeScript instance name
     *
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @returns {string}
     */
    protected getModelInstanceName(modelName: string): string;
    /**
     * Generate the TypeScript interface name
     *
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @return {string}
     */
    protected getComponentPropertiesInterfaceName(modelName: string): string;
    protected processFieldName(originalName: string): string;
    protected _doRequest<T = any>(url: string): Promise<T | null>;
}
export default EpiModelSync;
