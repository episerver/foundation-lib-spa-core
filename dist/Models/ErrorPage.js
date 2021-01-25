export default class ErrorPage {
    constructor(code, info) {
        this.name = `${code}: ${info}`;
        this.contentType = ['errors', code.toString()];
        this.contentLink = {
            guidValue: '',
            id: code,
            providerName: 'ErrorPages',
            url: '',
            workId: 0
        };
    }
    static get Error404() {
        return new ErrorPage(404, 'Page not found');
    }
    static get Error500() {
        return new ErrorPage(500, 'Unkown server error');
    }
}
