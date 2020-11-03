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
exports.EpiComponent = void 0;
const react_1 = __importStar(require("react"));
const StringUtils_1 = __importDefault(require("../Util/StringUtils"));
const Context_1 = require("../Hooks/Context");
const Spinner_1 = __importDefault(require("../Components/Spinner"));
const ComponentNotFound_1 = __importDefault(require("../Components/Errors/ComponentNotFound"));
/**
 * The Episerver CMS Component wrapper
 */
exports.EpiComponent = (props) => {
    const repo = Context_1.useIContentRepository();
    const componentLoader = Context_1.useEpiserver().componentLoader();
    const forceUpdate = Context_1.useForceUpdate();
    const [iContent, setIContent] = react_1.useState(props.expandedValue || null);
    // Always check if the component is available
    const componentName = iContent ? buildComponentName(iContent, props.contentType) : null;
    const componentAvailable = componentName && componentLoader.isPreLoaded(componentName) ? true : false;
    // Make sure the right iContent has been assigned
    react_1.useEffect(() => {
        if (isExpandedValueValid(iContent, props.contentLink))
            return;
        if (props.expandedValue && isExpandedValueValid(props.expandedValue, props.contentLink)) {
            setIContent(props.expandedValue);
            return;
        }
        setIContent(null);
        repo.load(props.contentLink).then(x => setIContent(x));
    }, [props.contentLink, props.expandedValue, props.contentType]);
    // Load component if needed
    react_1.useEffect(() => {
        if (!componentAvailable && componentName) {
            componentLoader.LoadType(componentName).then(() => forceUpdate());
        }
    }, [componentAvailable, componentName]);
    // Render the component, or a loader when not all data is present
    const componentType = componentName && componentAvailable ?
        componentLoader.getPreLoadedType(componentName) :
        null;
    return componentType && iContent ? react_1.default.createElement(componentType, Object.assign(Object.assign({}, props), { data: iContent })) : Spinner_1.default.CreateInstance({});
};
/**
 * Create the instantiable type of the EpiComponent for the current
 * context. It'll return the base EpiComponent or a EpiComponent wrapped
 * in the connect method from React-Redux.
 *
 * @param { IEpiserverContext } context The application context
 * @returns { EpiComponentType }
 */
exports.EpiComponent.CreateComponent = (context) => exports.EpiComponent;
exports.default = exports.EpiComponent;
//#region Internal methods for the Episerver CMS Component
/**
 * Check if the current expanded value is both set and relates to the current
 * content reference.
 */
const isExpandedValueValid = (content, link) => {
    if (!content)
        return false;
    return content.contentLink.guidValue === link.guidValue;
};
const isComponentValid = (component, content, contentType) => {
    if (!component)
        return false;
    const name = buildComponentName(content, contentType);
    return component.displayName === ComponentNotFound_1.default.displayName || component.displayName === name;
};
/**
 * Create the name of the React Component to load for this EpiComponent
 *
 * @param item The IContent to be presented by this EpiComponent
 */
const buildComponentName = (item, contentType) => {
    const context = contentType || '';
    const iContentType = (item === null || item === void 0 ? void 0 : item.contentType) || ['Error', 'ContentNotPresent'];
    let baseName = iContentType.map((s) => StringUtils_1.default.SafeModelName(s)).join('/');
    if (context && context !== iContentType[0]) {
        baseName = context + '/' + baseName;
    }
    return `app/Components/${baseName}`;
};
//#endregion
