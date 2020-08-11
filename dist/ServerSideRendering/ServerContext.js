"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSerializedWebsite = exports.isSerializedContentLink = exports.isSerializedIContent = void 0;
function isSerializedIContent(data) {
    return typeof data == 'string';
}
exports.isSerializedIContent = isSerializedIContent;
function isSerializedContentLink(data) {
    return typeof data == 'string';
}
exports.isSerializedContentLink = isSerializedContentLink;
function isSerializedWebsite(data) {
    return typeof data == 'string';
}
exports.isSerializedWebsite = isSerializedWebsite;
