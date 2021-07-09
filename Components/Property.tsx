import React, { HTMLAttributes, AnchorHTMLAttributes, ReactElement, PropsWithChildren, createElement, useState, useEffect } from 'react';
import IContentProperty, { ContentAreaProperty, isVerboseProperty, readValue, readExpandedValue, ContentAreaPropertyValue } from '../Property';
import IContent from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
import ContentLink, { ContentLinkService } from '../Models/ContentLink';
import EpiComponent from './EpiComponent';
import ContentArea from './ContentArea';
import { useEpiserver, useIContentSchema } from '../Hooks/Context';

export type PropertyProps<T extends IContent> = HTMLAttributes<HTMLElement> &
{
    /**
     * The IContent from which a property will be rendered by this component
     * 
     * @var { T }
     */
    iContent: T

    /**
     * The property name of the property that will be rendered by this component
     * 
     * @var { string }
     */
    field: keyof T

    /**
     * The Episerver Context shouldn't be passed down, as it will be accessed through React Hooks
     * 
     * @deprecated
     * @var { IEpiserverContext }
     */
    context?: IEpiserverContext

    /**
     * The CSS class that must be applied to this property when it's rendered
     * 
     * @var { string }
     */
    className?: string
}

export function Property<T extends IContent>(props: PropsWithChildren<PropertyProps<T>>) : ReactElement<unknown> | null
{
    const ctx = useEpiserver();
    const schemaInfo = useIContentSchema();
    const prop : IContentProperty = getProperty(props.iContent, props.field);
    const [propType, setPropType] = useState<string | undefined>(
        isVerboseProperty(prop) ? 
                prop.propertyDataType : 
                schemaInfo.getProperty(schemaInfo.getTypeNameFromIContent(props.iContent) || 'Unknown', props.field)?.type
    );

    // Allow updating the property when the schema has become
    // avilable (the schema information can be loaded asynchronously)
    useEffect(() => {
        let isCancelled = false;
        const iContentType = schemaInfo.getTypeNameFromIContent(props.iContent) || 'Unknown';
        const basePropType = isVerboseProperty(prop) ? prop.propertyDataType : schemaInfo.getProperty(iContentType, props.field)?.type;
        if (basePropType)
            setPropType(basePropType);
        else {
            if (!schemaInfo.isReady)
                schemaInfo.whenReady.then(s => {
                    if (!isCancelled) {
                        const type = s.getTypeNameFromIContent(props.iContent) || 'Unknown';
                        setPropType(s.getProperty(type, props.field)?.type)
                    }
                });
            else
                setPropType(schemaInfo.getProperty(iContentType, props.field)?.type)
        }
            

        return () => { isCancelled = true }
    }, [schemaInfo, props.field, props.iContent, prop])

    // Don't continue when we don't know the property type to render
    if (!propType)
        return ctx.isDebugActive() && schemaInfo.isReady ? <div className="alert alert-warning">Property <span>{ props.field }</span> not present</div> : null;

    // Now, get the property value & expandedValue to start rendering it
    const propValue = readValue(prop);
    const expandedValue = readExpandedValue(prop as IContentProperty<ContentLink | ContentLink[] | ContentAreaPropertyValue>);
    let stringValue : string;
    switch (propType) {
        case 'string':
        case 'PropertyString':
        case 'PropertyLongString':
            stringValue = propValue as string | undefined || "";
            return isEditable(props.iContent, ctx) ? <span className={props.className} data-epi-edit={ props.field }>{ stringValue }</span> : (props.className ? <span className={ props.className }>{ stringValue }</span> : <>{ stringValue}</>);
        case 'PropertyUrl': 
            {
                const propUrlValue = propValue as string | undefined || "";
                const propUrlprops : AnchorHTMLAttributes<HTMLAnchorElement> & {"data-epi-edit"?: string} = {
                    className: props.className,
                    href: propUrlValue,
                    children: props.children || propUrlValue
                };
                if (isEditable(props.iContent, ctx)) {
                    propUrlprops['data-epi-edit'] = props.field as string;
                }
                return createElement('a', propUrlprops);
            }
        case 'PropertyDecimal':
        case 'PropertyNumber':
        case 'PropertyFloatNumber':
            {
                const propNumberValue = propValue as number | undefined || 0;
                const className = `number ${props.className}`;
                return isEditable(props.iContent, ctx) ? <span className={ className } data-epi-edit={ props.field }>{ propNumberValue }</span> : <span className={ className }>{ propNumberValue }</span>;
            }
        case 'PropertyXhtmlString':
            stringValue = propValue as string | undefined || "";
            return isEditable(props.iContent, ctx) ? <div className={props.className} data-epi-edit={ props.field } dangerouslySetInnerHTML={ {__html: stringValue} }></div> : <div suppressHydrationWarning={true} className={ props.className } dangerouslySetInnerHTML={ {__html: stringValue} } />;
        case 'PropertyContentReference':
        case 'PropertyPageReference':
            {
                let item : ReactElement | null = null;
                const link = propValue as ContentLink | undefined;
                if (link) {
                    const expValue = link.expanded || expandedValue as IContent;
                    item = <EpiComponent contentLink={link} expandedValue={expValue} className={props.className} />
                }
                return isEditable(props.iContent, ctx) ? <div data-epi-edit={ props.field }>{ item }</div> : item;
            }
        case 'PropertyContentArea':
            if (prop) return isEditable(props.iContent, ctx) ? 
                <ContentArea data={ prop as ContentAreaProperty } propertyName={ props.field as string } /> :
                <ContentArea data={ prop as ContentAreaProperty } />;
            return null;
    }
    return ctx.isDebugActive() ? <div className="alert alert-warning">Property type <span>{ propType || "UNKNOWN" }</span> not supported</div> : null;
}
Property.displayName = "Optimizely CMS: IContent Property Renderer";
export default Property;

function hasProperty(iContent: IContent, field: string) : boolean
{
    return (iContent as Record<string, IContentProperty<unknown, unknown>>)[field] ? true : false;
}
function getProperty<T extends IContent, K extends keyof T>(iContent: T, field: K) : T[K] | undefined
{
    if (hasProperty(iContent, field as string)) {
        return iContent[field];
    }
    return undefined;
}
function isEditable(iContent: IContent, ctx: IEpiserverContext) : boolean
{
    if (!ctx.isEditable()) return false;
    if (!ctx.hasRoutedContent()) return false;

    const routedContent = ctx.getRoutedContent();
    const routedContentId = ContentLinkService.createApiId(routedContent.contentLink);
    const myContentId = ContentLinkService.createApiId(iContent.contentLink);
    return routedContentId === myContentId;
}

