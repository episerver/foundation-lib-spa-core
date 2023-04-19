import Website from './Website';
export type WebsiteList = Website[];
export declare const hostnameFilter: (website: Readonly<Website>, host: string, language?: string, matchWildcard?: boolean) => boolean;
export declare const languageFilter: (website: Readonly<Website>, language?: string) => boolean;
export default WebsiteList;
