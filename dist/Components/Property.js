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
var ContentLink_1 = require("../Models/ContentLink");
var EpiComponent_1 = __importDefault(require("./EpiComponent"));
var ContentArea_1 = __importDefault(require("./ContentArea"));
var Property = /** @class */ (function (_super) {
    __extends(Property, _super);
    function Property() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Property.prototype.hasProperty = function () {
        return this.props.iContent[this.props.field] ? true : false;
    };
    Property.prototype.getProperty = function () {
        if (this.hasProperty()) {
            return this.props.iContent[this.props.field];
        }
        return null;
    };
    Property.prototype.isIContentProperty = function (p) {
        if (p && p.propertyDataType && typeof (p.propertyDataType) === 'string') {
            return true;
        }
        return false;
    };
    Property.prototype.render = function () {
        if (!this.hasProperty()) {
            return this.props.context.isDebugActive() ? react_1.default.createElement("div", null,
                "Property ",
                react_1.default.createElement("span", null, this.props.field),
                " not present") : null;
        }
        var prop = this.getProperty();
        var propType = this.isIContentProperty(prop) ? prop.propertyDataType : typeof (prop);
        var stringValue;
        switch (propType) {
            case 'string':
                return this.isEditable() ? react_1.default.createElement("span", { className: this.props.className, "data-epi-edit": this.props.field }, prop) : (this.props.className ? react_1.default.createElement("span", { className: this.props.className }, prop) : prop);
            case 'PropertyString':
            case 'PropertyLongString':
                stringValue = prop.value;
                return this.isEditable() ? react_1.default.createElement("span", { className: this.props.className, "data-epi-edit": this.props.field }, stringValue) : (this.props.className ? react_1.default.createElement("span", { className: this.props.className }, stringValue) : stringValue);
            case 'PropertyUrl':
                var propUrlValue = prop.value;
                var props = {
                    className: this.props.className,
                    href: propUrlValue,
                    children: this.props.children || propUrlValue
                };
                if (this.isEditable()) {
                    props['data-epi-edit'] = this.props.field;
                }
                return react_1.default.createElement('a', props);
            case 'PropertyDecimal':
            case 'PropertyNumber':
            case 'PropertyFloatNumber':
                var propNumberValue = prop.value;
                var className = "number " + this.props.className;
                return this.isEditable() ? react_1.default.createElement("span", { className: className, "data-epi-edit": this.props.field }, propNumberValue) : react_1.default.createElement("span", { className: className }, propNumberValue);
            case 'PropertyXhtmlString':
                stringValue = prop.value;
                return this.isEditable() ? react_1.default.createElement("div", { className: this.props.className, "data-epi-edit": this.props.field, dangerouslySetInnerHTML: { __html: stringValue } }) : react_1.default.createElement("div", { className: this.props.className, dangerouslySetInnerHTML: { __html: stringValue } });
            case 'PropertyContentReference':
            case 'PropertyPageReference':
                var link = prop.value;
                var expValue = prop.expandedValue;
                var ConnectedEpiComponent = EpiComponent_1.default.CreateComponent(this.props.context);
                var item = react_1.default.createElement(ConnectedEpiComponent, { contentLink: link, expandedValue: expValue, context: this.props.context, className: this.props.className });
                return this.isEditable() ? react_1.default.createElement("div", { "data-epi-edit": this.props.field }, item) : item;
            case 'PropertyContentArea':
                return this.isEditable() ?
                    react_1.default.createElement(ContentArea_1.default, { data: prop, context: this.props.context, propertyName: this.props.field }) :
                    react_1.default.createElement(ContentArea_1.default, { data: prop, context: this.props.context });
        }
        return this.props.context.isDebugActive() ? react_1.default.createElement("div", { className: "alert alert-warning" },
            "Property type ",
            react_1.default.createElement("span", null, propType),
            " not supported") : null;
    };
    /**
     * Helper method to ensure properties are only editable on the page/content they belong
     * to, this is used to ensure properties from a StartPage are only made editable when the
     * current page is the StartPage.
     *
     * Edit mode does not use SPA Routing, thus updating properties is not a main concern
     */
    Property.prototype.isEditable = function () {
        if (!this.props.context.isEditable())
            return false;
        var routedContent = this.props.context.getRoutedContent();
        var routedContentId = ContentLink_1.ContentLinkService.createApiId(routedContent.contentLink);
        var myContentId = ContentLink_1.ContentLinkService.createApiId(this.props.iContent.contentLink);
        return routedContentId === myContentId;
    };
    return Property;
}(react_1.Component));
exports.default = Property;
