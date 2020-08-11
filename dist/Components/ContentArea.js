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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var EpiComponent_1 = __importDefault(require("./EpiComponent"));
var ContentArea = /** @class */ (function (_super) {
    __extends(ContentArea, _super);
    function ContentArea() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContentArea.prototype.render = function () {
        var _this = this;
        // Return the children if there's no components
        if (!this.props.data || !this.props.data.value)
            return this.props.children || this.renderNoChildren();
        // Render the actual components
        var components = this.props.data.value.map(this.renderComponent.bind(this));
        if (this.props.noWrap === true) {
            if (this.props.propertyName && this.props.context.isEditable()) {
                return react_1.default.createElement("div", { "data-epi-edit": this.props.propertyName }, components);
            }
            return components;
        }
        // If there's no container, just output the row
        var rowClass = "content-area " + this.getConfigValue('defaultRowClass', 'row');
        if (!this.props.addContainer) {
            if (this.props.context.isEditable()) {
                return react_1.default.createElement("div", { className: rowClass, "data-epi-edit": this.props.propertyName }, components);
            }
            return react_1.default.createElement("div", { className: rowClass }, components);
        }
        var containerBreakBlockClass = this.getConfigValue('containerBreakBlockClass', undefined);
        var containerClass = this.getConfigValue('defaultContainerClass', 'container');
        if (!containerBreakBlockClass) {
            return react_1.default.createElement("div", { className: containerClass },
                react_1.default.createElement("div", { className: rowClass, "data-epi-edit": this.props.context.isEditable() ? this.props.propertyName : null }, components));
        }
        var containers = [{ isContainer: true, components: [] }];
        var containerIdx = 0;
        components.forEach(function (c) {
            var classNames = c.props.className;
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
        var groupedComponents = containers.map(function (cItem, idx) {
            if (cItem.isContainer) {
                return react_1.default.createElement("div", { className: containerClass, key: "ContentArea-" + _this.props.propertyName + "-item-" + idx },
                    react_1.default.createElement("div", { className: rowClass }, cItem.components));
            }
            else if (cItem.components.length > 1) {
                return react_1.default.createElement("div", { key: "ContentArea-" + _this.props.propertyName + "-item-" + idx }, cItem.components);
            }
            else {
                return cItem.components[0];
            }
        });
        if (this.props.context.isEditable()) {
            return react_1.default.createElement("div", { "data-epi-edit": this.props.propertyName }, groupedComponents);
        }
        return groupedComponents;
    };
    ContentArea.prototype.renderComponent = function (item, idx) {
        // Get expanded value
        var expandedValue;
        if (this.props.data.expandedValue) {
            expandedValue = this.props.data.expandedValue[idx];
        }
        // Build component
        var ConnectedEpiComponent = EpiComponent_1.default.CreateComponent(this.props.context);
        var component = react_1.default.createElement(ConnectedEpiComponent, { context: this.props.context, contentLink: item.contentLink, contentType: this.getComponentType(), key: item.contentLink.guidValue, expandedValue: expandedValue });
        // Return if no wrapping
        if (this.props.noWrap === true) {
            if (this.props.context.isEditable()) {
                return react_1.default.createElement("div", { "data-epi-block-id": item.contentLink.id, key: item.contentLink.guidValue + "-container" }, component);
            }
            return component;
        }
        // Build wrapper element
        var displayOption = item.displayOption || "default";
        var props = {
            "data-displayoption": displayOption,
            "data-tag": item.tag,
            "className": this.getBlockClasses(displayOption).join(' '),
            "key": item.contentLink.guidValue + "-container",
            "children": component
        };
        if (this.props.context.isEditable())
            props["data-epi-block-id"] = item.contentLink.id;
        return react_1.default.createElement('div', props);
    };
    ContentArea.prototype.renderNoChildren = function () {
        if (this.props.context.isEditable()) {
            return react_1.default.createElement("div", { "data-epi-edit": this.props.propertyName },
                react_1.default.createElement("div", { className: "alert alert-info m-5" },
                    "There're no blocks in ",
                    react_1.default.createElement("i", null, this.props.propertyName || 'this area')));
        }
        return react_1.default.createElement("div", null);
    };
    ContentArea.prototype.getBlockClasses = function (displayOption) {
        var cssClasses = ['block'];
        var displayOptions = this.getConfigValue('displayOptions', {}) || {};
        if (displayOptions[displayOption]) {
            cssClasses.push(displayOptions[displayOption]);
        }
        else {
            cssClasses.push(this.getConfigValue('defaultBlockClass', 'col'));
        }
        return cssClasses;
    };
    /**
     * Retrieve the ContentArea configuration, as the global configuration overridden by the
     * instance configuration.
     */
    ContentArea.prototype.getConfig = function () {
        var _a;
        var globalConfig = ((_a = this.props.context.config()) === null || _a === void 0 ? void 0 : _a.contentArea) || {};
        return __assign(__assign({}, globalConfig), this.props);
    };
    ContentArea.prototype.getConfigValue = function (propName, defaultValue) {
        var cfg = this.getConfig();
        if (cfg[propName]) {
            return cfg[propName];
        }
        return defaultValue;
    };
    ContentArea.prototype.getComponentType = function () {
        var cfg = this.getConfig();
        return cfg.itemContentType || "Block";
    };
    return ContentArea;
}(react_1.Component));
exports.default = ContentArea;
