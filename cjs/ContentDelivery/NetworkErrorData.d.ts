import { AxiosResponse } from 'axios';
import IContent from '../Models/IContent';
import ContentLink from '../Models/ContentLink';
import ContentTypePath from '../Models/ContentTypePath';
import Property, { StringProperty } from '../Property';
export declare function isNetworkError(content: unknown): content is NetworkErrorData;
export declare type NetworkErrorData<ErrorType = unknown, ResponseType = unknown> = IContent & {
    error: Property<ErrorType, never, "PropertyErrorMessage">;
    response?: AxiosResponse<ResponseType>;
};
export declare class NetworkErrorContent<ErrorType extends unknown = unknown, ResponseType = unknown> implements NetworkErrorData<ErrorType, ResponseType> {
    contentLink: ContentLink;
    name: StringProperty;
    contentType: ContentTypePath;
    error: Property<ErrorType, never, "PropertyErrorMessage">;
    response?: AxiosResponse<ResponseType>;
    constructor(code: number, info: string, raw: ErrorType, response?: AxiosResponse<ResponseType>, group?: string);
    static get Error404(): NetworkErrorContent<undefined>;
    static get Error500(): NetworkErrorContent<undefined>;
    static CreateFromResponse<ErrorType = unknown, ResponseType = unknown>(error: ErrorType, response: AxiosResponse<ResponseType>): NetworkErrorContent<ErrorType, ResponseType>;
    static Create<ErrorType = unknown>(error: ErrorType, code: number, info: string): NetworkErrorContent<ErrorType, unknown>;
}
export default NetworkErrorData;
