import React, { useState, useEffect } from 'react';
import StringUtils from '../Util/StringUtils';
import { useEpiserver, useIContentRepository, useServiceContainer, useServerSideRendering, useForceUpdate } from '../Hooks/Context';
import ContentLink, { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import ComponentLoader from '../Loaders/ComponentLoader';
import IEpiserverContext from '../Core/IEpiserverContext';
import { DefaultServices } from '../Core/IServiceContainer';
import { ComponentProps } from '../EpiComponent';
import Spinner from '../Components/Spinner';

/**
 * The base type for the Episerver CMS Component
 */
export type EpiBaseComponentType<T extends IContent = IContent> = React.ComponentType<EpiComponentProps<T>>;
export type EpiComponentType<T extends IContent = IContent> = EpiBaseComponentType<T> & {
    CreateComponent(context: IEpiserverContext) : EpiBaseComponentType<IContent>
}

/**
 * The properties for the Episerver CMS Component
 */
export type EpiComponentProps<T extends IContent = IContent> = Omit<ComponentProps<T>, "data"|"context"> & {
	/**
	 * The data for the component, if it has been fetched before.
	 */
	expandedValue: T | undefined
    
    /**
     * Legacy context, kept as argument for now, but ignored by the implementation
     * 
     * @deprecated
     */
    context?: IEpiserverContext
}

const safeLanguageId = (ref: ContentReference | null | undefined, branch: string = '##', def: string = '') => {
    try {
        return ref ? ContentLinkService.createLanguageId(ref, branch, true) : def;
    } catch (e) {
        return def;
    }
}

function _EpiComponent<T extends IContent = IContent>(props: EpiComponentProps<T>) {
    // Get Hooks & Services
    const ctx = useEpiserver();
    const ssr = useServerSideRendering();
    const repo = useIContentRepository();
    const repaint = useForceUpdate();
    const componentLoader = useServiceContainer().getService<ComponentLoader>(DefaultServices.ComponentLoader);

    // Get identifiers from props
    const expandedValueId = safeLanguageId(props.expandedValue);
    const contentLinkId = safeLanguageId(props.contentLink, ctx.Language);

    // Build iContent state and build identifier
    const [ iContent, setIContent ] = useState<T | null>(props.expandedValue && (expandedValueId === contentLinkId) ? props.expandedValue : ssr.getIContent<T>(props.contentLink));
    const iContentId = safeLanguageId(iContent);

    // Always check if the component is available
    const componentName = iContent ? buildComponentName(iContent, props.contentType) : null;
    const componentAvailable = componentName && componentLoader.isPreLoaded(componentName) ? true : false;

    // Make sure the right iContent has been assigned and will be kept in sync
    useEffect(() => {
        let isCancelled : boolean = false;

        // Add listeners to ensure content changes affect the component
        const onContentPatched = (item: ContentReference, newValue: IContent) => {
            const itemApiId = ContentLinkService.createLanguageId(newValue, '##', true);
            if (ctx.isDebugActive()) console.debug('EpiComponent / onContentPatched: ', contentLinkId, itemApiId);
            if (contentLinkId === itemApiId) setIContent(newValue as T);
        }
        const onContentUpdated = (item : IContent | null) => {
            const itemApiId = item ? ContentLinkService.createLanguageId(item, '##', true) : '##';
            if (ctx.isDebugActive()) console.debug('EpiComponent / onContentUpdated: ', contentLinkId, itemApiId);
            if (contentLinkId === itemApiId) setIContent(item as T);
        }
        repo.addListener("afterPatch", onContentPatched);
        repo.addListener("afterUpdate", onContentUpdated);

        // If we don't have the correct iContent
        if (iContentId !== contentLinkId) {
            if (expandedValueId === contentLinkId) {
                setIContent(props.expandedValue || null);
            } else {
                repo.load(props.contentLink).then(x => {if (!isCancelled) setIContent(x as T)});
            }
        }

        // Cancel effect and remove listeners
        return () => { 
            isCancelled = true; 
            repo.removeListener("afterPatch", onContentPatched);
            repo.removeListener("afterUpdate", onContentUpdated);
        }
    }, [ contentLinkId ]);

    // Load && update component if needed
    useEffect(() => {
        let isCancelled : boolean = false;
        if (!componentName) return;
        if (!componentAvailable)
            componentLoader.LoadType<ComponentProps<T>>(componentName).then(() => { if (!isCancelled) repaint() });
        return () => { isCancelled = true }
    }, [ componentAvailable, componentName ]);
    
    const IContentComponent = componentName && componentAvailable ?
            componentLoader.getPreLoadedType(componentName) :
            null;
    return IContentComponent && iContent ? 
            <EpiComponentErrorBoundary componentName={ componentName || "unkown component" }><IContentComponent { ...{ ...props, context: ctx, data: iContent } } /></EpiComponentErrorBoundary>  : 
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
_EpiComponent.CreateComponent = (context: IEpiserverContext): EpiBaseComponentType => _EpiComponent;

const EpiComponent : EpiComponentType = _EpiComponent;
EpiComponent.displayName = "Episerver IContent"
export default EpiComponent;

//#region Internal methods for the Episerver CMS Component
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

//#region Error boundary
type EpiComponentErrorBoundaryProps = React.PropsWithChildren<{
    componentName: string
}>
class EpiComponentErrorBoundary extends React.Component<EpiComponentErrorBoundaryProps, { hasError: boolean }>
{
    constructor(props: EpiComponentErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
    
    componentDidCatch(error: any, errorInfo: any) {
        console.error('EpiComponent caught error', error, errorInfo);
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div className="alert alert-danger">Uncaught error in <span>{ this.props.componentName }</span></div>;
        }
    
        return this.props.children; 
    }
}
//#endregion
