import IContent from './IContent';
import EpiContext from '../Spa';

export type ContentReference = IContent | ContentLink | string
export type ContentApiId = string

/**
 * Describe a content-link item as returned by the Episerver
 * Content Delivery API.
 */
export type ContentLink = {
  id: number;
  workId?: number;
  guidValue: string;
  providerName?: string;
  url: string;
  expanded?: IContent;
}

export class ContentLinkService {
  private constructor() {
    // Just here to prevent instances
  }

  public static referenceIsIContent(ref: ContentReference): ref is IContent {
    return (ref && (ref as IContent).contentType && (ref as IContent).name) ? true : false;
  }

  public static referenceIsContentLink(ref: ContentReference): ref is ContentLink {
    return ref && (
        ((ref as ContentLink).guidValue && typeof (ref as ContentLink).guidValue === 'string') ||
        ((ref as ContentLink).id        && typeof (ref as ContentLink).id === 'number')
      ) ? true : false;
  }

  public static referenceIsString(ref: ContentReference): ref is string {
    return ref && (ref as string).trim ? true : false;
  }

    /**
     * Generate a - language aware - identifier for a given content reference. When the language is mandatory when the reference is
     * a string or ContentLink, and ignored when the reference is iContent.
     *
     * @param { ContentReference }  ref           The content reference to generate the API-ID for
     * @param { string }            languageCode  The language code to use, if the reference is not iContent
     * @param { boolean }           editModeId    If set, get the identifier, including work-id to load a specific version of the content
     * @returns { ContentApiId }
     */
    public static createLanguageId(reference: ContentReference, languageCode?: string, editModeId = false) : ContentApiId 
    {
        const baseId = this.createApiId(reference, false, editModeId);

        if (this.referenceIsIContent(reference) && reference.language?.name)
            return `${ baseId }___${ reference.language.name }`;

        if (!languageCode)
            throw new Error('Reference is not translatable iContent and no languageCode specified!');

        return `${ baseId }___${ languageCode }`;
    }

  /**
   * Generate a ContentDeliveryAPI Compliant identifier for a given content reference.
   *
   * @param { ContentReference }  ref         The content reference to generate the API-ID for
   * @param { boolean }           preferGuid  If set, prefer to receive the GUID as api identifier
   * @param { boolean }           editModeId  If set, get the identifier, including work-id to load a specific version of the content
   * @returns { ContentApiId }
   */
  public static createApiId(ref: ContentReference, preferGuid = false, editModeId = false): ContentApiId {
    if (this.referenceIsString(ref)) {
      return ref;
    }
    let link: ContentLink | null = null;
    if (this.referenceIsIContent(ref)) {
      link = ref.contentLink;
    }
    if (this.referenceIsContentLink(ref)) {
      link = ref;
    }
    if (link) {
      if ((preferGuid && link.guidValue) || !link.id) {
        return link.guidValue
      } else {
        let out: string = link.id.toString();
        if (editModeId && link.workId) {
          out = `${out}_${link.workId}`;
        }
        if (link.providerName) {
          out = `${out}__${link.providerName}`;
        }
        return out;
      }
    }
    throw new Error('Unable to generate an Episerver API ID');
  }

  public static createRoute(ref: ContentReference): string | null {
    let link : ContentLink | null = null;
    if (this.referenceIsIContent(ref)) {
      link = ref.contentLink;
    } else if (this.referenceIsContentLink(ref)) {
      link = ref;
    }
    if (!link) return null;
    return link.url || null
  } 

  public static createHref(ref: ContentReference): string | null {
    if (this.referenceIsIContent(ref)) {
      const path = this.getUrlFromLink(ref.contentLink);
      if (!path && ref.url) {
        return ref.url;
      }
      return path;
    }

    if (this.referenceIsContentLink(ref)) {
      return this.getUrlFromLink(ref);
    }

    return null;
  }

  protected static getUrlFromLink(link: ContentLink):string {
    let linkUrl = link.url || '';
    if (linkUrl.substr(0, 1) === '/') {
      // Absolute URL
      const basePath: string = EpiContext.config().basePath;
      linkUrl = linkUrl.substr(1);
      return basePath.substr(-1) === '/' ? basePath + linkUrl : basePath + '/' + linkUrl;
    } else {
      return linkUrl;
    }
  }
}

export default ContentLink