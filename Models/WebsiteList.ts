import Website from './Website';
export type WebsiteList = Website[];

export const hostnameFilter : (website: Readonly<Website>, host: string, language ?: string, matchWildcard ?: boolean) => boolean = (website, host, language, matchWildcard = true) => {
    const matchingHosts = website.hosts ? website.hosts.filter(h => {
        return (h.name === host && (language ? h.language === language : true)) || (matchWildcard && h.name === '*');
    }) : [];
    return matchingHosts && matchingHosts.length > 0;
}

export default WebsiteList;
