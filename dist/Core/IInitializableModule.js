"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseInitializableModule = void 0;
var BaseInitializableModule = /** @class */ (function () {
    function BaseInitializableModule() {
        this.name = "Unnamed module";
    }
    BaseInitializableModule.prototype.GetName = function () {
        return this.name;
    };
    BaseInitializableModule.prototype.ConfigureContainer = function (container) {
        //No action taken by default
    };
    BaseInitializableModule.prototype.StartModule = function (context) {
        if (context.isDebugActive()) {
            console.debug("Starting " + this.GetName());
        }
    };
    BaseInitializableModule.prototype.GetStateReducer = function () {
        return null;
    };
    return BaseInitializableModule;
}());
exports.BaseInitializableModule = BaseInitializableModule;
