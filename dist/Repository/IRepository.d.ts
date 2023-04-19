/**
 * Configuration of the load method of an IRepository implementation
 */
export declare enum IRepositoryPolicy {
    /**
     * [Default Policy] With the local storage first policy, the load method will first try the
     * database to load the data and then - if there's connectivity fall back to network. After
     * every hit the data will be refreshed in the background.
     */
    LocalStorageFirst = "LocalStorageFirst",
    /**
     * With the Network first policy, the load method will always load the latest data from the
     * network and fall back to local storage if there's no connectivity.
     */
    NetworkFirst = "NetworkFirst",
    /**
     * With the prefer offline policy data is only fetched once and thereafter only updated when
     * explicitly required by the system.
     */
    PreferOffline = "PreferOffline"
}
export type IRepositoryItem<T> = {
    data: T;
    added?: number;
    accessed?: number;
};
export type IRepositoryConfig = {
    /**
     * The load method policy
     *
     * @var { IRepositoryPolicy }
     */
    policy: IRepositoryPolicy;
    /**
     * The maximum number of minutes an item is stored before being considered invalid,
     * defaults to 1440 minutes (24 hours).
     *
     * @var { number }
     */
    maxAge: number;
    /**
     * If set to true, the repository will log what it's doing to the console
     *
     * @var { boolean }
     */
    debug: boolean;
};
export interface IReadOnlyRepository<KeyType, DataType> {
    /**
     * Get an item from the repository, without loading from an external
     * source.
     */
    get: (itemId: KeyType) => Promise<DataType | null>;
    /**
     * Check if an item exists in the repository
     */
    has: (itemId: KeyType) => Promise<boolean>;
    /**
     * Get an item from the repository, loading from the external source
     * when needed. This should take the configuration into account
     */
    load: (itemId: KeyType) => Promise<DataType | null>;
    /**
     * Refresh an item from the external source
     */
    update: (reference: KeyType) => Promise<DataType | null>;
}
export interface IPatchableRepository<KeyType, DataType> extends IReadOnlyRepository<KeyType, DataType> {
    /**
     * Apply a patch to an item in the repository. The patch is a method taking the item as argument
     * and returning the modified after it has been committed into the repository. The implementation
     * may trigger a refresh of the data after the patch has been applied to ensure all server side
     * logic will be applied as well.
     */
    patch: (itemId: KeyType, patch: (item: Readonly<DataType>) => DataType) => Promise<DataType | null>;
}
export default IReadOnlyRepository;
