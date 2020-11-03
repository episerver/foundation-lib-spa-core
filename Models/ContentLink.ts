import IContent from './IContent';
import EpiContext from '../Spa';

export type ContentReference = IContent | ContentLink | string;
export type ContentApiId = string;

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
   *
   * @param ref The content reference to generate the API-ID for.
   */
  public static createApiId(ref: ContentReference, preferGuid: boolean = false): ContentApiId {
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

  protected static getUrlFromLink(link: ContentLink) {
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

/**
 * Describe a content-link item as returned by the Episerver
 * Content Delivery API.
 */
export default interface ContentLink {
  id: number;
  workId?: number;
  guidValue: string;
  providerName?: string;
  url: string;
  expanded?: IContent;
}
