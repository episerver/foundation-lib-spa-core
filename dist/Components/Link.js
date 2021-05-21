import React, { Component } from 'react';
import { ContentLinkService } from '../Models/ContentLink';
export default class Link extends Component {
    render() {
        const href = ContentLinkService.createHref(this.props.href);
        if (href) {
            return React.createElement("a", { href: href, className: this.props.className }, this.props.children);
        }
        return this.props.children;
    }
}
//# sourceMappingURL=Link.js.map