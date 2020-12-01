import React, { useState, useEffect } from 'react';
import StringUtils from '../Util/StringUtils';
import { useEpiserver, useIContentRepository, useForceUpdate, useServiceContainer, useServerSideRendering } from '../Hooks/Context';
import { ContentLinkService } from '../Models/ContentLink';
import { DefaultServices } from '../Core/IServiceContainer';
import Spinner from '../Components/Spinner';
/**
 * The Episerver CMS Component wrapper
 */
export const EpiComponent = (props) => {
    const ctx = useEpiserver();
    const ssr = useServerSideRendering();
    if (!props.contentLink)
        return ctx.isDebugActive() ? React.createElement("div", { className: "alert alert-danger" }, "Debug: No content link provided") : null;
    const repo = useIContentRepository();
    const componentLoader = useServiceContainer().getService(DefaultServices.ComponentLoader);
    const forceUpdate = useForceUpdate();
    const [iContent, setIContent] = useState(props.expandedValue || ssr.getIContent(props.contentLink));
    // Always check if the component is available
    const componentName = iContent ? buildComponentName(iContent, props.contentType) : null;
    const componentAvailable = componentName && componentLoader.isPreLoaded(componentName) ? true : false;
    // Make sure the right iContent has been assigned
    useEffect(() => {
        if (isExpandedValueValid(iContent, props.contentLink))
            return;
        if (props.expandedValue && isExpandedValueValid(props.expandedValue, props.contentLink)) {
            setIContent(props.expandedValue);
            return;
        }
        setIContent(null);
        repo.load(props.contentLink).then(x => setIContent(x));
    }, [props.contentLink, props.expandedValue, props.contentType]);
    // Update the iContent if the database changes
    useEffect(() => {
        const myApiId = ContentLinkService.createApiId(props.contentLink);
        const onContentPatched = (item, newValue) => {
            const itemApiId = ContentLinkService.createApiId(item);
            if (myApiId === itemApiId)
                setIContent(newValue);
        };
        repo.addListener("afterPatch", onContentPatched, repo);
        return () => {
            repo.removeListener("afterPatch", onContentPatched);
        };
    }, [props.contentLink]);
    // Load component if needed
    useEffect(() => {
        if (!componentAvailable && componentName) {
            componentLoader.LoadType(componentName).then(() => forceUpdate());
        }
    }, [componentAvailable, componentName]);
    // Update content once available
    useEffect(() => {
        if (!iContent)
            return;
        const handleUpdate = (item) => {
            if (item && item.contentLink.guidValue === iContent.contentLink.guidValue)
                setIContent(item);
        };
        repo.addListener("afterUpdate", handleUpdate);
        return () => { repo.removeListener("afterUpdate", handleUpdate); };
    }, [iContent]);
    // Render the component, or a loader when not all data is present
    const componentType = componentName && componentAvailable ?
        componentLoader.getPreLoadedType(componentName) :
        null;
    return componentType && iContent ? React.createElement(componentType, Object.assign(Object.assign({}, props), { context: ctx, data: iContent })) : Spinner.CreateInstance({});
};
/**
 * Create the instantiable type of the EpiComponent for the current
 * context. It'll return the base EpiComponent or a EpiComponent wrapped
 * in the connect method from React-Redux.
 *
 * @param { IEpiserverContext } context The application context
 * @returns { EpiComponentType }
 */
EpiComponent.CreateComponent = (context) => EpiComponent;
export default EpiComponent;
//#region Internal methods for the Episerver CMS Component
/**
 * Check if the current expanded value is both set and relates to the current
 * content reference.
 */
const isExpandedValueValid = (content, link) => {
    try {
        return content && content.contentLink.guidValue === link.guidValue ? true : false;
    }
    catch (e) {
        return false;
    }
};
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
//#endregion
