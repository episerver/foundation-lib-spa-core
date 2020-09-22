"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseInitializableModule = exports.DefaultServices = exports.DefaultContext = exports.DefaultServiceContainer = exports.DefaultEventEngine = void 0;
const Spa_1 = __importDefault(require("../Spa"));
const IServiceContainer_1 = require("../Core/IServiceContainer");
const DefaultServiceContainer_1 = __importDefault(require("../Core/DefaultServiceContainer"));
const DefaultEventEngine_1 = __importDefault(require("../Core/DefaultEventEngine"));
const IInitializableModule_1 = require("../Core/IInitializableModule");
// Re-export Core namespace
exports.DefaultEventEngine = DefaultEventEngine_1.default;
exports.DefaultServiceContainer = DefaultServiceContainer_1.default;
exports.DefaultContext = Spa_1.default;
exports.DefaultServices = IServiceContainer_1.DefaultServices;
exports.BaseInitializableModule = IInitializableModule_1.BaseInitializableModule;
