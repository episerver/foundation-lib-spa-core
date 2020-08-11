import IContent, { NameProperty } from './IContent';
import ContentLink from './ContentLink';
import ContentTypePath from './ContentTypePath';
export default class ErrorPage implements IContent {
    contentLink: ContentLink;
    name: NameProperty;
    contentType: ContentTypePath;
    constructor(code: number, info: string);
    static get Error404(): ErrorPage;
    static get Error500(): ErrorPage;
}
