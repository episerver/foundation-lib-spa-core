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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const EpiComponent_1 = __importDefault(require("./EpiComponent"));
const Spinner_1 = __importDefault(require("./Spinner"));
/**
 * Basic layout implementation, needed to enable implementations to provide their own layout.
 */
class Layout extends react_1.Component {
    constructor() {
        super(...arguments);
        /**
         * The initial state of the Layout
         */
        this.state = {
            isContextLoading: false
        };
        this.componentDidMount = () => {
            if (!this.hasStartPage()) {
                throw (new Error("No start page has been defined"));
            }
            const l = this;
            if (l.layoutDidMount)
                l.layoutDidMount();
        };
        this.componentDidUpdate = (prevProps, prevState) => {
            if (!this.hasStartPage()) {
                throw (new Error("No start page has been defined"));
            }
            const l = this;
            if (l.layoutDidUpdate)
                l.layoutDidUpdate(prevProps, prevState);
        };
        this.render = () => {
            if ( /*this.isPageValid() &&*/this.hasStartPage()) {
                return this.renderLayout();
            }
            if (this.state.isContextLoading) {
                return this.renderSpinner();
            }
            return null;
        };
    }
    renderLayout() {
        let contentLink;
        const ConnectedEpiComponent = EpiComponent_1.default.CreateComponent(this.props.context);
        if (this.props.page) {
            contentLink = this.props.page;
            return react_1.default.createElement(ConnectedEpiComponent, { context: this.props.context, contentLink: contentLink, expandedValue: this.props.expandedValue, actionName: this.props.actionName, actionData: this.props.actionData });
        }
        else if (this.props.expandedValue) {
            contentLink = this.props.expandedValue.contentLink;
            return react_1.default.createElement(ConnectedEpiComponent, { context: this.props.context, contentLink: contentLink, expandedValue: this.props.expandedValue, actionName: this.props.actionName, actionData: this.props.actionData });
        }
        return this.renderEmpty();
    }
    renderSpinner() {
        return Spinner_1.default.CreateInstance(this.getSpinnerProps());
    }
    renderEmpty() {
        return null;
    }
    getContext() {
        return this.props.context;
    }
    isPageValid() {
        if (this.props.path === "/")
            return true; // Do not validate homepage
        if (this.props.path && this.props.page) {
            const pagePath = this.getContext().getEpiserverUrl(this.props.page, this.props.actionName);
            const path = this.getContext().getEpiserverUrl(this.props.path, this.props.actionName);
            return pagePath === path;
        }
        return false;
    }
    hasStartPage() {
        return this.props.startPage ? true : false;
    }
    getSpinnerProps() {
        return {
            key: "LayoutSpinner"
        };
    }
}
exports.default = Layout;
