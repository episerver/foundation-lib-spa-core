"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentArea = void 0;
const react_1 = require("react");
const Context_1 = require("../Hooks/Context");
const ContentLink_1 = require("../Models/ContentLink");
const Property_1 = require("../Property");
const EpiComponent_1 = require("./EpiComponent");
const ContentArea = (props) => {
    var _a;
    const ctx = Context_1.useEpiserver();
    const value = Property_1.isVerboseProperty(props.data) ? props.data.value : props.data;
    // Check if the areay is empty
    if (!value)
        return props.children ? react_1.default.createElement("div", null, props.children) : react_1.default.createElement(DefaultEmptyContentArea, { propertyName: props.propertyName });
    // Build the configuration
    const globalConfig = ((_a = ctx.config()) === null || _a === void 0 ? void 0 : _a.contentArea) || {};
    const config = Object.assign(Object.assign({}, globalConfig), props);
    const wrapperClass = getConfigValue(config, 'wrapperClass', 'content-area');
    // Render the items
    const items = [];
    (value || []).forEach((x, i) => {
        const className = getBlockClasses(x.displayOption, config).join(' ');
        const blockKey = `ContentAreaItem-${ContentLink_1.ContentLinkService.createApiId(x.contentLink, true, false)}-${i}`;
        const expandedValue = x.expandedValue || (Property_1.isVerboseProperty(props.data) && props.data.expandedValue ? props.data.expandedValue[i] : undefined);
        items.push(react_1.default.createElement(ContentAreaItem, { key: blockKey, item: x, config: config, idx: i, className: className, expandedValue: expandedValue }));
    });
    // Return if no wrapping
    if (getConfigValue(config, "noWrap", false) === true)
        return ctx.isEditable() ? react_1.default.createElement("div", { className: wrapperClass, "data-epi-block-id": props.propertyName }, items) : react_1.default.createElement(react_1.Fragment, null, items);
    // If there's no container, just output the row
    const rowClass = getConfigValue(config, 'defaultRowClass', 'row');
    if (!getConfigValue(config, 'addContainer', false))
        return ctx.isEditable() ? react_1.default.createElement("div", { className: `${wrapperClass} ${rowClass}`, "data-epi-edit": props.propertyName }, items) : react_1.default.createElement("div", { className: rowClass }, items);
    // Prepare rendering the container
    const containerBreakBlockClass = getConfigValue(config, 'containerBreakBlockClass');
    const containerClass = getConfigValue(config, 'defaultContainerClass', 'container');
    // Output if there's no breaking block class defined
    if (!containerBreakBlockClass)
        return react_1.default.createElement("div", { className: `${wrapperClass} ${containerClass}` },
            react_1.default.createElement("div", { className: rowClass, "data-epi-edit": ctx.isEditable() ? props.propertyName : undefined }, items));
    // Split the items into containers
    const containers = [];
    let currentContainerId = 0;
    items.forEach(item => {
        const cssClasses = (item.props.className || "").split(' ').filter(s => s.length > 0);
        containers[currentContainerId] = containers[currentContainerId] || { items: [], shouldWrap: true };
        if (cssClasses.indexOf(containerBreakBlockClass) >= 0) {
            // Move to next container if not empty
            if (containers[currentContainerId] && containers[currentContainerId].items.length > 0)
                containers[++currentContainerId] = { items: [], shouldWrap: false };
            // Add item
            containers[currentContainerId].shouldWrap = false;
            containers[currentContainerId].items.push(item);
            // Move to next
            currentContainerId++;
        }
        else {
            containers[currentContainerId].items.push(item);
        }
    });
    // Render containers
    const rendered = containers.map((container, idx) => {
        const containerId = `ContentArea-${props.propertyName}-Container-${idx}`;
        if (!container.shouldWrap && container.items.length === 1)
            return container.items[0];
        if (container.items.length === 0)
            return null;
        return react_1.default.createElement("div", { className: containerClass, key: containerId },
            react_1.default.createElement("div", { className: rowClass }, container.items));
    });
    // Output HTML
    return react_1.default.createElement("div", { className: wrapperClass, "data-epi-edit": ctx.isEditable() ? props.propertyName : undefined }, rendered);
};
exports.ContentArea = ContentArea;
exports.ContentArea.displayName = "Optimizely CMS: Content Area";
exports.default = exports.ContentArea;
/**
 * A type-checked method that reads a value from the configuration, eliminating the "undefined" value option when
 * a default value has been provided for an optional configuration key.
 *
 * @param config        The configuration object, created by merging the global and instance configuration
 * @param key           The configuration key to read
 * @param defaultValue  The default value
 * @returns             The configured or default value
 */
function getConfigValue(config, key, defaultValue) {
    return (config[key] || defaultValue);
}
function getBlockClasses(displayOption, config) {
    const cssClasses = ['block'];
    const displayOptions = getConfigValue(config, 'displayOptions', {});
    cssClasses.push(displayOptions[displayOption] ? displayOptions[displayOption] : getConfigValue(config, 'defaultBlockClass', 'col'));
    return cssClasses.filter(x => x);
}
const ContentAreaItem = (props) => {
    // Context
    const ctx = Context_1.useEpiserver();
    // Build component
    const componentType = getConfigValue(props.config, "itemContentType", "Block");
    const component = react_1.default.createElement(EpiComponent_1.default, { contentLink: props.item.contentLink, contentType: componentType, key: props.item.contentLink.guidValue, expandedValue: props.expandedValue });
    const blockId = ContentLink_1.ContentLinkService.createApiId(props.item.contentLink, false, true);
    // Return if no wrapping
    if (getConfigValue(props.config, "noWrap", false) === true)
        return ctx.isEditable() ? react_1.default.createElement("div", { "data-epi-block-id": blockId }, component) : component;
    // Build wrapper element
    const displayOption = props.item.displayOption || "default";
    const wrapperProps = {
        "data-displayoption": displayOption,
        "data-tag": props.item.tag,
        "className": props.className,
        "children": component
    };
    if (ctx.isEditable())
        wrapperProps["data-epi-block-id"] = blockId;
    return react_1.default.createElement("div", Object.assign({}, wrapperProps));
};
ContentAreaItem.displayName = "Optimizely CMS: Content Area Item";
/**
 * Render and empty Content Area
 *
 * @param props The properties for the empty ContentArea renderer
 */
const DefaultEmptyContentArea = (props) => {
    const ctx = Context_1.useEpiserver();
    if (ctx.isEditable())
        return react_1.default.createElement("div", { "data-epi-edit": props.propertyName },
            react_1.default.createElement("div", { className: "alert alert-info m-5" },
                "There're no blocks in ",
                react_1.default.createElement("i", null, props.propertyName || 'this area')));
    return null;
};
DefaultEmptyContentArea.displayName = "Optimizely CMS: Empty Content Area";
//# sourceMappingURL=ContentArea.js.map