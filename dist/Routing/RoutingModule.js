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
        _this.name = "Episerver Routing";
        return _this;
    }
    RoutingModule.prototype.ConfigureContainer = function (container) {
        var _a;
        var config = container.getService(IServiceContainer_1.DefaultServices.Config);
        var haveStar = false;
        (config.routes || []).forEach(function (c) { return haveStar = haveStar || c.path === "*"; });
        if (!haveStar)
            (_a = config.routes) === null || _a === void 0 ? void 0 : _a.push({
                path: "*",
                component: RoutedComponent_1.default
            });
        container.setService(IServiceContainer_1.DefaultServices.Config, config);
    };
    return RoutingModule;
}(IInitializableModule_1.BaseInitializableModule));
exports.default = RoutingModule;
