import { v4 as generateGuid } from 'uuid';
import { AxiosResponse } from 'axios';
import IContent from '../Models/IContent';
import ContentLink from '../Models/ContentLink';
import ContentTypePath from '../Models/ContentTypePath';
import Property, { StringProperty, PropertyDataType } from '../Property';

let internalErrorCounter = 100000000001;

export function isNetworkError(content: unknown) : content is NetworkErrorData
{
    try {
        if (typeof(content) !== 'object') return false;
        const typeString = (content as IContent)?.contentType?.slice(0,2).join('/') || '';
        const providerName = (content as IContent)?.contentLink?.providerName || '';
        return typeString === 'Errors/NetworkError' && providerName === 'EpiserverSPA';
    } catch (e) {
        return false;
    }
}

export type NetworkErrorData<ErrorType = unknown, ResponseType = unknown> = IContent & {
    error : Property<ErrorType, never, "PropertyErrorMessage">;
    response ?: AxiosResponse<ResponseType>
}

export class NetworkErrorContent<ErrorType extends unknown = unknown, ResponseType = unknown> implements NetworkErrorData<ErrorType, ResponseType>
{
    public contentLink: ContentLink
    public name: StringProperty
    public contentType: ContentTypePath
    public error : Property<ErrorType, never, "PropertyErrorMessage">
    public response ?: AxiosResponse<ResponseType>

    public constructor (code: number, info: string, raw: ErrorType, response?: AxiosResponse<ResponseType>, group = "NetworkError") {
        let url = '';
        try {
            url = response ? (new URL(response.config.url || '', response.config.baseURL)).href : '';
        } catch {
            //Ignore
        }

        this.name = `Error ${code}: ${info}`;
        this.contentType = ['Errors', group, code.toString()];
        this.contentLink = {
            guidValue: generateGuid(),
            id: ++internalErrorCounter,
            providerName: 'EpiserverSPA',
            url: url,
            workId: 0
        }
        this.error = {
            propertyDataType: "PropertyErrorMessage",
            value: raw
        };
        this.response = response;
    }

    public static get Error404() : NetworkErrorContent<undefined> {
        return new NetworkErrorContent(404, 'Page not found', undefined);
    }

    public static get Error500() : NetworkErrorContent<undefined> {
        return new NetworkErrorContent(500, 'Unkown server error', undefined);
    }

    public static CreateFromResponse<ErrorType = unknown, ResponseType = unknown>(error: ErrorType, response: AxiosResponse<ResponseType>) : NetworkErrorContent<ErrorType, ResponseType>
    {
        return new NetworkErrorContent(response.status, response.statusText, error, response);
    }

    public static Create<ErrorType = unknown>(error: ErrorType, code: number, info: string) : NetworkErrorContent<ErrorType, unknown>
    {
        return new NetworkErrorContent(code, info, error);
    }
     
}

export default NetworkErrorData;