import React, { Component } from 'react';
import EpiComponent from './EpiComponent';
export default class ContentArea extends Component {
    render() {
        // Return the children if there's no components
        if (!this.props.data || !this.props.data.value)
            return this.props.children || this.renderNoChildren();
        // Render the actual components
        const components = this.props.data.value.map(this.renderComponent.bind(this));
        if (this.props.noWrap === true) {
            if (this.props.propertyName && this.props.context.isEditable()) {
                return React.createElement("div", { "data-epi-edit": this.props.propertyName }, components);
            }
            return components;
        }
        // If there's no container, just output the row
        const rowClass = `content-area ${this.getConfigValue('defaultRowClass', 'row')}`;
        if (!this.props.addContainer) {
            if (this.props.context.isEditable()) {
                return React.createElement("div", { className: rowClass, "data-epi-edit": this.props.propertyName }, components);
            }
            return React.createElement("div", { className: rowClass }, components);
        }
        const containerBreakBlockClass = this.getConfigValue('containerBreakBlockClass', undefined);
        const containerClass = this.getConfigValue('defaultContainerClass', 'container');
        if (!containerBreakBlockClass) {
            return React.createElement("div", { className: containerClass },
                React.createElement("div", { className: rowClass, "data-epi-edit": this.props.context.isEditable() ? this.props.propertyName : null }, components));
        }
        const containers = [{ isContainer: true, components: [] }];
        let containerIdx = 0;
        components.forEach(c => {
            const classNames = c.props.className;
            if (classNames.indexOf(containerBreakBlockClass) >= 0) {
                if (containers[containerIdx].components.length === 0) {
                    containers[containerIdx].isContainer = false;
                    containers[containerIdx].components.push(c);
                }
                else {
                    containerIdx++;
                    containers[containerIdx] = { isContainer: false, components: [c] };
                }
                containerIdx++;
                containers[containerIdx] = { isContainer: true, components: [] };
            }
            else {
                containers[containerIdx].components.push(c);
            }
        });
        const groupedComponents = containers.map((cItem, idx) => {
            if (cItem.isContainer) {
                return React.createElement("div", { className: containerClass, key: `ContentArea-${this.props.propertyName}-item-${idx}` },
                    React.createElement("div", { className: rowClass }, cItem.components));
            }
            else if (cItem.components.length > 1) {
                return React.createElement("div", { key: `ContentArea-${this.props.propertyName}-item-${idx}` }, cItem.components);
            }
            else {
                return cItem.components[0];
            }
        });
        if (this.props.context.isEditable()) {
            return React.createElement("div", { "data-epi-edit": this.props.propertyName }, groupedComponents);
        }
        return groupedComponents;
    }
    renderComponent(item, idx) {
        // Get expanded value
        let expandedValue;
        if (this.props.data.expandedValue) {
            expandedValue = this.props.data.expandedValue[idx];
        }
        // Build component
        const ConnectedEpiComponent = EpiComponent.CreateComponent(this.props.context);
        const component = React.createElement(ConnectedEpiComponent, { context: this.props.context, contentLink: item.contentLink, contentType: this.getComponentType(), key: item.contentLink.guidValue, expandedValue: expandedValue });
        // Return if no wrapping
        if (this.props.noWrap === true) {
            if (this.props.context.isEditable()) {
                return React.createElement("div", { "data-epi-block-id": item.contentLink.id, key: item.contentLink.guidValue + "-container" }, component);
            }
            return component;
        }
        // Build wrapper element
        const displayOption = item.displayOption || "default";
        const props = {
            "data-displayoption": displayOption,
            "data-tag": item.tag,
            "className": this.getBlockClasses(displayOption).join(' '),
            "key": `${item.contentLink.guidValue}-container`,
            "children": component
        };
        if (this.props.context.isEditable())
            props["data-epi-block-id"] = item.contentLink.id;
        return React.createElement('div', props);
    }
    renderNoChildren() {
        if (this.props.context.isEditable()) {
            return React.createElement("div", { "data-epi-edit": this.props.propertyName },
                React.createElement("div", { className: "alert alert-info m-5" },
                    "There're no blocks in ",
                    React.createElement("i", null, this.props.propertyName || 'this area')));
        }
        return React.createElement("div", null);
    }
    getBlockClasses(displayOption) {
        const cssClasses = ['block'];
        const displayOptions = this.getConfigValue('displayOptions', {}) || {};
        if (displayOptions[displayOption]) {
            cssClasses.push(displayOptions[displayOption]);
        }
        else {
            cssClasses.push(this.getConfigValue('defaultBlockClass', 'col'));
        }
        return cssClasses;
    }
    /**
     * Retrieve the ContentArea configuration, as the global configuration overridden by the
     * instance configuration.
     */
    getConfig() {
        var _a;
        const globalConfig = ((_a = this.props.context.config()) === null || _a === void 0 ? void 0 : _a.contentArea) || {};
        return Object.assign(Object.assign({}, globalConfig), this.props);
    }
    getConfigValue(propName, defaultValue) {
        const cfg = this.getConfig();
        if (cfg[propName]) {
            return cfg[propName];
        }
        return defaultValue;
    }
    getComponentType() {
        const cfg = this.getConfig();
        return cfg.itemContentType || "Block";
    }
}
