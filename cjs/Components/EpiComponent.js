"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComponentName = exports.IContentRenderer = void 0;
const react_1 = require("react");
const StringUtils_1 = require("../Util/StringUtils");
const Context_1 = require("../Hooks/Context");
const ContentLink_1 = require("../Models/ContentLink");
const Spinner_1 = require("../Components/Spinner");
const react_router_1 = require("react-router");
const safeLanguageId = (ref, branch = '##', def = '', inclWorkId = true) => {
    try {
        return ref ? ContentLink_1.ContentLinkService.createLanguageId(ref, branch, inclWorkId) : def;
    }
    catch (e) {
        return def;
    }
};
function EpiComponent(props) {
    // Get Hooks & Services
    const ctx = Context_1.useEpiserver();
    const ssr = Context_1.useServerSideRendering();
    const repo = Context_1.useIContentRepository();
    // Get convenience variables from services
    const debug = ctx.isDebugActive();
    const lang = ctx.Language;
    // Get identifiers from props
    const initialContent = () => {
        if (!props.expandedValue)
            return ssr.getIContent(props.contentLink);
        const expandedId = safeLanguageId(props.expandedValue, lang);
        const linkId = safeLanguageId(props.contentLink, lang);
        return expandedId === linkId ? props.expandedValue : ssr.getIContent(props.contentLink);
    };
    const [iContent, setIContent] = react_1.useState(initialContent);
    // Make sure the right iContent has been assigned and will be kept in sync
    react_1.useEffect(() => {
        let isCancelled = false;
        const linkId = safeLanguageId(props.contentLink, lang, 'linkId');
        // Define listeners to ensure content changes affect the component
        const onContentPatched = (contentLink, oldValue, newValue) => {
            const itemApiId = safeLanguageId(contentLink, lang, 'patchedId');
            if (debug)
                console.debug('EpiComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
            if (linkId === itemApiId) {
                if (debug)
                    console.debug('EpiComponent.onContentPatched => Updating iContent', itemApiId, newValue);
                setIContent(newValue);
            }
        };
        const onContentUpdated = (item) => {
            const itemApiId = safeLanguageId(item, lang, 'updatedId');
            if (linkId === itemApiId) {
                if (debug)
                    console.debug('EpiComponent.onContentUpdated => Updating iContent', itemApiId, item);
                setIContent(item);
            }
        };
        // Bind listeners and load content
        repo.addListener("afterPatch", onContentPatched);
        repo.addListener("afterUpdate", onContentUpdated);
        repo.load(props.contentLink).then(x => { if (!isCancelled)
            setIContent(x); });
        // Cancel effect and remove listeners
        return () => {
            isCancelled = true;
            repo.removeListener("afterPatch", onContentPatched);
            repo.removeListener("afterUpdate", onContentUpdated);
        };
    }, [props.contentLink, repo, debug, lang]);
    if (!iContent)
        return react_1.default.createElement(Spinner_1.Spinner, null);
    return react_1.default.createElement(exports.IContentRenderer, { data: iContent, contentType: props.contentType, actionName: props.actionName, actionData: props.actionData });
}
EpiComponent.displayName = "Optimizely CMS: ContentLink IContent resolver";
const IContentRenderer = (props) => {
    const context = Context_1.useEpiserver();
    const path = react_router_1.useLocation().pathname;
    const componentLoader = Context_1.useServiceContainer().getService("ComponentLoader" /* ComponentLoader */);
    const componentName = exports.buildComponentName(props.data, props.contentType);
    const [componentAvailable, setComponentAvailable] = react_1.useState(componentLoader.isPreLoaded(componentName));
    const debug = context.isDebugActive();
    react_1.useEffect(() => {
        let isCancelled = false;
        if (!componentLoader.isPreLoaded(componentName)) {
            setComponentAvailable(false);
            componentLoader.LoadType(componentName).then(component => {
                if (debug)
                    console.debug('IContentRenderer.loadType => Loaded component: ', componentName, component ? 'success' : 'failed', (component === null || component === void 0 ? void 0 : component.displayName) || "Unnamed / no component");
                if (!isCancelled)
                    setComponentAvailable(component ? true : false);
            });
        }
        else
            setComponentAvailable(true);
        return () => { isCancelled = true; };
    }, [componentName, componentLoader, props.data, debug]);
    if (!componentAvailable)
        return react_1.default.createElement(Spinner_1.Spinner, null);
    const IContentComponent = componentLoader.getPreLoadedType(componentName, false);
    if (!IContentComponent)
        return react_1.default.createElement(Spinner_1.Spinner, null);
    if (debug)
        console.debug('IContentRenderer.render => Component & IContent: ', componentName, props.data);
    return react_1.default.createElement(EpiComponentErrorBoundary, { componentName: componentName || "Error resolving component" },
        react_1.default.createElement(IContentComponent, { data: props.data, contentLink: props.data.contentLink, path: path || '', context: context, actionName: props.actionName, actionData: props.actionData }));
};
exports.IContentRenderer = IContentRenderer;
exports.IContentRenderer.displayName = "Optimizely CMS: IContent renderer";
exports.default = EpiComponent;
//#region Internal methods for the Episerver CMS Component
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
exports.buildComponentName = buildComponentName;
class EpiComponentErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error('EpiComponent caught error', error, errorInfo);
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return react_1.default.createElement("div", { className: "alert alert-danger" },
                "Uncaught error in ",
                react_1.default.createElement("span", null, this.props.componentName));
        }
        return this.props.children;
    }
}
EpiComponentErrorBoundary.displayName = "Optimizely CMS: IContent Error Boundary";
//#endregion
//# sourceMappingURL=EpiComponent.js.map