"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const react_1 = require("react");
const ContentLink_1 = require("../Models/ContentLink");
const EpiComponent_1 = require("./EpiComponent");
const ContentArea_1 = require("./ContentArea");
const Context_1 = require("../Hooks/Context");
function Property(props) {
    const ctx = Context_1.useEpiserver();
    if (!hasProperty(props.iContent, props.field.toString())) {
        return ctx.isDebugActive() ? react_1.default.createElement("div", null,
            "Property ",
            react_1.default.createElement("span", null, props.field),
            " not present") : null;
    }
    const prop = getProperty(props.iContent, props.field);
    const propType = isIContentProperty(prop) ? prop.propertyDataType : typeof (prop);
    let stringValue;
    switch (propType) {
        case 'string':
            return isEditable(props.iContent, ctx) ? react_1.default.createElement("span", { className: props.className, "data-epi-edit": props.field }, prop) : (props.className ? react_1.default.createElement("span", { className: props.className }, prop) : react_1.default.createElement(react_1.default.Fragment, null, prop));
        case 'PropertyString':
        case 'PropertyLongString':
            stringValue = isIContentProperty(prop) ? prop.value : '';
            return isEditable(props.iContent, ctx) ? react_1.default.createElement("span", { className: props.className, "data-epi-edit": props.field }, stringValue) : (props.className ? react_1.default.createElement("span", { className: props.className }, stringValue) : react_1.default.createElement(react_1.default.Fragment, null, stringValue));
        case 'PropertyUrl':
            {
                const propUrlValue = isIContentProperty(prop) ? prop.value : '';
                const propUrlprops = {
                    className: props.className,
                    href: propUrlValue,
                    children: props.children || propUrlValue
                };
                if (isEditable(props.iContent, ctx)) {
                    propUrlprops['data-epi-edit'] = props.field;
                }
                return react_1.createElement('a', propUrlprops);
            }
        case 'PropertyDecimal':
        case 'PropertyNumber':
        case 'PropertyFloatNumber':
            {
                const propNumberValue = isIContentProperty(prop) ? prop.value : 0;
                const className = `number ${props.className}`;
                return isEditable(props.iContent, ctx) ? react_1.default.createElement("span", { className: className, "data-epi-edit": props.field }, propNumberValue) : react_1.default.createElement("span", { className: className }, propNumberValue);
            }
        case 'PropertyXhtmlString':
            stringValue = isIContentProperty(prop) ? prop.value : '';
            return isEditable(props.iContent, ctx) ? react_1.default.createElement("div", { className: props.className, "data-epi-edit": props.field, dangerouslySetInnerHTML: { __html: stringValue } }) : react_1.default.createElement("div", { suppressHydrationWarning: true, className: props.className, dangerouslySetInnerHTML: { __html: stringValue } });
        case 'PropertyContentReference':
        case 'PropertyPageReference':
            {
                let item = null;
                if (isIContentProperty(prop)) {
                    const link = prop.value;
                    const expValue = prop.expandedValue;
                    item = react_1.default.createElement(EpiComponent_1.default, { contentLink: link, expandedValue: expValue, className: props.className });
                }
                return isEditable(props.iContent, ctx) ? react_1.default.createElement("div", { "data-epi-edit": props.field }, item) : item;
            }
        case 'PropertyContentArea':
            if (isIContentProperty(prop))
                return isEditable(props.iContent, ctx) ?
                    react_1.default.createElement(ContentArea_1.default, { data: prop, propertyName: props.field }) :
                    react_1.default.createElement(ContentArea_1.default, { data: prop });
            return null;
    }
    return ctx.isDebugActive() ? react_1.default.createElement("div", { className: "alert alert-warning" },
        "Property type ",
        react_1.default.createElement("span", null, propType),
        " not supported") : null;
}
exports.Property = Property;
Property.displayName = "Optimizely CMS: IContent Property Renderer";
exports.default = Property;
function hasProperty(iContent, field) {
    return iContent[field] ? true : false;
}
function getProperty(iContent, field) {
    if (hasProperty(iContent, field)) {
        return iContent[field];
    }
    return null;
}
function isIContentProperty(p) {
    if (p && p.propertyDataType && typeof (p.propertyDataType) === 'string') {
        return true;
    }
    return false;
}
function isEditable(iContent, ctx) {
    if (!ctx.isEditable())
        return false;
    if (!ctx.hasRoutedContent())
        return false;
    const routedContent = ctx.getRoutedContent();
    const routedContentId = ContentLink_1.ContentLinkService.createApiId(routedContent.contentLink);
    const myContentId = ContentLink_1.ContentLinkService.createApiId(iContent.contentLink);
    return routedContentId === myContentId;
}
//# sourceMappingURL=Property.js.map