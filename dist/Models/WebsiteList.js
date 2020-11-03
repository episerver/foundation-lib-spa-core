"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostnameFilter = void 0;
exports.hostnameFilter = (website, host, language, matchWildcard = true) => {
    const matchingHosts = website.hosts ? website.hosts.filter(h => {
        return (h.name === host && (language ? h.language === language : true)) || (matchWildcard && h.name === '*');
    }) : [];
    return matchingHosts && matchingHosts.length > 0;
};
