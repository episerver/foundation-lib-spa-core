import React, { useState, useEffect } from 'react';
import StringUtils from '../Util/StringUtils';
import { useEpiserver, useIContentRepository, useServiceContainer, useServerSideRendering } from '../Hooks/Context';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import ComponentLoader from '../Loaders/ComponentLoader';
import IEpiserverContext from '../Core/IEpiserverContext';
import { DefaultServices } from '../Core/IServiceContainer';
import { ComponentProps } from '../EpiComponent';
import { Spinner } from '../Components/Spinner';

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

const safeLanguageId = (ref: ContentReference | null | undefined, branch = '##', def = '') => {
    try {
        return ref ? ContentLinkService.createLanguageId(ref, branch, true) : def;
    } catch (e) {
        return def;
    }
}

function _EpiComponent<T extends IContent = IContent>(props: EpiComponentProps<T>) : React.ReactElement<unknown> |null {
    // Get Hooks & Services
    const ctx = useEpiserver();
    const ssr = useServerSideRendering();
    const repo = useIContentRepository();
    const componentLoader = useServiceContainer().getService<ComponentLoader>(DefaultServices.ComponentLoader);

    // Get convenience variables from services
    const debug = ctx.isDebugActive();
    const lang = ctx.Language;

    // Get identifiers from props
    const initialContent = () => {
        if (!props.expandedValue) return ssr.getIContent<T>(props.contentLink);
        const expandedId = safeLanguageId(props.expandedValue, lang);
        const linkId = safeLanguageId(props.contentLink, lang);
        return expandedId === linkId ? props.expandedValue : ssr.getIContent<T>(props.contentLink);
    };
    const [ iContent, setIContent ] = useState(initialContent);
    const [ loadedTypes, setLoadedTypes ] = useState<string[]>([]);

    // Make sure the right iContent has been assigned and will be kept in sync
    useEffect(() => {
        let isCancelled = false;
        const linkId = safeLanguageId(props.contentLink, lang);

        // Define listeners to ensure content changes affect the component
        const onContentPatched = (item: ContentReference, newValue: IContent) => {
            const itemApiId = safeLanguageId(newValue, lang);
            if (linkId === itemApiId) {
                if (debug) console.debug('EpiComponent / onContentPatched - Updating iContent', itemApiId);
                setIContent(newValue as T);
            }
        }
        const onContentUpdated = (item : IContent | null) => {
            const itemApiId = safeLanguageId(item, lang);
            if (linkId === itemApiId) {
                if (debug) console.debug('EpiComponent / onContentUpdated - Updating iContent', itemApiId);
                setIContent(item as T);
            }
        }

        // Bind listeners and load content
        repo.addListener("afterPatch", onContentPatched);
        repo.addListener("afterUpdate", onContentUpdated);
        repo.load(props.contentLink).then(x => { if (!isCancelled) setIContent(x as T) });

        // Cancel effect and remove listeners
        return () => { 
            isCancelled = true; 
            repo.removeListener("afterPatch", onContentPatched);
            repo.removeListener("afterUpdate", onContentUpdated);
        }
    }, [ props.contentLink, repo, debug, lang ]);

    // Load && update component if needed
    useEffect(() => {
        let isCancelled = false;
        const componentName = iContent ? buildComponentName(iContent, props.contentType) : null;
        if (!componentName) return;

        if (!componentLoader.isPreLoaded(componentName))
            componentLoader.LoadType<ComponentProps<T>>(componentName).then(() => { 
                if (!isCancelled) 
                    setLoadedTypes(x => ([] as string[]).concat(x, [ componentName ]))
            });

        return () => { isCancelled = true }
    }, [ iContent, componentLoader, props.contentType ]);
    
    // Render iContent
    const shouldRender = safeLanguageId(props.contentLink, lang) === (iContent ? safeLanguageId(iContent.contentLink, lang) : '-NO-ICONTENT-');
    const componentName = iContent ? buildComponentName(iContent, props.contentType) : null;
    const IContentComponent = componentName && componentLoader.isPreLoaded(componentName) ? componentLoader.getPreLoadedType<ComponentProps<T>>(componentName) : null;
    return shouldRender && iContent && IContentComponent ? 
            <EpiComponentErrorBoundary componentName={ componentName || "unkown component" }>
                <IContentComponent { ...{ ...props, context: ctx, data: iContent } } />
                <DebugComponentList loadedComponents={ loadedTypes } />
            </EpiComponentErrorBoundary>  : 
            <Spinner />;
}

const DebugComponentList : React.FunctionComponent<{ loadedComponents: string[] }> = (props) => {
    const debug = useEpiserver().isDebugActive();
    if (!debug) return null;
    return <ul aria-hidden="true" style={ { display: "none" }}>{ props?.loadedComponents?.map(x => <li key={ x }>{ x }</li>) }</ul>
}

/**
 * Create the instantiable type of the EpiComponent for the current
 * context. It'll return the base EpiComponent or a EpiComponent wrapped
 * in the connect method from React-Redux.
 * 
 * @param { IEpiserverContext } context The application context
 * @returns { EpiBaseComponentType }
 */
_EpiComponent.CreateComponent = (): EpiBaseComponentType => _EpiComponent;

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
    
    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
    
    componentDidCatch(error: unknown, errorInfo: unknown) {
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
