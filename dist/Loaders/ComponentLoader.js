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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ComponentNotFound_1 = __importDefault(require("../Components/Errors/ComponentNotFound"));
const Spa_1 = __importDefault(require("../Spa"));
/**
 * Helper class that ensures components can be pre-loaded for server side
 * rendering whilest loading them asynchronously in browser to minimize the
 * initially included JavaScript.
 *
 * For this script to work, the application must have the app/Components/ path
 * specified and all loadable components must reside within this path.
 */
class ComponentLoader {
    /**
     * Create a new instance and populate the cache with the data prepared
     * by the server side rendering.
     */
    constructor() {
        /**
         * The cache of components already pre-loaded by this loader
         */
        this.cache = {};
        /**
         * The list of promises currenlty being awaited by this loader, prior
         * to adding them to the cache.
         */
        this.loading = {};
        try {
            this.cache = PreLoad;
        }
        catch (e) {
            //Ignore
        }
    }
    /**
     * Verify if a component is in the cache
     *
     * @param   component   The name/path of the component
     */
    isPreLoaded(component) {
        try {
            return this.cache["app/Components/" + component] ? true : false;
        }
        catch (e) {
            //Ignore exception
        }
        return false; //An exception occured, so not pre-loaded
    }
    /**
     * Load a component type synchronously from the cache
     *
     * @param   component       The name/path of the component
     * @param   throwOnUnknown  Wether or not an error must be thrown if the component is not in the cache
     */
    getPreLoadedType(component, throwOnUnknown = true) {
        if (this.isPreLoaded(component)) {
            let c = this.cache["app/Components/" + component];
            if (!c.displayName)
                c.displayName = component;
            return c;
        }
        if (throwOnUnknown) {
            throw `The component ${component} has not been pre-loaded!`;
        }
        return null;
    }
    getPreLoadedComponent(component, props) {
        if (this.isPreLoaded(component)) {
            let type = this.getPreLoadedType(component);
            return react_1.default.createElement(type, props);
        }
        throw `The component ${component} has not been pre-loaded!`;
    }
    LoadType(component) {
        if (this.isPreLoaded(component)) {
            return Promise.resolve(this.getPreLoadedType(component));
        }
        try {
            if (this.loading[component]) {
                return this.loading[component];
            }
        }
        catch (e) {
            //Ignored on purpose
        }
        this.loading[component] = this.doLoadComponent(component).then(c => {
            delete this.loading[component];
            return c;
        });
        return this.loading[component];
    }
    doLoadComponent(component) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Spa_1.default.isDebugActive())
                console.debug('Loading component: ' + component);
            const type = yield (Promise.resolve().then(() => __importStar(require(
            /* webpackInclude: /\.tsx$/ */
            /* webpackExclude: /\.noimport\.tsx$/ */
            /* webpackChunkName: "components" */
            /* webpackMode: "lazy" */
            /* webpackPrefetch: false */
            /* webpackPreload: false */
            "app/Components/" + component))).then(exports => {
                let c = exports.default;
                c.displayName = component;
                return c;
            }).catch(reason => {
                if (Spa_1.default.isDebugActive()) {
                    console.error(`Error while importing ${component} due to:`, reason);
                }
                return ComponentNotFound_1.default;
            }));
            this.cache["app/Components/" + component] = type || ComponentNotFound_1.default;
            if (Spa_1.default.isDebugActive())
                console.debug('Loaded component: ' + component);
            return type;
        });
    }
    LoadComponent(component, props) {
        return __awaiter(this, void 0, void 0, function* () {
            let type = yield this.LoadType(component);
            return react_1.default.createElement(type, props);
        });
    }
}
exports.default = ComponentLoader;
;
