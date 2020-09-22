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
const ContentLink_1 = require("../Models/ContentLink");
const EpiComponent_1 = __importDefault(require("./EpiComponent"));
const ContentArea_1 = __importDefault(require("./ContentArea"));
class Property extends react_1.Component {
    hasProperty() {
        return this.props.iContent[this.props.field] ? true : false;
    }
    getProperty() {
        if (this.hasProperty()) {
            return this.props.iContent[this.props.field];
        }
        return null;
    }
    isIContentProperty(p) {
        if (p && p.propertyDataType && typeof (p.propertyDataType) === 'string') {
            return true;
        }
        return false;
    }
    render() {
        if (!this.hasProperty()) {
            return this.props.context.isDebugActive() ? react_1.default.createElement("div", null,
                "Property ",
                react_1.default.createElement("span", null, this.props.field),
                " not present") : null;
        }
        const prop = this.getProperty();
        const propType = this.isIContentProperty(prop) ? prop.propertyDataType : typeof (prop);
        let stringValue;
        switch (propType) {
            case 'string':
                return this.isEditable() ? react_1.default.createElement("span", { className: this.props.className, "data-epi-edit": this.props.field }, prop) : (this.props.className ? react_1.default.createElement("span", { className: this.props.className }, prop) : prop);
            case 'PropertyString':
            case 'PropertyLongString':
                stringValue = prop.value;
                return this.isEditable() ? react_1.default.createElement("span", { className: this.props.className, "data-epi-edit": this.props.field }, stringValue) : (this.props.className ? react_1.default.createElement("span", { className: this.props.className }, stringValue) : stringValue);
            case 'PropertyUrl':
                const propUrlValue = prop.value;
                const props = {
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
                const propNumberValue = prop.value;
                const className = `number ${this.props.className}`;
                return this.isEditable() ? react_1.default.createElement("span", { className: className, "data-epi-edit": this.props.field }, propNumberValue) : react_1.default.createElement("span", { className: className }, propNumberValue);
            case 'PropertyXhtmlString':
                stringValue = prop.value;
                return this.isEditable() ? react_1.default.createElement("div", { className: this.props.className, "data-epi-edit": this.props.field, dangerouslySetInnerHTML: { __html: stringValue } }) : react_1.default.createElement("div", { className: this.props.className, dangerouslySetInnerHTML: { __html: stringValue } });
            case 'PropertyContentReference':
            case 'PropertyPageReference':
                const link = prop.value;
                const expValue = prop.expandedValue;
                const ConnectedEpiComponent = EpiComponent_1.default.CreateComponent(this.props.context);
                const item = react_1.default.createElement(ConnectedEpiComponent, { contentLink: link, expandedValue: expValue, context: this.props.context, className: this.props.className });
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
    }
    /**
     * Helper method to ensure properties are only editable on the page/content they belong
     * to, this is used to ensure properties from a StartPage are only made editable when the
     * current page is the StartPage.
     *
     * Edit mode does not use SPA Routing, thus updating properties is not a main concern
     */
    isEditable() {
        if (!this.props.context.isEditable())
            return false;
        const routedContent = this.props.context.getRoutedContent();
        const routedContentId = ContentLink_1.ContentLinkService.createApiId(routedContent.contentLink);
        const myContentId = ContentLink_1.ContentLinkService.createApiId(this.props.iContent.contentLink);
        return routedContentId === myContentId;
    }
}
exports.default = Property;
