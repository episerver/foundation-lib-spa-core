
import ContentDeliveryAPI, { PathResponse as BasePathResponse, NetworkErrorData as BaseNetworkErrorData, PathResponseIsIContent as BasePathResponseIsIContent } from '../ContentDeliveryAPI';

export const PathResponseIsIContent = BasePathResponseIsIContent;
export type API = ContentDeliveryAPI;
export type NetworkErrorData = BaseNetworkErrorData;
export type PathResponse = BasePathResponse;