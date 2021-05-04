import React, { useState, useEffect } from 'react';
import { useEpiserver, useIContentRepository, useServerSideRendering } from '../Hooks/Context';
import EpiComponent from './EpiComponent';
import { Spinner } from './Spinner';
export const RoutedComponent = (props) => {
    const epi = useEpiserver();
    const repo = useIContentRepository();
    const ssr = useServerSideRendering();
    const path = props.location.pathname;
    const [iContent, setIContent] = useState(ssr.getIContentByPath(path));
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
    }, [path, repo, epi]);
    if (iContent === null)
        return React.createElement(Spinner, null);
    return React.createElement(EpiComponent, { contentLink: iContent.contentLink, expandedValue: iContent, path: props.location.pathname });
};
export default RoutedComponent;
//# sourceMappingURL=RoutedComponent.js.map