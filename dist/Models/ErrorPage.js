"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorPage = /** @class */ (function () {
    function ErrorPage(code, info) {
        this.name = code + ": " + info;
        this.contentType = ['errors', code.toString()];
        this.contentLink = {
            guidValue: '',
            id: code,
            providerName: 'ErrorPages',
            url: '',
            workId: 0
        };
    }
    Object.defineProperty(ErrorPage, "Error404", {
        get: function () {
            return new ErrorPage(404, 'Page not found');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorPage, "Error500", {
        get: function () {
            return new ErrorPage(500, 'Unkown server error');
        },
        enumerable: false,
        configurable: true
    });
    return ErrorPage;
}());
exports.default = ErrorPage;
