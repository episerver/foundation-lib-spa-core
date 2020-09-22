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
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const ContentLink_1 = require("../Models/ContentLink");
const Spinner_1 = __importDefault(require("./Spinner"));
const ComponentNotFound_1 = __importDefault(require("./Errors/ComponentNotFound"));
const Spa_1 = __importDefault(require("../Spa"));
const StringUtils_1 = __importDefault(require("../Util/StringUtils"));
;
/**
 * The CMS Component provides the asynchronous loading of content and components needed to render an IContent
 * based (part of) the page.
 */
class EpiComponent extends react_1.Component {
    /**
     * Create a new CMS Component, which dynamically loads the application component
     * for rendering.
     *
     * @param props
     */
    constructor(props) {
        var _a;
        super(props);
        this._unmounted = false;
        this.componentLoader = this.props.context.componentLoader();
        let componentName = '';
        let component = null;
        if (this.isExpandedValueValid()) {
            componentName = this.buildComponentName(this.props.expandedValue);
            component = this.componentLoader.getPreLoadedType(componentName, false);
        }
        else {
            if (this.spaContext.isDebugActive())
                console.debug(`EpiComponent is awaiting full content`, this.props.contentLink);
            if (!this.props.context.isServerSideRendering() && ((_a = this.props.contentLink) === null || _a === void 0 ? void 0 : _a.id)) {
                this.props.context.loadContentById(ContentLink_1.ContentLinkService.createApiId(this.props.contentLink));
            }
        }
        const hasError = false;
        const componentIsUpdating = false;
        this.state = {
            hasError,
            componentName,
            component: component || undefined,
            componentIsUpdating
        };
    }
    /**
     * Dynamic property for accessing the Episerver SPA Context, first from the
     * component properties, secondly from the global context.
     *
     * @returns	{ IEpiserverSpaContext } The current context for the SPA
     */
    get spaContext() {
        return this.props.context || Spa_1.default;
    }
    loadComponent(iContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = iContent || this.props.expandedValue;
            if (!content) {
                Promise.reject("No content to be loaded specified");
            }
            const componentName = this.buildComponentName(content);
            return this.componentLoader.LoadType(componentName);
        });
    }
    /**
     * Build the actual properties array for the component
     *
     * @param 	content 	The content item to generate the props for
     */
    buildComponentProps(content) {
        return {
            data: content,
            contentLink: content.contentLink,
            className: this.props.className,
            height: this.props.height,
            width: this.props.width,
            propertyName: this.props.propertyName,
            contentType: this.props.contentType,
            key: `EpiComponent-Instance-${content.contentLink.guidValue}`,
            actionName: this.props.actionName,
            actionData: this.props.actionData,
            context: this.props.context,
            path: this.props.path
        };
    }
    /**
     * Create the name of the React Component to load for this EpiComponent
     *
     * @param item The IContent to be presented by this EpiComponent
     */
    buildComponentName(item) {
        const context = this.props.contentType || '';
        let baseName = item.contentType.map((s) => {
            return StringUtils_1.default.SafeModelName(s);
        }).join('/');
        if (context && context !== item.contentType.slice(0, 1)[0]) {
            baseName = context + '/' + baseName;
        }
        return baseName;
    }
    /**
     * Handle the attaching of this component to the virtual DOM to render it's contained
     * IContent
     */
    componentDidMount() {
        if (!this.isComponentValid() && this.state.componentName) {
            this.updateComponent(this.state.componentName);
        }
    }
    componentDidUpdate(prevProps, prevState) {
        var _a;
        if (this.state.componentIsUpdating || prevState.componentIsUpdating)
            return;
        const mustUpdate = ((_a = prevProps.contentLink) === null || _a === void 0 ? void 0 : _a.id) !== this.props.contentLink.id;
        if (mustUpdate || !this.isComponentValid()) {
            this.setState({ component: undefined, componentName: undefined, componentIsUpdating: true });
            const componentName = this.props.expandedValue ? this.buildComponentName(this.props.expandedValue) : '';
            this.updateComponent(componentName);
        }
    }
    updateComponent(componentName) {
        // If the component is in cache, use cached version and do not use promises
        if (this.componentLoader.isPreLoaded(componentName)) {
            this.setState({
                componentName,
                component: this.componentLoader.getPreLoadedType(componentName, true),
                componentIsUpdating: false
            });
            return;
        }
        // Load component through promises
        const me = this;
        this.componentLoader.LoadType(componentName).then(cType => {
            if (!me._unmounted)
                me.setState({
                    componentName,
                    component: cType,
                    componentIsUpdating: false
                });
        }).catch(reason => {
            const state = {
                componentName,
                component: ComponentNotFound_1.default,
                componentIsUpdating: false
            };
            if (!me._unmounted)
                me.setState(state);
        });
    }
    /**
     * Check if the current expanded value is both set and relates to the current
     * content reference.
     */
    isExpandedValueValid() {
        if (!this.props.expandedValue)
            return false;
        return this.props.expandedValue.contentLink.guidValue === this.props.contentLink.guidValue;
    }
    isComponentValid() {
        var _a, _b;
        if (this.isExpandedValueValid()) {
            const name = this.buildComponentName(this.props.expandedValue);
            return ((_a = this.state.component) === null || _a === void 0 ? void 0 : _a.displayName) === 'Epi/ComponentNotFound' ||
                ((_b = this.state.component) === null || _b === void 0 ? void 0 : _b.displayName) === name;
        }
        return false;
    }
    componentDidCatch(error, errorInfo) {
        // Ignore caught errors
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            errorObject: error,
            component: undefined,
            componentName: undefined,
            componentIsUpdating: false
        };
    }
    componentWillUnmount() {
        this._unmounted = true;
    }
    render() {
        const spinnerId = `ssr-${ContentLink_1.ContentLinkService.createApiId(this.props.contentLink)}`;
        if (this.state.hasError) {
            return react_1.default.createElement("div", { className: "alert alert-danger" }, "An uncaught error occured!");
        }
        if (this.isComponentValid()) {
            const props = this.buildComponentProps(this.props.expandedValue);
            return react_1.default.createElement(this.state.component, props);
        }
        if (this.props.contentLink == null) {
            return react_1.default.createElement("div", { className: "alert alert-danger" }, "No linked content");
        }
        return Spinner_1.default.CreateInstance({
            key: `EpiComponent-Spinner-${spinnerId}`
        });
    }
    /**
     * Create the instantiable type of the EpiComponent for the current
     * context. It'll return the base EpiComponent or a EpiComponent wrapped
     * in the connect method from React-Redux.
     *
     * @param { IEpiserverContext } context The application context
     * @returns { EpiComponentType }
     */
    static CreateComponent(context) {
        if (context.isServerSideRendering()) {
            return EpiComponent;
        }
        return react_redux_1.connect((state, ownProps) => {
            const id = ContentLink_1.ContentLinkService.createApiId(ownProps.contentLink);
            if (state.iContentRepo.items[id]) {
                return Object.assign(Object.assign({}, ownProps), { expandedValue: state.iContentRepo.items[id].content, path: state.ViewContext.currentPath });
            }
            return ownProps;
        })(EpiComponent);
    }
}
exports.default = EpiComponent;
