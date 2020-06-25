import IContent, { NameProperty } from './IContent';
import ContentLink from './ContentLink';
import ContentTypePath from './ContentTypePath';

export default class ErrorPage implements IContent
{
    public contentLink: ContentLink;
    public name: NameProperty;
    public contentType: ContentTypePath;

    public constructor (code: number, info: string) {
        this.name = `${code}: ${info}`;
        this.contentType = ['errors', code.toString()];
        this.contentLink = {
            guidValue: '',
            id: code,
            providerName: 'ErrorPages',
            url: '',
            workId: 0
        }
    }

    public static get Error404() : ErrorPage {
        return new ErrorPage(404, 'Page not found');
    }

    public static get Error500() : ErrorPage {
        return new ErrorPage(500, 'Unkown server error');
    }
     
}