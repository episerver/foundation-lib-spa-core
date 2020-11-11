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
exports.EpiserverWebsite = void 0;
// Import libraries
const react_1 = __importDefault(require("react"));
const react_helmet_1 = require("react-helmet");
const react_redux_1 = require("react-redux");
const Context_1 = __importDefault(require("../Hooks/Context"));
const Layout_1 = __importDefault(require("./Layout"));
const EpiSpaRouter = __importStar(require("../Routing/EpiSpaRouter"));
exports.EpiserverWebsite = (props) => {
    const SiteLayout = getLayout(props.context.config());
    const mainSite = react_1.default.createElement(Context_1.default.Provider, { value: props.context },
        react_1.default.createElement(EpiSpaRouter.Router, null,
            react_1.default.createElement(react_helmet_1.Helmet, null),
            react_1.default.createElement(SiteLayout, { context: props.context },
                react_1.default.createElement(EpiSpaRouter.RoutedContent, { config: props.context.config().routes || [], keyPrefix: "CmsSite-RoutedContent" }),
                props.children)));
    return props.context.isServerSideRendering() ? mainSite : react_1.default.createElement(react_redux_1.Provider, { store: props.context.getStore() }, mainSite);
};
function getLayout(config) {
    return config.layout || Layout_1.default;
}
exports.default = exports.EpiserverWebsite;
