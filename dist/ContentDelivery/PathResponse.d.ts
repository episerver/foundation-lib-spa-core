import ActionResponse from './ActionResponse';
import IContent from '../Models/IContent';
export declare type PathResponse<T = unknown, C extends IContent = IContent> = C | ActionResponse<T, C>;
export declare function PathResponseIsIContent(iContent: PathResponse): iContent is IContent;
export declare function PathResponseIsActionResponse<P = unknown>(actionResponse: PathResponse): actionResponse is ActionResponse<P>;
export declare function getIContentFromPathResponse<IContentType extends IContent = IContent>(response: PathResponse<any, IContentType>): IContentType | null;
export default PathResponse;
