export class BaseInitializableModule {
    constructor() {
        this.name = "Unnamed module";
        this.SortOrder = 100;
    }
    GetName() {
        return this.name;
    }
    ConfigureContainer(container) {
        //No action taken by default
    }
    StartModule(context) {
        if (context.isDebugActive()) {
            console.debug(`Starting ${this.GetName()}`);
        }
    }
    GetStateReducer() {
        return null;
    }
}
//# sourceMappingURL=IInitializableModule.js.map