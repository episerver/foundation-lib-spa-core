import ActionResponse from './ActionResponse';
import IContent from '../Models/IContent';

export type PathResponse<T = unknown, C extends IContent = IContent> = C | ActionResponse<T, C>;

export function PathResponseIsIContent(iContent: PathResponse): iContent is IContent {
    if ((iContent as ActionResponse<unknown>).actionName) {
        return false;
    }
    return true;
}
export function PathResponseIsActionResponse<P = unknown>(actionResponse: PathResponse): actionResponse is ActionResponse<P>
{
    if ((actionResponse as ActionResponse<P>).actionName) {
        return true;
    }
    return false;
}
export function getIContentFromPathResponse<IContentType extends IContent = IContent>(response: PathResponse<any, IContentType>) : IContentType | null
{
    if (PathResponseIsActionResponse(response)) {
        return response.currentContent;
    }
    if (PathResponseIsIContent(response)) {
        return response;
    }
    return null;
}

export default PathResponse;