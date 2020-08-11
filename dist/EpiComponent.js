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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEpiComponent = void 0;
var react_1 = require("react");
/**
 * Base abstract class to be used by components representing an Episerver IContent component (e.g. Block, Page, Media,
 * Catalog, Product, etc...)
 */
var BaseEpiComponent = /** @class */ (function (_super) {
    __extends(BaseEpiComponent, _super);
    function BaseEpiComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.currentComponentId = _this.props.data.contentLink.id;
        _this.currentComponentGuid = _this.props.data.contentLink.guidValue;
        if (_this.componentInitialize)
            _this.componentInitialize();
        if (_this.getInitialState)
            _this.state = _this.getInitialState();
        return _this;
    }
    /**
     * Return if debug mode is active
     */
    BaseEpiComponent.prototype.isDebugActive = function () {
        return this.getContext().isDebugActive() === true;
    };
    /**
     * Returns true for OPE only
     */
    BaseEpiComponent.prototype.isEditable = function () {
        return this.getContext().isEditable();
    };
    /**
     * Returns true for OPE & Preview
     */
    BaseEpiComponent.prototype.isInEditMode = function () {
        return this.getContext().isInEditMode();
    };
    /**
     * Retrieve the ContentLink for this component
     */
    BaseEpiComponent.prototype.getCurrentContentLink = function () {
        return this.props.data.contentLink;
    };
    BaseEpiComponent.prototype.getContext = function () {
        return this.props.context;
    };
    /**
     * Invoke a method on the underlying controller for this component, using strongly typed arguments and responses.
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    BaseEpiComponent.prototype.invokeTyped = function (method, verb, args) {
        return this.getContext().contentDeliveryApi().invokeTypedControllerMethod(this.getCurrentContentLink(), method, verb, args);
    };
    /**
     * Invoke a method on the underlying controller for this component
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    BaseEpiComponent.prototype.invoke = function (method, verb, args) {
        return this.getContext().contentDeliveryApi().invokeControllerMethod(this.getCurrentContentLink(), method, verb, args);
    };
    BaseEpiComponent.prototype.htmlObject = function (htmlValue) {
        return {
            __html: htmlValue
        };
    };
    BaseEpiComponent.prototype.navigateTo = function (toPage) {
        this.props.context.navigateTo(toPage);
    };
    return BaseEpiComponent;
}(react_1.Component));
exports.BaseEpiComponent = BaseEpiComponent;
var EpiComponent = /** @class */ (function (_super) {
    __extends(EpiComponent, _super);
    function EpiComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EpiComponent;
}(BaseEpiComponent));
exports.default = EpiComponent;
