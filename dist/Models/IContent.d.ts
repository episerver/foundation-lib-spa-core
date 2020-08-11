import Property, { StringProperty } from '../Property';
import ContentLink from './ContentLink';
import ContentTypePath from './ContentTypePath';
import Language from './Language';
import LanguageList from './LanguageList';
export declare type NameProperty = string | StringProperty;
export declare type GenericProperty = string | null | undefined | Language | LanguageList | ContentTypePath | ContentLink | Property<any>;
export declare function namePropertyIsString(prop: NameProperty): prop is string;
export default interface IContent {
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
}
export interface IContentData extends IContent {
    [name: string]: GenericProperty;
}
export declare abstract class BaseIContent<T extends IContent> implements IContent {
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
    protected abstract _typeName: string;
    protected abstract _propertyMap: {
        [propName: string]: string;
    };
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
export interface IContentType {
    new <T extends IContent>(baseData: T): BaseIContent<T>;
}
