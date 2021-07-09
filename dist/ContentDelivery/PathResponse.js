export function PathResponseIsIContent(iContent) {
    if (iContent.actionName) {
        return false;
    }
    return true;
}
export function PathResponseIsActionResponse(actionResponse) {
    if (actionResponse.actionName) {
        return true;
    }
    return false;
}
export function getIContentFromPathResponse(response) {
    if (PathResponseIsActionResponse(response)) {
        return response.currentContent;
    }
    if (PathResponseIsIContent(response)) {
        return response;
    }
    return null;
}
//# sourceMappingURL=PathResponse.js.map