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
const EpiComponent_1 = __importDefault(require("./EpiComponent"));
class ContentArea extends react_1.Component {
    render() {
        // Return the children if there's no components
        if (!this.props.data || !this.props.data.value)
            return this.props.children || this.renderNoChildren();
        // Render the actual components
        const components = this.props.data.value.map(this.renderComponent.bind(this));
        if (this.props.noWrap === true) {
            if (this.props.propertyName && this.props.context.isEditable()) {
                return react_1.default.createElement("div", { "data-epi-edit": this.props.propertyName }, components);
            }
            return components;
        }
        // If there's no container, just output the row
        const rowClass = `content-area ${this.getConfigValue('defaultRowClass', 'row')}`;
        if (!this.props.addContainer) {
            if (this.props.context.isEditable()) {
                return react_1.default.createElement("div", { className: rowClass, "data-epi-edit": this.props.propertyName }, components);
            }
            return react_1.default.createElement("div", { className: rowClass }, components);
        }
        const containerBreakBlockClass = this.getConfigValue('containerBreakBlockClass', undefined);
        const containerClass = this.getConfigValue('defaultContainerClass', 'container');
        if (!containerBreakBlockClass) {
            return react_1.default.createElement("div", { className: containerClass },
                react_1.default.createElement("div", { className: rowClass, "data-epi-edit": this.props.context.isEditable() ? this.props.propertyName : null }, components));
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
                return react_1.default.createElement("div", { className: containerClass, key: `ContentArea-${this.props.propertyName}-item-${idx}` },
                    react_1.default.createElement("div", { className: rowClass }, cItem.components));
            }
            else if (cItem.components.length > 1) {
                return react_1.default.createElement("div", { key: `ContentArea-${this.props.propertyName}-item-${idx}` }, cItem.components);
            }
            else {
                return cItem.components[0];
            }
        });
        if (this.props.context.isEditable()) {
            return react_1.default.createElement("div", { "data-epi-edit": this.props.propertyName }, groupedComponents);
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
        const ConnectedEpiComponent = EpiComponent_1.default.CreateComponent(this.props.context);
        const component = react_1.default.createElement(ConnectedEpiComponent, { context: this.props.context, contentLink: item.contentLink, contentType: this.getComponentType(), key: item.contentLink.guidValue, expandedValue: expandedValue });
        // Return if no wrapping
        if (this.props.noWrap === true) {
            if (this.props.context.isEditable()) {
                return react_1.default.createElement("div", { "data-epi-block-id": item.contentLink.id, key: item.contentLink.guidValue + "-container" }, component);
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
        return react_1.default.createElement('div', props);
    }
    renderNoChildren() {
        if (this.props.context.isEditable()) {
            return react_1.default.createElement("div", { "data-epi-edit": this.props.propertyName },
                react_1.default.createElement("div", { className: "alert alert-info m-5" },
                    "There're no blocks in ",
                    react_1.default.createElement("i", null, this.props.propertyName || 'this area')));
        }
        return react_1.default.createElement("div", null);
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
exports.default = ContentArea;
