import React, { createElement } from 'react';
import { ContentLinkService } from '../Models/ContentLink';
import EpiComponent from './EpiComponent';
import ContentArea from './ContentArea';
import { useEpiserver } from '../Hooks/Context';
export function Property(props) {
    const ctx = useEpiserver();
    if (!hasProperty(props.iContent, props.field.toString())) {
        return ctx.isDebugActive() ? React.createElement("div", null,
            "Property ",
            React.createElement("span", null, props.field),
            " not present") : null;
    }
    const prop = getProperty(props.iContent, props.field);
    const propType = isIContentProperty(prop) ? prop.propertyDataType : typeof (prop);
    let stringValue;
    switch (propType) {
        case 'string':
            return isEditable(props.iContent, ctx) ? React.createElement("span", { className: props.className, "data-epi-edit": props.field }, prop) : (props.className ? React.createElement("span", { className: props.className }, prop) : React.createElement(React.Fragment, null, prop));
        case 'PropertyString':
        case 'PropertyLongString':
            stringValue = isIContentProperty(prop) ? prop.value : '';
            return isEditable(props.iContent, ctx) ? React.createElement("span", { className: props.className, "data-epi-edit": props.field }, stringValue) : (props.className ? React.createElement("span", { className: props.className }, stringValue) : React.createElement(React.Fragment, null, stringValue));
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
                return createElement('a', propUrlprops);
            }
        case 'PropertyDecimal':
        case 'PropertyNumber':
        case 'PropertyFloatNumber':
            {
                const propNumberValue = isIContentProperty(prop) ? prop.value : 0;
                const className = `number ${props.className}`;
                return isEditable(props.iContent, ctx) ? React.createElement("span", { className: className, "data-epi-edit": props.field }, propNumberValue) : React.createElement("span", { className: className }, propNumberValue);
            }
        case 'PropertyXhtmlString':
            stringValue = isIContentProperty(prop) ? prop.value : '';
            return isEditable(props.iContent, ctx) ? React.createElement("div", { className: props.className, "data-epi-edit": props.field, dangerouslySetInnerHTML: { __html: stringValue } }) : React.createElement("div", { suppressHydrationWarning: true, className: props.className, dangerouslySetInnerHTML: { __html: stringValue } });
        case 'PropertyContentReference':
        case 'PropertyPageReference':
            {
                let item = null;
                if (isIContentProperty(prop)) {
                    const link = prop.value;
                    const expValue = prop.expandedValue;
                    item = React.createElement(EpiComponent, { contentLink: link, expandedValue: expValue, className: props.className });
                }
                return isEditable(props.iContent, ctx) ? React.createElement("div", { "data-epi-edit": props.field }, item) : item;
            }
        case 'PropertyContentArea':
            if (isIContentProperty(prop))
                return isEditable(props.iContent, ctx) ?
                    React.createElement(ContentArea, { data: prop, propertyName: props.field }) :
                    React.createElement(ContentArea, { data: prop });
            return null;
    }
    return ctx.isDebugActive() ? React.createElement("div", { className: "alert alert-warning" },
        "Property type ",
        React.createElement("span", null, propType),
        " not supported") : null;
}
Property.displayName = "Optimizely CMS: IContent Property Renderer";
export default Property;
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
    const routedContentId = ContentLinkService.createApiId(routedContent.contentLink);
    const myContentId = ContentLinkService.createApiId(iContent.contentLink);
    return routedContentId === myContentId;
}
//# sourceMappingURL=Property.js.map