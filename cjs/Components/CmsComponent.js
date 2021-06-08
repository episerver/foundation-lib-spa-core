"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsComponent = void 0;
const react_1 = require("react");
const Context_1 = require("../Hooks/Context");
const EpiComponent_1 = require("./EpiComponent");
/**
 * Dynamic component which loads both the ReactComponent & iContent data based upon the content link
 * provided.
 *
 * @deprecated  Use the EpiComponent Component instead
 */
const CmsComponent = (props) => {
    const ctx = Context_1.useEpiserver();
    if (ctx.isDebugActive()) {
        console.warn('The CmsComponent has been depricated, use the EpiComponent instead.');
    }
    return react_1.default.createElement(EpiComponent_1.default, Object.assign({}, props));
};
exports.CmsComponent = CmsComponent;
exports.CmsComponent.displayName = "Optimizely CMS: Component (DEPRECATED)";
exports.default = exports.CmsComponent;
//# sourceMappingURL=CmsComponent.js.map