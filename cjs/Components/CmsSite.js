"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpiserverWebsite = void 0;
// Import libraries
const react_1 = require("react");
const react_helmet_1 = require("react-helmet");
const react_redux_1 = require("react-redux");
const Context_1 = require("../Hooks/Context");
// Import Episerver Taxonomy
const Layout_1 = require("./Layout");
// Import Episerver Components
const EpiSpaRouter_1 = require("../Routing/EpiSpaRouter");
const CmsCommunicator_1 = require("./CmsCommunicator");
const EpiserverWebsite = (props) => {
    const SiteLayout = getLayout(props.context);
    const ssr = props.context.serviceContainer.getService("ServerContext" /* ServerContext */);
    const location = (props.context.isServerSideRendering() ? ssr.Path : window.location.pathname) || undefined;
    return react_1.default.createElement(react_redux_1.Provider, { store: props.context.getStore() },
        react_1.default.createElement(Context_1.default.Provider, { value: props.context },
            react_1.default.createElement(react_helmet_1.Helmet, null),
            react_1.default.createElement(CmsCommunicator_1.default, null),
            react_1.default.createElement(EpiSpaRouter_1.default, { location: location, context: props.staticContext },
                react_1.default.createElement(SiteLayout, { context: props.context },
                    react_1.default.createElement(EpiSpaRouter_1.RoutedContent, { config: props.context.config().routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                    props.children))));
};
exports.EpiserverWebsite = EpiserverWebsite;
function getLayout(context) {
    return context.config().layout || Layout_1.default;
}
exports.EpiserverWebsite.displayName = "Optimizely CMS: Website";
exports.default = exports.EpiserverWebsite;
//# sourceMappingURL=CmsSite.js.map