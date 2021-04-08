import React, { useState, useEffect } from 'react';
import StringUtils from '../Util/StringUtils';
import { useEpiserver, useIContentRepository, useServiceContainer, useServerSideRendering, useForceUpdate } from '../Hooks/Context';
import { ContentLinkService } from '../Models/ContentLink';
import { DefaultServices } from '../Core/IServiceContainer';
import Spinner from '../Components/Spinner';
const safeLanguageId = (ref, branch = '##', def = '') => {
    try {
        return ref ? ContentLinkService.createLanguageId(ref, branch, true) : def;
    }
    catch (e) {
        return def;
    }
};
function _EpiComponent(props) {
    // Get Hooks & Services
    const ctx = useEpiserver();
    const ssr = useServerSideRendering();
    const repo = useIContentRepository();
    const repaint = useForceUpdate();
    const componentLoader = useServiceContainer().getService(DefaultServices.ComponentLoader);
    // Get identifiers from props
    const expandedValueId = safeLanguageId(props.expandedValue);
    const contentLinkId = safeLanguageId(props.contentLink, ctx.Language);
    // Build iContent state and build identifier
    const [iContent, setIContent] = useState(props.expandedValue && (expandedValueId === contentLinkId) ? props.expandedValue : ssr.getIContent(props.contentLink));
    const iContentId = safeLanguageId(iContent);
    // Always check if the component is available
    const componentName = iContent ? buildComponentName(iContent, props.contentType) : null;
    const componentAvailable = componentName && componentLoader.isPreLoaded(componentName) ? true : false;
    // Make sure the right iContent has been assigned and will be kept in sync
    useEffect(() => {
        let isCancelled = false;
        // Add listeners to ensure content changes affect the component
        const onContentPatched = (item, newValue) => {
            const itemApiId = ContentLinkService.createLanguageId(newValue, '##', true);
            if (ctx.isDebugActive())
                console.debug('EpiComponent / onContentPatched: ', contentLinkId, itemApiId);
            if (contentLinkId === itemApiId)
                setIContent(newValue);
        };
        const onContentUpdated = (item) => {
            const itemApiId = item ? ContentLinkService.createLanguageId(item, '##', true) : '##';
            if (ctx.isDebugActive())
                console.debug('EpiComponent / onContentUpdated: ', contentLinkId, itemApiId);
            if (contentLinkId === itemApiId)
                setIContent(item);
        };
        repo.addListener("afterPatch", onContentPatched);
        repo.addListener("afterUpdate", onContentUpdated);
        // If we don't have the correct iContent
        if (iContentId !== contentLinkId) {
            if (expandedValueId === contentLinkId) {
                setIContent(props.expandedValue || null);
            }
            else {
                repo.load(props.contentLink).then(x => { if (!isCancelled)
                    setIContent(x); });
            }
        }
        // Cancel effect and remove listeners
        return () => {
            isCancelled = true;
            repo.removeListener("afterPatch", onContentPatched);
            repo.removeListener("afterUpdate", onContentUpdated);
        };
    }, [contentLinkId]);
    // Load && update component if needed
    useEffect(() => {
        let isCancelled = false;
        if (!componentName)
            return;
        if (!componentAvailable)
            componentLoader.LoadType(componentName).then(() => { if (!isCancelled)
                repaint(); });
        return () => { isCancelled = true; };
    }, [componentAvailable, componentName]);
    const IContentComponent = componentName && componentAvailable ?
        componentLoader.getPreLoadedType(componentName) :
        null;
    return IContentComponent && iContent ?
        React.createElement(EpiComponentErrorBoundary, { componentName: componentName || "unkown component" },
            React.createElement(IContentComponent, Object.assign({}, Object.assign(Object.assign({}, props), { context: ctx, data: iContent })))) :
        Spinner.CreateInstance({});
}
/**
 * Create the instantiable type of the EpiComponent for the current
 * context. It'll return the base EpiComponent or a EpiComponent wrapped
 * in the connect method from React-Redux.
 *
 * @param { IEpiserverContext } context The application context
 * @returns { EpiBaseComponentType }
 */
_EpiComponent.CreateComponent = (context) => _EpiComponent;
const EpiComponent = _EpiComponent;
EpiComponent.displayName = "Episerver IContent";
export default EpiComponent;
//#region Internal methods for the Episerver CMS Component
/**
 * Create the name of the React Component to load for this EpiComponent
 *
 * @param item The IContent to be presented by this EpiComponent
 */
const buildComponentName = (item, contentType) => {
    const context = contentType || '';
    const iContentType = (item === null || item === void 0 ? void 0 : item.contentType) || ['Error', 'ContentNotPresent'];
    let baseName = iContentType.map((s) => StringUtils.SafeModelName(s)).join('/');
    if (context && context !== iContentType[0]) {
        baseName = context + '/' + baseName;
    }
    return `app/Components/${baseName}`;
};
class EpiComponentErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
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
            return React.createElement("div", { className: "alert alert-danger" },
                "Uncaught error in ",
                React.createElement("span", null, this.props.componentName));
        }
        return this.props.children;
    }
}
//#endregion
//# sourceMappingURL=EpiComponent.js.map