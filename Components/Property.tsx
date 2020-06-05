import React, { Component, ReactNode, ReactNodeArray, HTMLAttributes, HTMLProps, AnchorHTMLAttributes } from 'react';
import IContentProperty, { ContentReferenceProperty, ContentAreaProperty } from '../Property';
import IContent, { IContentData, GenericProperty} from '../Models/IContent';
import IEpiserverContext from '../Core/IEpiserverContext';
import { ContentLinkService } from '../Models/ContentLink';
import CmsComponent from './CmsComponent';
import ContentArea from './ContentArea';

export interface PropertyProps<T extends IContent> extends HTMLAttributes<HTMLElement>
{
    iContent: T
    field: keyof T
    context: IEpiserverContext
    className?: string
}

export default class Property<T extends IContent> extends Component<PropertyProps<T>>
{
    protected hasProperty(): boolean
    {
        return this.props.iContent[this.props.field] ? true : false;
    }

    protected getProperty() : GenericProperty
    {
        if (this.hasProperty()) {
            return this.props.iContent[this.props.field] as unknown as GenericProperty;
        }
        return null;
    }

    protected isIContentProperty(p: GenericProperty): p is IContentProperty<any>
    {
        if (p && (p as IContentProperty<any>).propertyDataType && typeof((p as IContentProperty<any>).propertyDataType) === 'string') {
            return true;
        }
        return false;
    }

    public render() : ReactNode | ReactNodeArray | null
    {
        if (!this.hasProperty()) {
            return this.props.context.isDebugActive() ? <div>Property <span>{ this.props.field }</span> not present</div> : null;
        }
        const prop = this.getProperty();
        const propType = this.isIContentProperty(prop) ? prop.propertyDataType : typeof(prop);
        let stringValue : string;
        switch (propType) {
            case 'string':
                return this.isEditable() ? <span className={this.props.className} data-epi-edit={ this.props.field }>{ prop }</span> : (this.props.className ? <span className={ this.props.className }>{ prop }</span> : prop);
            case 'PropertyString':
            case 'PropertyLongString':
                stringValue = (prop as IContentProperty<string>).value;
                return this.isEditable() ? <span className={this.props.className} data-epi-edit={ this.props.field }>{ stringValue }</span> : (this.props.className ? <span className={ this.props.className }>{ stringValue }</span> : stringValue);
            case 'PropertyUrl':
                const propUrlValue = (prop as IContentProperty<string>).value;
                const props : AnchorHTMLAttributes<HTMLAnchorElement> = {
                    className: this.props.className,
                    href: propUrlValue,
                    children: this.props.children || propUrlValue
                };
                if (this.isEditable()) {
                    (props as any)['data-epi-edit'] = this.props.field;
                }
                return React.createElement('a', props);
            case 'PropertyDecimal':
            case 'PropertyNumber':
            case 'PropertyFloatNumber':
                const propNumberValue : number = (prop as IContentProperty<number>).value;
                const className : string = `number ${this.props.className}`;
                return this.isEditable() ? <span className={ className } data-epi-edit={ this.props.field }>{ propNumberValue }</span> : <span className={ className }>{ propNumberValue }</span>;
            case 'PropertyXhtmlString':
                stringValue = (prop as IContentProperty<string>).value;
                return this.isEditable() ? <div className={this.props.className} data-epi-edit={ this.props.field } dangerouslySetInnerHTML={ {__html: stringValue} }></div> : <div className={ this.props.className } dangerouslySetInnerHTML={ {__html: stringValue} } />;
            case 'PropertyContentReference':
            case 'PropertyPageReference':
                const link = (prop as ContentReferenceProperty).value;
                const expValue = (prop as ContentReferenceProperty).expandedValue;
                const item = <CmsComponent contentLink={link} expandedValue={expValue} context={this.props.context} className={this.props.className} />
                return this.isEditable() ? <div data-epi-edit={ this.props.field }>{item}</div> : item;
            case 'PropertyContentArea':
                return this.isEditable() ? 
                    <ContentArea data={ prop as ContentAreaProperty} context={ this.props.context } propertyName={ this.props.field as string } /> :
                    <ContentArea data={ prop as ContentAreaProperty} context={ this.props.context } />;
        }
        return this.props.context.isDebugActive() ? <div className="alert alert-warning">Property type <span>{ propType }</span> not supported</div> : null;
    }

    /**
     * Helper method to ensure properties are only editable on the page/content they belong 
     * to, this is used to ensure properties from a StartPage are only made editable when the
     * current page is the StartPage.
     * 
     * Edit mode does not use SPA Routing, thus updating properties is not a main concern
     */
    protected isEditable() : boolean
    {
        if (!this.props.context.isEditable()) return false;

        const routedContent = this.props.context.getRoutedContent();
        const routedContentId = ContentLinkService.createApiId(routedContent.contentLink);
        const myContentId = ContentLinkService.createApiId(this.props.iContent.contentLink);
        return routedContentId === myContentId;
    }
}