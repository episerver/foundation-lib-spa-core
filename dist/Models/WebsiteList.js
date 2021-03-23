export const hostnameFilter = (website, host, language, matchWildcard = true) => {
    const matchingHosts = website.hosts ? website.hosts.filter(h => {
        return (h.name === host && (language ? h.language === language : true)) || (matchWildcard && h.name === '*');
    }) : [];
    return matchingHosts && matchingHosts.length > 0;
};
//# sourceMappingURL=WebsiteList.js.map