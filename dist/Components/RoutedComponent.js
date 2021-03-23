import React, { useState, useEffect } from 'react';
import { useEpiserver, useIContentRepository, useServerSideRendering } from '../Hooks/Context';
import EpiComponent from './EpiComponent';
import Spinner from './Spinner';
import { ContentLinkService } from '../Models/ContentLink';
export const RoutedComponent = (props) => {
    const epi = useEpiserver();
    const repo = useIContentRepository();
    const ssr = useServerSideRendering();
    const path = props.location.pathname;
    const [iContent, setIContent] = useState(path === ssr.Path ? ssr.IContent : null);
    const iContentId = iContent ? ContentLinkService.createLanguageId(iContent, 'en') : '';
    // Handle path changes
    useEffect(() => {
        let isCancelled = false;
        repo.getByRoute(path).then(c => {
            if (isCancelled)
                return;
            epi.setRoutedContent(c || undefined);
            setIContent(c);
        });
        return () => { isCancelled = true; epi.setRoutedContent(); };
    }, [path]);
    // Handle content changes
    useEffect(() => {
        if (!iContent)
            return;
        const handleUpdate = (item) => {
            if (item && item.contentLink.guidValue === iContent.contentLink.guidValue)
                setIContent(item);
        };
        repo.on("afterUpdate", handleUpdate);
        return () => { repo.off("afterUpdate", handleUpdate); };
    }, [iContentId]);
    if (iContent === null) {
        return Spinner.CreateInstance({});
    }
    return React.createElement(EpiComponent, { contentLink: iContent.contentLink, expandedValue: iContent, path: props.location.pathname });
};
export default RoutedComponent;
//# sourceMappingURL=RoutedComponent.js.map