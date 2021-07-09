import Property, { StringProperty } from '../Property';
import ContentLink from './ContentLink';
import ContentTypePath from './ContentTypePath';
import Language from './Language';
import LanguageList from './LanguageList';
import { IContentDeliveryResponseContext } from '../ContentDelivery/IContentDeliveryAPI';
import { isArray } from '../Util/ArrayUtils';

export type IContent = {
  contentLink: ContentLink
  name: StringProperty
  language?: Language
  existingLanguages?: LanguageList
  masterLanguage?: Language
  contentType: ContentTypePath
  parentLink?: ContentLink
  routeSegment?: string | null
  url?: string | null
  changed?: string | null
  created?: string | null
  startPublish?: string | null
  stopPublish?: string | null
  saved?: string | null
  status?: string | null
  serverContext ?: Property<IContentDeliveryResponseContext>
}

/**
 * Test to see if a value is of type IContent, which is considered to be
 * the case if - and only if - the following criteria are satisfied:
 * - The parameter is an object
 * - With a property contentType that is a non-empty array of strings
 * - With a property contentLink that is an object that has either a non
 *      empty "guid" or non empty "id" property
 * 
 * @param       toTest      The value to be tested
 * @returns     True if the value is IContent or false otherwise
 */
export const isIContent : (toTest: unknown) => toTest is IContent = (toTest) : toTest is IContent =>
{
    if (typeof(toTest) != "object") return false;
    if (!isArray((toTest as IContent).contentType, (x) : x is string => typeof(x) == 'string' ) || (toTest as IContent).contentType.length == 0)
        return false;
    if (typeof((toTest as IContent).contentLink) != "object") 
        return false;
    if (!((toTest as IContent).contentLink.guidValue || (toTest as IContent).contentLink.id))
        return false;
    return true;
}

export type IContentData = IContent & Record<string, Property<unknown>>;

export abstract class BaseIContent<T extends IContent = IContent> implements IContent {
  public get contentLink() : T["contentLink"] { return this.getProperty("contentLink"); }
  public get name() : T["name"] { return this.getProperty("name"); }
  public get language() : T["language"] { return this.getProperty("language"); }
  public get existingLanguages() : T["existingLanguages"] { return this.getProperty("existingLanguages"); }
  public get masterLanguage() : T["masterLanguage"] { return this.getProperty("masterLanguage"); }
  public get contentType() : T["contentType"] { return this.getProperty("contentType"); }
  public get parentLink() : T["parentLink"] { return this.getProperty("parentLink"); }
  public get routeSegment() : T["routeSegment"] { return this.getProperty("routeSegment"); }
  public get url() : T["url"] { return this.getProperty("url"); }
  public get changed() : T["changed"] { return this.getProperty("changed"); }
  public get created() : T["created"] { return this.getProperty("created"); }
  public get startPublish() : T["startPublish"] { return this.getProperty("startPublish"); }
  public get stopPublish() : T["stopPublish"] { return this.getProperty("stopPublish"); }
  public get saved() : T["saved"] { return this.getProperty("saved"); }
  public get status() : T["status"] { return this.getProperty("status"); }

  protected abstract _typeName: string;
  protected abstract _propertyMap: { [propName: string]: string };
  protected _serverData : T;

  public constructor(baseData: T) {
    this._serverData = baseData;
  }

  public get typeName(): string {
    return this._typeName;
  }

  public getTypeName(): string {
    return this._typeName;
  }

  public getProperty<K extends keyof T>(prop: K): T[K] {
    return this._serverData[prop];
  }

  public getPropertyType<K extends keyof T>(prop: K): string {
    return this._propertyMap[prop.toString()];
  }
}

/**
 * Static definition for the IContent instance class, so that
 * it can be autoloaded using strong typing using TypeScript.
 */
export type IContentType = new <T extends IContent>(baseData: T) => BaseIContent<T>;

export default IContent;