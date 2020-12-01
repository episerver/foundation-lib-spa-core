import React, { HTMLAttributes, AnchorHTMLAttributes, PropsWithChildren, FunctionComponent, ReactElement } from 'react';
import IContentProperty, { ContentReferenceProperty, ContentAreaProperty } from '../Property';
import IContent, { GenericProperty} from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
import { ContentLinkService } from '../Models/ContentLink';
import EpiComponent, { EpiComponentType } from './EpiComponent';
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

export function Property<T extends IContent>(props: PropsWithChildren<PropertyProps<T>>) : ReactElement<any, any> | null
{
    const ctx = useEpiserver();
    if (!hasProperty(props.iContent, props.field.toString())) {
        return ctx.isDebugActive() ? <div>Property <span>{ props.field }</span> not present</div> : null;
    }
    const prop = getProperty(props.iContent, props.field.toString());
    const propType = isIContentProperty(prop) ? prop.propertyDataType : typeof(prop);
    let stringValue : string;
    switch (propType) {
        case 'string':
    return isEditable(props.iContent, ctx) ? <span className={props.className} data-epi-edit={ props.field }>{ prop }</span> : (props.className ? <span className={ props.className }>{ prop }</span> : <>{ prop }</>);
        case 'PropertyString':
        case 'PropertyLongString':
            stringValue = (prop as IContentProperty<string>).value;
            return isEditable(props.iContent, ctx) ? <span className={props.className} data-epi-edit={ props.field }>{ stringValue }</span> : (props.className ? <span className={ props.className }>{ stringValue }</span> : <>{ stringValue}</>);
        case 'PropertyUrl':
            const propUrlValue = (prop as IContentProperty<string>).value;
            const propUrlprops : AnchorHTMLAttributes<HTMLAnchorElement> = {
                className: props.className,
                href: propUrlValue,
                children: props.children || propUrlValue
            };
            if (isEditable(props.iContent, ctx)) {
                (propUrlprops as any)['data-epi-edit'] = props.field;
            }
            return React.createElement('a', propUrlprops);
        case 'PropertyDecimal':
        case 'PropertyNumber':
        case 'PropertyFloatNumber':
            const propNumberValue : number = (prop as IContentProperty<number>).value;
            const className : string = `number ${props.className}`;
            return isEditable(props.iContent, ctx) ? <span className={ className } data-epi-edit={ props.field }>{ propNumberValue }</span> : <span className={ className }>{ propNumberValue }</span>;
        case 'PropertyXhtmlString':
            stringValue = (prop as IContentProperty<string>).value;
            return isEditable(props.iContent, ctx) ? <div className={props.className} data-epi-edit={ props.field } dangerouslySetInnerHTML={ {__html: stringValue} }></div> : <div className={ props.className } dangerouslySetInnerHTML={ {__html: stringValue} } />;
        case 'PropertyContentReference':
        case 'PropertyPageReference':
            const link = (prop as ContentReferenceProperty).value;
            const expValue = (prop as ContentReferenceProperty).expandedValue;
            const ConnectedEpiComponent : EpiComponentType = EpiComponent.CreateComponent(ctx);
            const item = <ConnectedEpiComponent contentLink={link} expandedValue={expValue} context={props.context} className={props.className} />
            return isEditable(props.iContent, ctx) ? <div data-epi-edit={ props.field }>{item}</div> : item;
        case 'PropertyContentArea':
            return isEditable(props.iContent, ctx) ? 
                <ContentArea data={ prop as ContentAreaProperty} context={ ctx } propertyName={ props.field as string } /> :
                <ContentArea data={ prop as ContentAreaProperty} context={ ctx } />;
    }
    return ctx.isDebugActive() ? <div className="alert alert-warning">Property type <span>{ propType }</span> not supported</div> : null;
}
export default Property;

function hasProperty(iContent: IContent, field: string) : boolean
{
    return (iContent as any)[field] ? true : false;
}
function getProperty(iContent: IContent, field: string) : GenericProperty
{
    if (hasProperty(iContent, field)) {
        return (iContent as any)[field] as unknown as GenericProperty;
    }
    return null;
}
function isIContentProperty(p: GenericProperty): p is IContentProperty<any>
{
    if (p && (p as IContentProperty<any>).propertyDataType && typeof((p as IContentProperty<any>).propertyDataType) === 'string') {
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

