/**
 * Configuration of the load method of an IRepository implementation
 */
export var IRepositoryPolicy;
(function (IRepositoryPolicy) {
    /**
     * [Default Policy] With the local storage first policy, the load method will first try the
     * database to load the data and then - if there's connectivity fall back to network. After
     * every hit the data will be refreshed in the background.
     */
    IRepositoryPolicy["LocalStorageFirst"] = "LocalStorageFirst";
    /**
     * With the Network first policy, the load method will always load the latest data from the
     * network and fall back to local storage if there's no connectivity.
     */
    IRepositoryPolicy["NetworkFirst"] = "NetworkFirst";
    /**
     * With the prefer offline policy data is only fetched once and thereafter only updated when
     * explicitly required by the system.
     */
    IRepositoryPolicy["PreferOffline"] = "PreferOffline";
})(IRepositoryPolicy || (IRepositoryPolicy = {}));
//# sourceMappingURL=IRepository.js.map