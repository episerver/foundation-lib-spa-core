"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const react_1 = require("react");
const Property_1 = require("../Property");
const ContentLink_1 = require("../Models/ContentLink");
const EpiComponent_1 = require("./EpiComponent");
const ContentArea_1 = require("./ContentArea");
const Context_1 = require("../Hooks/Context");
function Property(props) {
    var _a;
    const ctx = Context_1.useEpiserver();
    const schemaInfo = Context_1.useIContentSchema();
    const prop = getProperty(props.iContent, props.field);
    const [propType, setPropType] = react_1.useState(Property_1.isVerboseProperty(prop) ?
        prop.propertyDataType :
        (_a = schemaInfo.getProperty(schemaInfo.getTypeNameFromIContent(props.iContent) || 'Unknown', props.field)) === null || _a === void 0 ? void 0 : _a.type);
    // Allow updating the property when the schema has become
    // avilable (the schema information can be loaded asynchronously)
    react_1.useEffect(() => {
        var _a, _b;
        let isCancelled = false;
        const iContentType = schemaInfo.getTypeNameFromIContent(props.iContent) || 'Unknown';
        const basePropType = Property_1.isVerboseProperty(prop) ? prop.propertyDataType : (_a = schemaInfo.getProperty(iContentType, props.field)) === null || _a === void 0 ? void 0 : _a.type;
        if (basePropType)
            setPropType(basePropType);
        else {
            if (!schemaInfo.isReady)
                schemaInfo.whenReady.then(s => {
                    var _a;
                    if (!isCancelled) {
                        const type = s.getTypeNameFromIContent(props.iContent) || 'Unknown';
                        setPropType((_a = s.getProperty(type, props.field)) === null || _a === void 0 ? void 0 : _a.type);
                    }
                });
            else
                setPropType((_b = schemaInfo.getProperty(iContentType, props.field)) === null || _b === void 0 ? void 0 : _b.type);
        }
        return () => { isCancelled = true; };
    }, [schemaInfo, props.field, props.iContent, prop]);
    // Don't continue when we don't know the property type to render
    if (!propType)
        return ctx.isDebugActive() && schemaInfo.isReady ? react_1.default.createElement("div", { className: "alert alert-warning" },
            "Property ",
            react_1.default.createElement("span", null, props.field),
            " not present") : null;
    // Now, get the property value & expandedValue to start rendering it
    const propValue = Property_1.readValue(prop);
    const expandedValue = Property_1.readExpandedValue(prop);
    let stringValue;
    switch (propType) {
        case 'string':
        case 'PropertyString':
        case 'PropertyLongString':
            stringValue = propValue || "";
            return isEditable(props.iContent, ctx) ? react_1.default.createElement("span", { className: props.className, "data-epi-edit": props.field }, stringValue) : (props.className ? react_1.default.createElement("span", { className: props.className }, stringValue) : react_1.default.createElement(react_1.default.Fragment, null, stringValue));
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
                return react_1.createElement('a', propUrlprops);
            }
        case 'PropertyDecimal':
        case 'PropertyNumber':
        case 'PropertyFloatNumber':
            {
                const propNumberValue = propValue || 0;
                const className = `number ${props.className}`;
                return isEditable(props.iContent, ctx) ? react_1.default.createElement("span", { className: className, "data-epi-edit": props.field }, propNumberValue) : react_1.default.createElement("span", { className: className }, propNumberValue);
            }
        case 'PropertyXhtmlString':
            stringValue = propValue || "";
            return isEditable(props.iContent, ctx) ? react_1.default.createElement("div", { className: props.className, "data-epi-edit": props.field, dangerouslySetInnerHTML: { __html: stringValue } }) : react_1.default.createElement("div", { suppressHydrationWarning: true, className: props.className, dangerouslySetInnerHTML: { __html: stringValue } });
        case 'PropertyContentReference':
        case 'PropertyPageReference':
            {
                let item = null;
                const link = propValue;
                if (link) {
                    const expValue = link.expanded || expandedValue;
                    item = react_1.default.createElement(EpiComponent_1.default, { contentLink: link, expandedValue: expValue, className: props.className });
                }
                return isEditable(props.iContent, ctx) ? react_1.default.createElement("div", { "data-epi-edit": props.field }, item) : item;
            }
        case 'PropertyContentArea':
            if (prop)
                return isEditable(props.iContent, ctx) ?
                    react_1.default.createElement(ContentArea_1.default, { data: prop, propertyName: props.field }) :
                    react_1.default.createElement(ContentArea_1.default, { data: prop });
            return null;
    }
    return ctx.isDebugActive() ? react_1.default.createElement("div", { className: "alert alert-warning" },
        "Property type ",
        react_1.default.createElement("span", null, propType || "UNKNOWN"),
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
    return undefined;
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