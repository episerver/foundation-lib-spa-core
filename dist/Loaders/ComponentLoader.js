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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var ComponentNotFound_1 = __importDefault(require("../Components/Errors/ComponentNotFound"));
var Spa_1 = __importDefault(require("../Spa"));
/**
 * Helper class that ensures components can be pre-loaded for server side
 * rendering whilest loading them asynchronously in browser to minimize the
 * initially included JavaScript.
 *
 * For this script to work, the application must have the app/Components/ path
 * specified and all loadable components must reside within this path.
 */
var ComponentLoader = /** @class */ (function () {
    /**
     * Create a new instance and populate the cache with the data prepared
     * by the server side rendering.
     */
    function ComponentLoader() {
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
    ComponentLoader.prototype.isPreLoaded = function (component) {
        try {
            return this.cache["app/Components/" + component] ? true : false;
        }
        catch (e) {
            //Ignore exception
        }
        return false; //An exception occured, so not pre-loaded
    };
    /**
     * Load a component type synchronously from the cache
     *
     * @param   component       The name/path of the component
     * @param   throwOnUnknown  Wether or not an error must be thrown if the component is not in the cache
     */
    ComponentLoader.prototype.getPreLoadedType = function (component, throwOnUnknown) {
        if (throwOnUnknown === void 0) { throwOnUnknown = true; }
        if (this.isPreLoaded(component)) {
            var c = this.cache["app/Components/" + component];
            if (!c.displayName)
                c.displayName = component;
            return c;
        }
        if (throwOnUnknown) {
            throw "The component " + component + " has not been pre-loaded!";
        }
        return null;
    };
    ComponentLoader.prototype.getPreLoadedComponent = function (component, props) {
        if (this.isPreLoaded(component)) {
            var type = this.getPreLoadedType(component);
            return react_1.default.createElement(type, props);
        }
        throw "The component " + component + " has not been pre-loaded!";
    };
    ComponentLoader.prototype.LoadType = function (component) {
        var _this = this;
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
        this.loading[component] = this.doLoadComponent(component).then(function (c) {
            delete _this.loading[component];
            return c;
        });
        return this.loading[component];
    };
    ComponentLoader.prototype.doLoadComponent = function (component) {
        return __awaiter(this, void 0, void 0, function () {
            var type;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (Spa_1.default.isDebugActive())
                            console.debug('Loading component: ' + component);
                        return [4 /*yield*/, (Promise.resolve().then(function () { return __importStar(require(
                            /* webpackInclude: /\.tsx$/ */
                            /* webpackExclude: /\.noimport\.tsx$/ */
                            /* webpackChunkName: "components" */
                            /* webpackMode: "lazy" */
                            /* webpackPrefetch: false */
                            /* webpackPreload: false */
                            "app/Components/" + component)); }).then(function (exports) {
                                var c = exports.default;
                                c.displayName = component;
                                return c;
                            }).catch(function (reason) {
                                if (Spa_1.default.isDebugActive()) {
                                    console.error("Error while importing " + component + " due to:", reason);
                                }
                                return ComponentNotFound_1.default;
                            }))];
                    case 1:
                        type = _a.sent();
                        this.cache["app/Components/" + component] = type || ComponentNotFound_1.default;
                        if (Spa_1.default.isDebugActive())
                            console.debug('Loaded component: ' + component);
                        return [2 /*return*/, type];
                }
            });
        });
    };
    ComponentLoader.prototype.LoadComponent = function (component, props) {
        return __awaiter(this, void 0, void 0, function () {
            var type;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.LoadType(component)];
                    case 1:
                        type = _a.sent();
                        return [2 /*return*/, react_1.default.createElement(type, props)];
                }
            });
        });
    };
    return ComponentLoader;
}());
exports.default = ComponentLoader;
;
