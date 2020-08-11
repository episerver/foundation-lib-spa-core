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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var react_1 = __importStar(require("react"));
var react_redux_1 = require("react-redux");
var ContentLink_1 = require("../Models/ContentLink");
var Spinner_1 = __importDefault(require("./Spinner"));
var ComponentNotFound_1 = __importDefault(require("./Errors/ComponentNotFound"));
var Spa_1 = __importDefault(require("../Spa"));
var StringUtils_1 = __importDefault(require("../Util/StringUtils"));
;
/**
 * The CMS Component provides the asynchronous loading of content and components needed to render an IContent
 * based (part of) the page.
 */
var EpiComponent = /** @class */ (function (_super) {
    __extends(EpiComponent, _super);
    /**
     * Create a new CMS Component, which dynamically loads the application component
     * for rendering.
     *
     * @param props
     */
    function EpiComponent(props) {
        var _a;
        var _this = _super.call(this, props) || this;
        _this._unmounted = false;
        _this.componentLoader = _this.props.context.componentLoader();
        var componentName = '';
        var component = null;
        if (_this.isExpandedValueValid()) {
            componentName = _this.buildComponentName(_this.props.expandedValue);
            component = _this.componentLoader.getPreLoadedType(componentName, false);
        }
        else {
            if (_this.spaContext.isDebugActive())
                console.debug("EpiComponent is awaiting full content", _this.props.contentLink);
            if (!_this.props.context.isServerSideRendering() && ((_a = _this.props.contentLink) === null || _a === void 0 ? void 0 : _a.id)) {
                _this.props.context.loadContentById(ContentLink_1.ContentLinkService.createApiId(_this.props.contentLink));
            }
        }
        var hasError = false;
        var componentIsUpdating = false;
        _this.state = {
            hasError: hasError,
            componentName: componentName,
            component: component || undefined,
            componentIsUpdating: componentIsUpdating
        };
        return _this;
    }
    Object.defineProperty(EpiComponent.prototype, "spaContext", {
        /**
         * Dynamic property for accessing the Episerver SPA Context, first from the
         * component properties, secondly from the global context.
         *
         * @returns	{ IEpiserverSpaContext } The current context for the SPA
         */
        get: function () {
            return this.props.context || Spa_1.default;
        },
        enumerable: false,
        configurable: true
    });
    EpiComponent.prototype.loadComponent = function (iContent) {
        return __awaiter(this, void 0, void 0, function () {
            var content, componentName;
            return __generator(this, function (_a) {
                content = iContent || this.props.expandedValue;
                if (!content) {
                    Promise.reject("No content to be loaded specified");
                }
                componentName = this.buildComponentName(content);
                return [2 /*return*/, this.componentLoader.LoadType(componentName)];
            });
        });
    };
    /**
     * Build the actual properties array for the component
     *
     * @param 	content 	The content item to generate the props for
     */
    EpiComponent.prototype.buildComponentProps = function (content) {
        return {
            data: content,
            contentLink: content.contentLink,
            className: this.props.className,
            height: this.props.height,
            width: this.props.width,
            propertyName: this.props.propertyName,
            contentType: this.props.contentType,
            key: "EpiComponent-Instance-" + content.contentLink.guidValue,
            actionName: this.props.actionName,
            actionData: this.props.actionData,
            context: this.props.context,
            path: this.props.path
        };
    };
    /**
     * Create the name of the React Component to load for this EpiComponent
     *
     * @param item The IContent to be presented by this EpiComponent
     */
    EpiComponent.prototype.buildComponentName = function (item) {
        var context = this.props.contentType || '';
        var baseName = item.contentType.map(function (s) {
            return StringUtils_1.default.SafeModelName(s);
        }).join('/');
        if (context && context !== item.contentType.slice(0, 1)[0]) {
            baseName = context + '/' + baseName;
        }
        return baseName;
    };
    /**
     * Handle the attaching of this component to the virtual DOM to render it's contained
     * IContent
     */
    EpiComponent.prototype.componentDidMount = function () {
        if (!this.isComponentValid() && this.state.componentName) {
            this.updateComponent(this.state.componentName);
        }
    };
    EpiComponent.prototype.componentDidUpdate = function (prevProps, prevState) {
        var _a;
        if (this.state.componentIsUpdating || prevState.componentIsUpdating)
            return;
        var mustUpdate = ((_a = prevProps.contentLink) === null || _a === void 0 ? void 0 : _a.id) !== this.props.contentLink.id;
        if (mustUpdate || !this.isComponentValid()) {
            this.setState({ component: undefined, componentName: undefined, componentIsUpdating: true });
            var componentName = this.props.expandedValue ? this.buildComponentName(this.props.expandedValue) : '';
            this.updateComponent(componentName);
        }
    };
    EpiComponent.prototype.updateComponent = function (componentName) {
        // If the component is in cache, use cached version and do not use promises
        if (this.componentLoader.isPreLoaded(componentName)) {
            this.setState({
                componentName: componentName,
                component: this.componentLoader.getPreLoadedType(componentName, true),
                componentIsUpdating: false
            });
            return;
        }
        // Load component through promises
        var me = this;
        this.componentLoader.LoadType(componentName).then(function (cType) {
            if (!me._unmounted)
                me.setState({
                    componentName: componentName,
                    component: cType,
                    componentIsUpdating: false
                });
        }).catch(function (reason) {
            var state = {
                componentName: componentName,
                component: ComponentNotFound_1.default,
                componentIsUpdating: false
            };
            if (!me._unmounted)
                me.setState(state);
        });
    };
    /**
     * Check if the current expanded value is both set and relates to the current
     * content reference.
     */
    EpiComponent.prototype.isExpandedValueValid = function () {
        if (!this.props.expandedValue)
            return false;
        return this.props.expandedValue.contentLink.guidValue === this.props.contentLink.guidValue;
    };
    EpiComponent.prototype.isComponentValid = function () {
        var _a, _b;
        if (this.isExpandedValueValid()) {
            var name_1 = this.buildComponentName(this.props.expandedValue);
            return ((_a = this.state.component) === null || _a === void 0 ? void 0 : _a.displayName) === 'Epi/ComponentNotFound' ||
                ((_b = this.state.component) === null || _b === void 0 ? void 0 : _b.displayName) === name_1;
        }
        return false;
    };
    EpiComponent.prototype.componentDidCatch = function (error, errorInfo) {
        // Ignore caught errors
    };
    EpiComponent.getDerivedStateFromError = function (error) {
        return {
            hasError: true,
            errorObject: error,
            component: undefined,
            componentName: undefined,
            componentIsUpdating: false
        };
    };
    EpiComponent.prototype.componentWillUnmount = function () {
        this._unmounted = true;
    };
    EpiComponent.prototype.render = function () {
        var spinnerId = "ssr-" + ContentLink_1.ContentLinkService.createApiId(this.props.contentLink);
        if (this.state.hasError) {
            return react_1.default.createElement("div", { className: "alert alert-danger" }, "An uncaught error occured!");
        }
        if (this.isComponentValid()) {
            var props = this.buildComponentProps(this.props.expandedValue);
            return react_1.default.createElement(this.state.component, props);
        }
        if (this.props.contentLink == null) {
            return react_1.default.createElement("div", { className: "alert alert-danger" }, "No linked content");
        }
        return Spinner_1.default.CreateInstance({
            key: "EpiComponent-Spinner-" + spinnerId
        });
    };
    /**
     * Create the instantiable type of the EpiComponent for the current
     * context. It'll return the base EpiComponent or a EpiComponent wrapped
     * in the connect method from React-Redux.
     *
     * @param { IEpiserverContext } context The application context
     * @returns { EpiComponentType }
     */
    EpiComponent.CreateComponent = function (context) {
        if (context.isServerSideRendering()) {
            return EpiComponent;
        }
        return react_redux_1.connect(function (state, ownProps) {
            var id = ContentLink_1.ContentLinkService.createApiId(ownProps.contentLink);
            if (state.iContentRepo.items[id]) {
                return __assign(__assign({}, ownProps), { expandedValue: state.iContentRepo.items[id].content, path: state.ViewContext.currentPath });
            }
            return ownProps;
        })(EpiComponent);
    };
    return EpiComponent;
}(react_1.Component));
exports.default = EpiComponent;
