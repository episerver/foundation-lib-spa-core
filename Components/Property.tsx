import React, { HTMLAttributes, AnchorHTMLAttributes, ReactElement } from 'react';
import IContentProperty, { ContentReferenceProperty, ContentAreaProperty } from '../Property';
import IContent from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
import { ContentLinkService } from '../Models/ContentLink';
import EpiComponent from './EpiComponent';
import ContentArea from './ContentArea';
import { useEpiserver } from '../Hooks/Context';

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

export function Property<T extends IContent>(props: React.PropsWithChildren<PropertyProps<T>>) : ReactElement<unknown> | null
{
    const ctx = useEpiserver();
    if (!hasProperty(props.iContent, props.field.toString())) {
        return ctx.isDebugActive() ? <div>Property <span>{ props.field }</span> not present</div> : null;
    }
    const prop = getProperty(props.iContent, props.field);
    const propType = isIContentProperty(prop) ? prop.propertyDataType : typeof(prop);
    let stringValue : string;
    switch (propType) {
        case 'string':
            return isEditable(props.iContent, ctx) ? <span className={props.className} data-epi-edit={ props.field }>{ prop }</span> : (props.className ? <span className={ props.className }>{ prop }</span> : <>{ prop }</>);
        case 'PropertyString':
        case 'PropertyLongString':
            stringValue = isIContentProperty(prop) ? (prop as IContentProperty<string>).value : '';
            return isEditable(props.iContent, ctx) ? <span className={props.className} data-epi-edit={ props.field }>{ stringValue }</span> : (props.className ? <span className={ props.className }>{ stringValue }</span> : <>{ stringValue}</>);
        case 'PropertyUrl': 
            {
                const propUrlValue = isIContentProperty(prop) ? (prop as IContentProperty<string>).value : '';
                const propUrlprops : AnchorHTMLAttributes<HTMLAnchorElement> & {"data-epi-edit"?: string} = {
                    className: props.className,
                    href: propUrlValue,
                    children: props.children || propUrlValue
                };
                if (isEditable(props.iContent, ctx)) {
                    propUrlprops['data-epi-edit'] = props.field as string;
                }
                return React.createElement('a', propUrlprops);
            }
        case 'PropertyDecimal':
        case 'PropertyNumber':
        case 'PropertyFloatNumber':
            {
                const propNumberValue : number = isIContentProperty(prop) ? (prop as IContentProperty<number>).value : 0;
                const className = `number ${props.className}`;
                return isEditable(props.iContent, ctx) ? <span className={ className } data-epi-edit={ props.field }>{ propNumberValue }</span> : <span className={ className }>{ propNumberValue }</span>;
            }
        case 'PropertyXhtmlString':
            stringValue = isIContentProperty(prop) ? (prop as IContentProperty<string>).value : '';
            return isEditable(props.iContent, ctx) ? <div className={props.className} data-epi-edit={ props.field } dangerouslySetInnerHTML={ {__html: stringValue} }></div> : <div suppressHydrationWarning={true} className={ props.className } dangerouslySetInnerHTML={ {__html: stringValue} } />;
        case 'PropertyContentReference':
        case 'PropertyPageReference':
            {
                let item : React.ReactElement | null = null;
                if (isIContentProperty(prop)) {
                    const link = (prop as ContentReferenceProperty).value;
                    const expValue = (prop as ContentReferenceProperty).expandedValue;
                    item = <EpiComponent contentLink={link} expandedValue={expValue} className={props.className} />
                }
                return isEditable(props.iContent, ctx) ? <div data-epi-edit={ props.field }>{ item }</div> : item;
            }
        case 'PropertyContentArea':
            if (isIContentProperty(prop)) return isEditable(props.iContent, ctx) ? 
                <ContentArea data={ prop as ContentAreaProperty} propertyName={ props.field as string } /> :
                <ContentArea data={ prop as ContentAreaProperty} />;
            return null;
    }
    return ctx.isDebugActive() ? <div className="alert alert-warning">Property type <span>{ propType }</span> not supported</div> : null;
}
export default Property;

function hasProperty(iContent: IContent, field: string) : boolean
{
    return (iContent as Record<string, unknown>)[field] ? true : false;
}
function getProperty<T extends IContent, K extends keyof T>(iContent: T, field: K) : T[K] | null
{
    if (hasProperty(iContent, field as string)) {
        return iContent[field];
    }
    return null;
}
function isIContentProperty(p: unknown): p is IContentProperty<unknown>
{
    if (p && (p as IContentProperty<unknown>).propertyDataType && typeof((p as IContentProperty<unknown>).propertyDataType) === 'string') {
        return true;
    }
    return false;
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

