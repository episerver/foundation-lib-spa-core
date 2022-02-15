import Property, { StringProperty } from '../Property';
import ContentLink from './ContentLink';
import ContentTypePath from './ContentTypePath';
import Language from './Language';
import LanguageList from './LanguageList';
import { IContentDeliveryResponseContext } from '../ContentDelivery/IContentDeliveryAPI';
export declare type NameProperty = string | StringProperty;
export declare type GenericProperty = string | null | undefined | Language | LanguageList | ContentTypePath | ContentLink | Property<unknown>;
export declare function namePropertyIsString(prop: NameProperty): prop is string;
export declare function genericPropertyIsProperty<TData>(prop: GenericProperty): prop is Property<TData>;
export declare type IContent = {
    contentLink: ContentLink;
    name: NameProperty;
    language?: Language;
    existingLanguages?: LanguageList;
    masterLanguage?: Language;
    contentType: ContentTypePath;
    parentLink?: ContentLink;
    routeSegment?: string | null;
    url?: string | null;
    changed?: string | null;
    created?: string | null;
    startPublish?: string | null;
    stopPublish?: string | null;
    saved?: string | null;
    status?: string | null;
    serverContext?: Property<IContentDeliveryResponseContext>;
};
export default IContent;
export interface IContentData extends IContent {
    [name: string]: GenericProperty;
}
export declare abstract class BaseIContent<T extends IContent = IContent> implements IContent {
    get contentLink(): T['contentLink'];
    get name(): T['name'];
    get language(): T['language'];
    get existingLanguages(): T['existingLanguages'];
    get masterLanguage(): T['masterLanguage'];
    get contentType(): T['contentType'];
    get parentLink(): T['parentLink'];
    get routeSegment(): T['routeSegment'];
    get url(): T['url'];
    get changed(): T['changed'];
    get created(): T['created'];
    get startPublish(): T['startPublish'];
    get stopPublish(): T['stopPublish'];
    get saved(): T['saved'];
    get status(): T['status'];
    protected abstract _typeName: string;
    protected abstract _propertyMap: {
        [propName: string]: string;
    };
    protected _serverData: T;
    constructor(baseData: T);
    get typeName(): string;
    getTypeName(): string;
    getProperty<K extends keyof T>(prop: K): T[K];
    getPropertyType<K extends keyof T>(prop: K): string;
}
/**
 * Static definition for the IContent instance class, so that
 * it can be autoloaded using strong typing using TypeScript.
 */
export declare type IContentType = new <T extends IContent>(baseData: T) => BaseIContent<T>;
