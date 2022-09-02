import React from 'react';
/**
 * A default layout implementation, simply wrapping the site in a div
 *
 * @param   props   The properties of this layout
 */
export const Layout = (props) => {
    return React.createElement("div", { className: "site-layout" }, props.children);
};
export const NotFoundComponent = (props) => {
    return React.createElement("div", { className: "not-found-component" }, props.children);
};
export default Layout;
//# sourceMappingURL=Layout.js.map