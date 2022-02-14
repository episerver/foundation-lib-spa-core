import React from 'react';
import { useEpiserver } from '../Hooks/Context';
import { ContentLinkService } from '../Models/ContentLink';
import EpiComponent from './EpiComponent';
export const ContentArea = (props) => {
    var _a, _b, _c;
    const ctx = useEpiserver();
    // Check if the areay is empty
    if (!((_a = props.data) === null || _a === void 0 ? void 0 : _a.value))
        return props.children ? React.createElement("div", null, props.children) : React.createElement(DefaultEmptyContentArea, { propertyName: props.propertyName });
    // Build the configuration
    const globalConfig = ((_b = ctx.config()) === null || _b === void 0 ? void 0 : _b.contentArea) || {};
    const config = Object.assign(Object.assign({}, globalConfig), props);
    const wrapperClass = getConfigValue(config, 'wrapperClass', 'content-area');
    // Render the items
    const items = [];
    (((_c = props.data) === null || _c === void 0 ? void 0 : _c.value) || []).forEach((x, i) => {
        var _a, _b;
        const className = getBlockClasses(x.displayOption, config, props.columns).join(' ');
        const blockKey = `ContentAreaItem-${ContentLinkService.createApiId(x.contentLink, true, false)}-${i}`;
        items.push(React.createElement(ContentAreaItem, { key: blockKey, item: x, config: config, idx: i, className: className, expandedValue: ((_a = props.data) === null || _a === void 0 ? void 0 : _a.expandedValue) ? (_b = props.data) === null || _b === void 0 ? void 0 : _b.expandedValue[i] : undefined, columns: props.columns || 12 }));
    });
    // Return if no wrapping
    if (getConfigValue(config, 'noWrap', false) === true)
        return ctx.isEditable() ? (React.createElement("div", { className: wrapperClass, "data-epi-block-id": props.propertyName }, items)) : (React.createElement(React.Fragment, null, items));
    // If there's no container, just output the row
    const rowClass = getConfigValue(config, 'defaultRowClass', 'row');
    if (!getConfigValue(config, 'addContainer', false))
        return ctx.isEditable() ? (React.createElement("div", { className: `${wrapperClass} ${rowClass}`, "data-epi-edit": props.propertyName }, items)) : (React.createElement("div", { className: rowClass }, items));
    // Prepare rendering the container
    const containerBreakBlockClass = getConfigValue(config, 'containerBreakBlockClass');
    const containerClass = getConfigValue(config, 'defaultContainerClass', 'container');
    // Output if there's no breaking block class defined
    if (!containerBreakBlockClass)
        return (React.createElement("div", { className: `${wrapperClass} ${containerClass}` },
            React.createElement("div", { className: rowClass, "data-epi-edit": ctx.isEditable() ? props.propertyName : undefined }, items)));
    // Split the items into containers
    const containers = [];
    let currentContainerId = 0;
    items.forEach((item) => {
        const cssClasses = (item.props.className || '').split(' ').filter((s) => s.length > 0);
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
        return (React.createElement("div", { className: containerClass, key: containerId },
            React.createElement("div", { className: rowClass }, container.items)));
    });
    // Output HTML
    return (React.createElement("div", { className: wrapperClass, "data-epi-edit": ctx.isEditable() ? props.propertyName : undefined }, rendered));
};
ContentArea.displayName = 'Optimizely CMS: Content Area';
export default ContentArea;
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
function getBlockColumnClasses(columns) {
    if (!columns)
        return 'col-12';
    const mdCols = columns < 6 ? 6 : columns;
    return `col-12 col-md-${mdCols} col-lg-${columns}`;
}
function getBlockClasses(displayOption, config, columns) {
    const cssClasses = ['block'];
    const displayOptions = getConfigValue(config, 'displayOptions', {});
    cssClasses.push(displayOptions[displayOption] ? displayOptions[displayOption] : '');
    cssClasses.push(getBlockColumnClasses(columns));
    return cssClasses.filter((x) => x);
}
const ContentAreaItem = (props) => {
    // Context
    const ctx = useEpiserver();
    // Build component
    const componentType = getConfigValue(props.config, 'itemContentType', 'Block');
    const component = (React.createElement(EpiComponent, { contentLink: props.item.contentLink, contentType: componentType, key: props.item.contentLink.guidValue, expandedValue: props.expandedValue, columns: props.columns }));
    const blockId = ContentLinkService.createApiId(props.item.contentLink, false, true);
    // Return if no wrapping
    if (getConfigValue(props.config, 'noWrap', false) === true)
        return ctx.isEditable() ? React.createElement("div", { "data-epi-block-id": blockId }, component) : component;
    // Build wrapper element
    const displayOption = props.item.displayOption || 'default';
    const wrapperProps = {
        'data-displayoption': displayOption,
        'data-tag': props.item.tag,
        className: props.className,
        children: component,
    };
    if (ctx.isEditable())
        wrapperProps['data-epi-block-id'] = blockId;
    return React.createElement("div", Object.assign({}, wrapperProps));
};
ContentAreaItem.displayName = 'Optimizely CMS: Content Area Item';
/**
 * Render and empty Content Area
 *
 * @param props The properties for the empty ContentArea renderer
 */
const DefaultEmptyContentArea = (props) => {
    const ctx = useEpiserver();
    if (ctx.isEditable())
        return (React.createElement("div", { "data-epi-edit": props.propertyName },
            React.createElement("div", { className: "alert alert-info m-5" },
                "There're no blocks in ",
                React.createElement("i", null, props.propertyName || 'this area'))));
    return null;
};
DefaultEmptyContentArea.displayName = 'Optimizely CMS: Empty Content Area';
//# sourceMappingURL=ContentArea.js.map