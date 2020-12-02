import Website from './Website';
export declare type WebsiteList = Website[];
export declare const hostnameFilter: (website: Readonly<Website>, host: string, language?: string, matchWildcard?: boolean) => boolean;
export default WebsiteList;
