import React, { FunctionComponent, useState, useEffect } from 'react';
import StringUtils from '../Util/StringUtils';
import { useEpiserver, useIContentRepository, useForceUpdate } from '../Hooks/Context';
import ContentLink, { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import ComponentLoader, { TComponentType } from '../Loaders/ComponentLoader';
import IEpiserverContext from '../Core/IEpiserverContext';
import { ComponentProps } from '../EpiComponent';
import Spinner from '../Components/Spinner';
import ComponentNotFound from '../Components/Errors/ComponentNotFound';

/**
 * The base type for the Episerver CMS Component
 */
export type EpiComponentType<T extends IContent = IContent> = FunctionComponent<EpiComponentProps<T>> & {
    CreateComponent<C extends IContent = IContent>(context: IEpiserverContext) : EpiComponentType<C>
}

/**
 * The properties for the Episerver CMS Component
 */
export type EpiComponentProps<T extends IContent = IContent> = Omit<ComponentProps<T>, "data"|"context"> & {
	/**
	 * The data for the component, if it has been fetched before.
	 */
	expandedValue?: IContent
    
    /**
     * Legacy context, kept as argument for now, but ignored by the implementation
     * 
     * @deprecated
     */
    context?: IEpiserverContext
}

/**
 * The Episerver CMS Component wrapper
 */
export const EpiComponent : EpiComponentType = <T extends IContent = IContent>(props: EpiComponentProps<T>) =>
{
    const ctx = useEpiserver();
    if (!props.contentLink) return ctx.isDebugActive() ? <div className="alert alert-danger">Debug: No content link provided</div> : null;

    const repo = useIContentRepository();
    const componentLoader = ctx.componentLoader();
    const forceUpdate = useForceUpdate();
    const [ iContent, setIContent ] = useState< IContent | null >(props.expandedValue || null);

    // Always check if the component is available
    const componentName = iContent ? buildComponentName(iContent, props.contentType) : null;
    const componentAvailable = componentName && componentLoader.isPreLoaded(componentName) ? true : false;

    // Make sure the right iContent has been assigned
    useEffect(() => {
        if (isExpandedValueValid(iContent, props.contentLink)) return;
        if (props.expandedValue && isExpandedValueValid(props.expandedValue, props.contentLink)) {
            setIContent(props.expandedValue);
            return
        }
        setIContent(null);
        repo.load(props.contentLink).then(x => setIContent(x));
    }, [ props.contentLink, props.expandedValue, props.contentType ]);

    // Update the iContent if the database changes
    useEffect(() => {
        const myApiId = ContentLinkService.createApiId(props.contentLink);
        const onContentPatched = (item: ContentReference, newValue: IContent) => {
            const itemApiId = ContentLinkService.createApiId(item);
            if (myApiId === itemApiId) setIContent(newValue);
        }
        repo.addListener("afterPatch", onContentPatched, repo);
        return () => {
            repo.removeListener("afterPatch", onContentPatched);
        }
    }, [ props.contentLink ]);

    // Load component if needed
    useEffect(() => {
        if (!componentAvailable && componentName) {
            componentLoader.LoadType(componentName).then(() => forceUpdate());
        }
    }, [ componentAvailable, componentName ]);

    // Render the component, or a loader when not all data is present
    const componentType = componentName && componentAvailable ?
        componentLoader.getPreLoadedType(componentName) :
        null;
    return componentType && iContent ? React.createElement(componentType, { ...props, context: ctx, data: iContent}) : Spinner.CreateInstance({});
}

/**
 * Create the instantiable type of the EpiComponent for the current
 * context. It'll return the base EpiComponent or a EpiComponent wrapped
 * in the connect method from React-Redux.
 * 
 * @param { IEpiserverContext } context The application context
 * @returns { EpiComponentType }
 */
EpiComponent.CreateComponent = <C extends IContent = IContent>(context: IEpiserverContext) : EpiComponentType<C> => EpiComponent;
export default EpiComponent;

//#region Internal methods for the Episerver CMS Component
/**
 * Check if the current expanded value is both set and relates to the current
 * content reference.
 */
const isExpandedValueValid : (content: IContent|null|undefined, link: ContentLink) => boolean = (content: IContent|null|undefined, link: ContentLink) =>
{
    try {
        return content && content.contentLink.guidValue === link.guidValue ? true : false;
    } catch (e) {
        return false;
    }
}

/**
 * Create the name of the React Component to load for this EpiComponent
 * 
 * @param item The IContent to be presented by this EpiComponent
 */
const buildComponentName : (item : IContent | null, contentType?: string) => string = (item, contentType) =>
{
    const context : string = contentType || '';
    const iContentType = item?.contentType || ['Error', 'ContentNotPresent'];
    let baseName = iContentType.map((s) => StringUtils.SafeModelName(s)).join('/');
    if (context && context !== iContentType[0]) {
        baseName = context + '/' + baseName;
    }
    return `app/Components/${ baseName }`;
}
//#endregion