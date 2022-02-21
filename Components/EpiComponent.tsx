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
import { useLocation } from 'react-router';

/**
 * The properties for the Episerver CMS Component
 */
export type EpiComponentProps<T extends IContent = IContent> = Omit<ComponentProps<T>, 'data' | 'context'> & {
  /**
   * The data for the component, if it has been fetched before.
   */
  expandedValue: T | undefined;

  /**
   * Legacy context, kept as argument for now, but ignored by the implementation
   *
   * @deprecated
   */
  context?: IEpiserverContext;

  /**
   * The columns from the layout block
   *
   * @default 0
   */
  columns?: number;

  /**
   * The width from BE, convertable to Widths enum
   *
   * @default empty
   */
  layoutWidth?: string;

  /**
   * In layout block
   *
   * @default false
   */
  inLayoutBlock?: boolean;

  /**
   * The block ID for On page editing
   *
   * @default null
   */
  epiBlockId?: string | null;
};

const safeLanguageId = (ref: ContentReference | null | undefined, branch = '##', def = '', inclWorkId = true) => {
  try {
    return ref ? ContentLinkService.createLanguageId(ref, branch, inclWorkId) : def;
  } catch (e) {
    return def;
  }
};

function EpiComponent<T extends IContent = IContent>(props: EpiComponentProps<T>): React.ReactElement<unknown> | null {
  // Get Hooks & Services
  const ctx = useEpiserver();
  const ssr = useServerSideRendering();
  const repo = useIContentRepository();

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
  const [iContent, setIContent] = useState(initialContent);

  // Make sure the right iContent has been assigned and will be kept in sync
  useEffect(() => {
    let isCancelled = false;
    const linkId = safeLanguageId(props.contentLink, lang, 'linkId');

    // Define listeners to ensure content changes affect the component
    const onContentPatched = (contentLink: ContentReference, oldValue: IContent, newValue: IContent) => {
      const itemApiId = safeLanguageId(contentLink, lang, 'patchedId');
      if (debug)
        console.debug('EpiComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
      if (linkId === itemApiId) {
        if (debug) console.debug('EpiComponent.onContentPatched => Updating iContent', itemApiId, newValue);
        setIContent(newValue as T);
      }
    };
    const onContentUpdated = (item: IContent | null) => {
      const itemApiId = safeLanguageId(item, lang, 'updatedId');
      if (linkId === itemApiId) {
        if (debug) console.debug('EpiComponent.onContentUpdated => Updating iContent', itemApiId, item);
        setIContent(item as T);
      }
    };

    // Bind listeners and load content
    repo.addListener('afterPatch', onContentPatched);
    repo.addListener('afterUpdate', onContentUpdated);
    repo.load(props.contentLink).then((x) => {
      if (!isCancelled) setIContent(x as T);
    });

    // Cancel effect and remove listeners
    return () => {
      isCancelled = true;
      repo.removeListener('afterPatch', onContentPatched);
      repo.removeListener('afterUpdate', onContentUpdated);
    };
  }, [props.contentLink, repo, debug, lang]);

  if (!iContent) return <Spinner />;

  return (
    <IContentRenderer
      data={iContent}
      contentType={props.contentType}
      actionName={props.actionName}
      actionData={props.actionData}
      columns={props.columns}
      epiBlockId={props.epiBlockId}
    />
  );
}
EpiComponent.displayName = 'Optimizely CMS: ContentLink IContent resolver';

export const IContentRenderer: React.FunctionComponent<{
  data: IContent;
  contentType?: string;
  actionName?: string;
  actionData?: unknown;
  path?: string;
  columns?: number;
  layoutWidth?: string;
  inLayoutBlock?: boolean;
  epiBlockId?: string | null;
}> = (props) => {
  const context = useEpiserver();
  const path = useLocation().pathname;
  const componentLoader = useServiceContainer().getService<ComponentLoader>(DefaultServices.ComponentLoader);
  const componentName = buildComponentName(props.data, props.contentType);
  const [componentAvailable, setComponentAvailable] = useState<boolean>(componentLoader.isPreLoaded(componentName));
  const debug = context.isDebugActive();

  useEffect(() => {
    let isCancelled = false;
    if (!componentLoader.isPreLoaded(componentName)) {
      setComponentAvailable(false);
      componentLoader.LoadType(componentName).then((component) => {
        if (debug)
          console.debug(
            'IContentRenderer.loadType => Loaded component: ',
            componentName,
            component ? 'success' : 'failed',
            component?.displayName || 'Unnamed / no component',
          );
        if (!isCancelled) setComponentAvailable(component ? true : false);
      });
    } else setComponentAvailable(true);
    return () => {
      isCancelled = true;
    };
  }, [componentName, componentLoader, props.data, debug]);

  if (!componentAvailable) return <Spinner />;

  const IContentComponent = componentLoader.getPreLoadedType<ComponentProps<IContent>>(componentName, false);
  if (!IContentComponent) return <Spinner />;

  if (debug) console.debug('IContentRenderer.render => Component & IContent: ', componentName, props.data);
  return (
    <EpiComponentErrorBoundary componentName={componentName || 'Error resolving component'}>
      <IContentComponent
        data={props.data}
        contentLink={props.data.contentLink}
        path={path || ''}
        context={context}
        actionName={props.actionName}
        actionData={props.actionData}
        columns={props.columns}
        layoutWidth={props.layoutWidth}
        inLayoutBlock={props.inLayoutBlock}
        epiBlockId={props.epiBlockId}
      />
    </EpiComponentErrorBoundary>
  );
};
IContentRenderer.displayName = 'Optimizely CMS: IContent renderer';

export default EpiComponent;

//#region Internal methods for the Episerver CMS Component
/**
 * Create the name of the React Component to load for this EpiComponent
 *
 * @param item The IContent to be presented by this EpiComponent
 */
export const buildComponentName: (item: IContent | null, contentType?: string) => string = (item, contentType) => {
  const context: string = contentType || '';
  const iContentType = item?.contentType || ['Error', 'ContentNotPresent'];
  let baseName = iContentType.map((s) => StringUtils.SafeModelName(s)).join('/');
  if (context && context !== iContentType[0]) {
    baseName = context + '/' + baseName;
  }
  return `app/Components/${baseName}`;
};
//#endregion

//#region Error boundary
type EpiComponentErrorBoundaryProps = React.PropsWithChildren<{
  componentName: string;
}>;
class EpiComponentErrorBoundary extends React.Component<EpiComponentErrorBoundaryProps, { hasError: boolean }> {
  static displayName = 'Optimizely CMS: IContent Error Boundary';

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  constructor(props: EpiComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('EpiComponent caught error', error, errorInfo);
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="alert alert-danger">
          Uncaught error in <span>{this.props.componentName}</span>
        </div>
      );
    }

    return this.props.children;
  }
}
//#endregion
