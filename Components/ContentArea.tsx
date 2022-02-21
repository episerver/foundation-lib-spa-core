import React from 'react';
import IEpiserverContext from '../Core/IEpiserverContext';
import { useEpiserver } from '../Hooks/Context';
import { ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import { ContentAreaProperty, ContentAreaPropertyItem } from '../Property';
import EpiComponent from './EpiComponent';

export type ContentAreaSiteConfig = {
  /**
   * The bindings between the display options and CSS classes to apply
   *
   * @default []
   */
  displayOptions?: {
    [displayOption: string]: string;
  };

  /**
   * Default CSS class to be added when rendering a block, defaults to "col"
   *
   * @default "col"
   */
  defaultBlockClass?: string;

  /**
   * Default CSS class to be added when rendering a row, defaults to "row"
   *
   * @default "row"
   */
  defaultRowClass?: string;

  /**
   * Default CSS class to be added to a container, defaults to "container"
   *
   * @default "container"
   */
  defaultContainerClass?: string;

  /**
   * If this class specified here is applied to a block, it'll cause the container
   * to break to enable going full width. For the logic to work this class must be
   * set by one of the display options
   *
   * @see ContentAreaSiteConfig.displayOptions
   * @default undefined
   */
  containerBreakBlockClass?: string;

  /**
   * Set the type of component for the items within this area, this gets passed to the
   * contentType attribute of the EpiComponent. The EpiComponent will prefix the reported
   * type from Episerver with this value, if it does not start with this value already.
   *
   * @default "Block"
   */
  itemContentType?: string;

  /**
   * If set to "true", the components will not be wrapped in div elements and directly
   * outputted.
   *
   * @default false
   */
  noWrap?: boolean;

  /**
   * If set to "true", the components will also be wrapped in a container div, defaulting
   * to the bootstrap "container"-class. If noWrap has been set to true, setting this has
   * no effect.
   *
   * @default false
   */
  addContainer?: boolean;

  /**
   * The class to be set on the outer-most wrapper, if any.
   *
   * @default "content-area"
   */
  wrapperClass?: string;

  /**
   * The columns from the layout block
   *
   * @default 12
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
};

export type ContentAreaProps = ContentAreaSiteConfig & {
  /**
   * The ContentArea property from the IContent, which must be rendered by this
   * component.
   */
  data: ContentAreaProperty;

  /**
   * The Episerver Context used for rendering the ContentArea
   *
   * @deprecated
   */
  context?: IEpiserverContext;

  /**
   * The name of the ContentArea property, if set this enables On Page Editing for
   * the content-area.
   */
  propertyName?: string;
};

export const ContentArea: React.FunctionComponent<ContentAreaProps> = (props) => {
  const ctx = useEpiserver();

  // Check if the areay is empty
  if (!props.data?.value)
    return props.children ? <div>{props.children}</div> : <DefaultEmptyContentArea propertyName={props.propertyName} />;

  // Build the configuration
  const globalConfig = ctx.config()?.contentArea || {};
  const config: ContentAreaSiteConfig = { ...globalConfig, ...props };
  const wrapperClass = getConfigValue(config, 'wrapperClass', 'content-area');

  // Render the items
  const items: React.ReactElement<ContentAreaItemProps>[] = [];
  (props.data?.value || []).forEach((x, i) => {
    const className = getBlockClasses(x.displayOption, config).join(' ');
    const blockKey = `ContentAreaItem-${ContentLinkService.createApiId(x.contentLink, true, false)}-${i}`;
    items.push(
      <ContentAreaItem
        key={blockKey}
        item={x}
        config={config}
        idx={i}
        className={className}
        expandedValue={props.data?.expandedValue ? props.data?.expandedValue[i] : undefined}
        columns={props.columns || 12}
        layoutWidth={props.layoutWidth}
        inLayoutBlock={props.inLayoutBlock}
      />,
    );
  });

  // Return if no wrapping
  if (getConfigValue(config, 'noWrap', false) === true)
    return ctx.isEditable() ? (
      <div className={wrapperClass} data-epi-edit={props.propertyName}>
        {items}
      </div>
    ) : (
      <React.Fragment>{items}</React.Fragment>
    );

  // If there's no container, just output the row
  const rowClass = getConfigValue(config, 'defaultRowClass', 'row');
  if (!getConfigValue(config, 'addContainer', false))
    return ctx.isEditable() ? (
      <div className={`${wrapperClass} ${rowClass}`} data-epi-edit={props.propertyName}>
        {items}
      </div>
    ) : (
      <div className={rowClass}>{items}</div>
    );

  // Prepare rendering the container
  const containerBreakBlockClass = getConfigValue(config, 'containerBreakBlockClass');
  const containerClass = getConfigValue(config, 'defaultContainerClass', 'container');

  // Output if there's no breaking block class defined
  if (!containerBreakBlockClass)
    return (
      <div className={`${wrapperClass} ${containerClass}`}>
        <div className={rowClass} data-epi-edit={ctx.isEditable() ? props.propertyName : undefined}>
          {items}
        </div>
      </div>
    );

  // Split the items into containers
  const containers: { items: React.ReactElement[]; shouldWrap: boolean }[] = [];
  let currentContainerId = 0;
  items.forEach((item) => {
    const cssClasses = (item.props.className || '').split(' ').filter((s) => s.length > 0);
    containers[currentContainerId] = containers[currentContainerId] || { items: [], shouldWrap: true };

    if (cssClasses.indexOf(containerBreakBlockClass) >= 0) {
      // Move to next container if not empty
      if (containers[currentContainerId] && containers[currentContainerId].items.length > 0)
        containers[++currentContainerId] = { items: [], shouldWrap: false };

      // Add item
      containers[currentContainerId].shouldWrap = false;
      containers[currentContainerId].items.push(item);

      // Move to next
      currentContainerId++;
    } else {
      containers[currentContainerId].items.push(item);
    }
  });

  // Render containers
  const rendered = containers.map((container, idx) => {
    const containerId = `ContentArea-${props.propertyName}-Container-${idx}`;
    if (!container.shouldWrap && container.items.length === 1) return container.items[0];
    if (container.items.length === 0) return null;
    return (
      <div className={containerClass} key={containerId}>
        <div className={rowClass}>{container.items}</div>
      </div>
    );
  });

  // Output HTML
  return (
    <div className={wrapperClass} data-epi-edit={ctx.isEditable() ? props.propertyName : undefined}>
      {rendered}
    </div>
  );
};
ContentArea.displayName = 'Optimizely CMS: Content Area';
export default ContentArea;

/**
 * A type-checked method that reads a value from the configuration, eliminating the "undefined" value option when
 * a default value has been provided for an optional configuration key.
 *
 * @param config        The configuration object, created by merging the global and instance configuration
 * @param key           The configuration key to read
 * @param defaultValue  The default value
 * @returns             The configured or default value
 */
function getConfigValue<T extends ContentAreaSiteConfig, K extends keyof T, D extends Required<T>[K] | undefined>(
  config: T,
  key: K,
  defaultValue?: D,
): D extends undefined ? T[K] : Required<T>[K] {
  return (config[key] || defaultValue) as D extends undefined ? T[K] : Required<T>[K];
}

function getBlockClasses(displayOption: string, config: ContentAreaSiteConfig): string[] {
  const cssClasses: string[] = ['block'];
  const displayOptions = getConfigValue(config, 'displayOptions', {});
  cssClasses.push(
    displayOptions[displayOption] ? displayOptions[displayOption] : getConfigValue(config, 'defaultBlockClass', 'col'),
  );
  return cssClasses.filter((x) => x);
}

// Helper component for ContentAreaItem
type ContentAreaItemProps = {
  item: ContentAreaPropertyItem;
  config: ContentAreaSiteConfig;
  expandedValue?: IContent;
  className?: string;
  idx?: number;
  columns?: number;
  layoutWidth?: string;
  inLayoutBlock?: boolean;
};
const ContentAreaItem: React.FunctionComponent<ContentAreaItemProps> = (props) => {
  // Context
  const ctx = useEpiserver();

  // Build component
  const componentType = getConfigValue(props.config, 'itemContentType', 'Block');
  const blockId = ContentLinkService.createApiId(props.item.contentLink, false, true);
  const component = (
    <EpiComponent
      contentLink={props.item.contentLink}
      contentType={componentType}
      key={props.item.contentLink.guidValue}
      expandedValue={props.expandedValue}
      columns={props.columns}
      layoutWidth={props.layoutWidth}
      inLayoutBlock={props.inLayoutBlock}
      epiBlockId={blockId}
    />
  );

  // Return if no wrapping
  if (getConfigValue(props.config, 'noWrap', false) === true)
    return ctx.isEditable() ? <div data-epi-block-id={blockId}>{component}</div> : component;

  // Build wrapper element
  const displayOption: string = props.item.displayOption || 'default';
  const wrapperProps: any = {
    'data-displayoption': displayOption,
    'data-tag': props.item.tag,
    className: props.className,
    children: component,
  };
  if (ctx.isEditable()) wrapperProps['data-epi-block-id'] = blockId;
  return component;
};
ContentAreaItem.displayName = 'Optimizely CMS: Content Area Item';

/**
 * Render and empty Content Area
 *
 * @param props The properties for the empty ContentArea renderer
 */
const DefaultEmptyContentArea: React.FunctionComponent<{ propertyName?: string }> = (props) => {
  const ctx = useEpiserver();
  if (ctx.isEditable())
    return (
      <div data-epi-edit={props.propertyName}>
        <div className="alert alert-info m-5">
          There're no blocks in <i>{props.propertyName || 'this area'}</i>
        </div>
      </div>
    );
  return null;
};
DefaultEmptyContentArea.displayName = 'Optimizely CMS: Empty Content Area';
