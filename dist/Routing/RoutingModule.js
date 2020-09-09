"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Core interfaces
var IInitializableModule_1 = require("../Core/IInitializableModule");
var IServiceContainer_1 = require("../Core/IServiceContainer");
var RoutedComponent_1 = __importDefault(require("../Components/RoutedComponent"));
var RoutingModule = /** @class */ (function (_super) {
    __extends(RoutingModule, _super);
    function RoutingModule() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Episerver CMS Routing";
        return _this;
    }
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    RoutingModule.prototype.ConfigureContainer = function (container) {
        var config = container.getService(IServiceContainer_1.DefaultServices.Config);
        var haveStar = false;
        config.routes = config.routes || [];
        config.routes.forEach(function (c) { return haveStar = haveStar || c.path === "*"; });
        if (!haveStar)
            config.routes.push({
                path: "*",
                component: RoutedComponent_1.default
            });
    };
    return RoutingModule;
}(IInitializableModule_1.BaseInitializableModule));
exports.default = RoutingModule;
