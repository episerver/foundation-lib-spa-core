"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const ContentLink_1 = require("../Models/ContentLink");
class Link extends react_1.Component {
    render() {
        const href = ContentLink_1.ContentLinkService.createHref(this.props.href);
        if (href) {
            return react_1.default.createElement("a", { href: href, className: this.props.className }, this.props.children);
        }
        return this.props.children;
    }
}
exports.default = Link;
//# sourceMappingURL=Link.js.map