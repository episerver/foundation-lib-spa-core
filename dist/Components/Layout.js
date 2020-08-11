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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var EpiComponent_1 = __importDefault(require("./EpiComponent"));
var Spinner_1 = __importDefault(require("./Spinner"));
/**
 * Basic layout implementation, needed to enable implementations to provide their own layout.
 */
var Layout = /** @class */ (function (_super) {
    __extends(Layout, _super);
    function Layout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * The initial state of the Layout
         */
        _this.state = {
            isContextLoading: false
        };
        _this.componentDidMount = function () {
            if (!_this.hasStartPage()) {
                throw (new Error("No start page has been defined"));
            }
            var l = _this;
            if (l.layoutDidMount)
                l.layoutDidMount();
        };
        _this.componentDidUpdate = function (prevProps, prevState) {
            if (!_this.hasStartPage()) {
                throw (new Error("No start page has been defined"));
            }
            var l = _this;
            if (l.layoutDidUpdate)
                l.layoutDidUpdate(prevProps, prevState);
        };
        _this.render = function () {
            if ( /*this.isPageValid() &&*/_this.hasStartPage()) {
                return _this.renderLayout();
            }
            if (_this.state.isContextLoading) {
                return _this.renderSpinner();
            }
            return null;
        };
        return _this;
    }
    Layout.prototype.renderLayout = function () {
        var contentLink;
        var ConnectedEpiComponent = EpiComponent_1.default.CreateComponent(this.props.context);
        if (this.props.page) {
            contentLink = this.props.page;
            return react_1.default.createElement(ConnectedEpiComponent, { context: this.props.context, contentLink: contentLink, expandedValue: this.props.expandedValue, actionName: this.props.actionName, actionData: this.props.actionData });
        }
        else if (this.props.expandedValue) {
            contentLink = this.props.expandedValue.contentLink;
            return react_1.default.createElement(ConnectedEpiComponent, { context: this.props.context, contentLink: contentLink, expandedValue: this.props.expandedValue, actionName: this.props.actionName, actionData: this.props.actionData });
        }
        return this.renderEmpty();
    };
    Layout.prototype.renderSpinner = function () {
        return Spinner_1.default.CreateInstance(this.getSpinnerProps());
    };
    Layout.prototype.renderEmpty = function () {
        return null;
    };
    Layout.prototype.getContext = function () {
        return this.props.context;
    };
    Layout.prototype.isPageValid = function () {
        if (this.props.path === "/")
            return true; // Do not validate homepage
        if (this.props.path && this.props.page) {
            var pagePath = this.getContext().getEpiserverUrl(this.props.page, this.props.actionName);
            var path = this.getContext().getEpiserverUrl(this.props.path, this.props.actionName);
            return pagePath === path;
        }
        return false;
    };
    Layout.prototype.hasStartPage = function () {
        return this.props.startPage ? true : false;
    };
    Layout.prototype.getSpinnerProps = function () {
        return {
            key: "LayoutSpinner"
        };
    };
    return Layout;
}(react_1.Component));
exports.default = Layout;
