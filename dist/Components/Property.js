import React, { createElement, useState, useEffect } from 'react';
import { isVerboseProperty, readValue, readExpandedValue } from '../Property';
import { ContentLinkService } from '../Models/ContentLink';
import EpiComponent from './EpiComponent';
import ContentArea from './ContentArea';
import { useEpiserver, useIContentSchema } from '../Hooks/Context';
export function Property(props) {
    const ctx = useEpiserver();
    const schemaInfo = useIContentSchema();
    const prop = getProperty(props.iContent, props.field);
    const [propType, setPropType] = useState(isVerboseProperty(prop) ?
        prop.propertyDataType :
        schemaInfo.getProperty(schemaInfo.getTypeNameFromIContent(props.iContent) || 'Unknown', props.field)?.type);
    // Allow updating the property when the schema has become
    // avilable (the schema information can be loaded asynchronously)
    useEffect(() => {
        let isCancelled = false;
        const iContentType = schemaInfo.getTypeNameFromIContent(props.iContent) || 'Unknown';
        const basePropType = isVerboseProperty(prop) ? prop.propertyDataType : schemaInfo.getProperty(iContentType, props.field)?.type;
        if (basePropType)
            setPropType(basePropType);
        else {
            if (!schemaInfo.isReady)
                schemaInfo.whenReady.then(s => {
                    if (!isCancelled) {
                        const type = s.getTypeNameFromIContent(props.iContent) || 'Unknown';
                        setPropType(s.getProperty(type, props.field)?.type);
                    }
                });
            else
                setPropType(schemaInfo.getProperty(iContentType, props.field)?.type);
        }
        return () => { isCancelled = true; };
    }, [schemaInfo, props.field, props.iContent, prop]);
    // Don't continue when we don't know the property type to render
    if (!propType)
        return ctx.isDebugActive() && schemaInfo.isReady ? React.createElement("div", { className: "alert alert-warning" },
            "Property ",
            React.createElement("span", null, props.field),
            " not present") : null;
    // Now, get the property value & expandedValue to start rendering it
    const propValue = readValue(prop);
    const expandedValue = readExpandedValue(prop);
    let stringValue;
    switch (propType) {
        case 'string':
        case 'PropertyString':
        case 'PropertyLongString':
            stringValue = propValue || "";
            return isEditable(props.iContent, ctx) ? React.createElement("span", { className: props.className, "data-epi-edit": props.field }, stringValue) : (props.className ? React.createElement("span", { className: props.className }, stringValue) : React.createElement(React.Fragment, null, stringValue));
        case 'PropertyUrl':
            {
                const propUrlValue = propValue || "";
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
                const propNumberValue = propValue || 0;
                const className = `number ${props.className}`;
                return isEditable(props.iContent, ctx) ? React.createElement("span", { className: className, "data-epi-edit": props.field }, propNumberValue) : React.createElement("span", { className: className }, propNumberValue);
            }
        case 'PropertyXhtmlString':
            stringValue = propValue || "";
            return isEditable(props.iContent, ctx) ? React.createElement("div", { className: props.className, "data-epi-edit": props.field, dangerouslySetInnerHTML: { __html: stringValue } }) : React.createElement("div", { suppressHydrationWarning: true, className: props.className, dangerouslySetInnerHTML: { __html: stringValue } });
        case 'PropertyContentReference':
        case 'PropertyPageReference':
            {
                let item = null;
                const link = propValue;
                if (link) {
                    const expValue = link.expanded || expandedValue;
                    item = React.createElement(EpiComponent, { contentLink: link, expandedValue: expValue, className: props.className });
                }
                return isEditable(props.iContent, ctx) ? React.createElement("div", { "data-epi-edit": props.field }, item) : item;
            }
        case 'PropertyContentArea':
            if (prop)
                return isEditable(props.iContent, ctx) ?
                    React.createElement(ContentArea, { data: prop, propertyName: props.field }) :
                    React.createElement(ContentArea, { data: prop });
            return null;
    }
    return ctx.isDebugActive() ? React.createElement("div", { className: "alert alert-warning" },
        "Property type ",
        React.createElement("span", null, propType || "UNKNOWN"),
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
    return undefined;
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