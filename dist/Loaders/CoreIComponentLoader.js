"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CoreIComponentLoader {
    constructor() {
        this.debug = false;
    }
    get PREFIX() {
        return "app/Components/";
    }
    get order() {
        return 100;
    }
    canLoad(componentName) {
        return componentName.startsWith(this.PREFIX);
    }
    load(componentName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.debug)
                console.debug(`Loading component: ${componentName}`);
            const me = this;
            const component = componentName.substr(15);
            return Promise.resolve().then(() => __importStar(require(
            /* webpackInclude: /\.tsx$/ */
            /* webpackExclude: /\.noimport\.tsx$/ */
            /* webpackChunkName: "components" */
            /* webpackMode: "lazy" */
            /* webpackPrefetch: false */
            /* webpackPreload: false */
            "app/Components/" + component))).then(exports => {
                if (!(exports && exports.default))
                    throw new Error(`The component ${componentName} does not have a default export`);
                const c = exports.default;
                if (me.debug)
                    console.debug(`Finished loading component: ${componentName}`, c);
                return c;
            });
        });
    }
    setDebug(debug) {
        this.debug = debug;
    }
}
exports.default = CoreIComponentLoader;
