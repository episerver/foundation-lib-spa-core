"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIContentFromPathResponse = exports.PathResponseIsActionResponse = exports.PathResponseIsIContent = void 0;
function PathResponseIsIContent(iContent) {
    if (iContent.actionName) {
        return false;
    }
    return true;
}
exports.PathResponseIsIContent = PathResponseIsIContent;
function PathResponseIsActionResponse(actionResponse) {
    if (actionResponse.actionName) {
        return true;
    }
    return false;
}
exports.PathResponseIsActionResponse = PathResponseIsActionResponse;
function getIContentFromPathResponse(response) {
    if (PathResponseIsActionResponse(response)) {
        return response.currentContent;
    }
    if (PathResponseIsIContent(response)) {
        return response;
    }
    return null;
}
exports.getIContentFromPathResponse = getIContentFromPathResponse;
//# sourceMappingURL=PathResponse.js.map