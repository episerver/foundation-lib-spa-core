"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
const react_1 = require("react");
/**
 * A default layout implementation, simply wrapping the site in a div
 *
 * @param   props   The properties of this layout
 */
const Layout = (props) => {
    return react_1.default.createElement("div", { className: "site-layout" }, props.children);
};
exports.Layout = Layout;
exports.default = exports.Layout;
//# sourceMappingURL=Layout.js.map