"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseInitializableModule = void 0;
class BaseInitializableModule {
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
exports.BaseInitializableModule = BaseInitializableModule;
//# sourceMappingURL=IInitializableModule.js.map