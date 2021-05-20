import React, { useState, useEffect } from 'react';
import { useEpiserver, useIContentRepository, useServerSideRendering } from '../Hooks/Context';
import { ContentLinkService } from '../Models/ContentLink';
import { IContentRenderer } from './EpiComponent';
import { Spinner } from './Spinner';
export const RoutedComponent = (props) => {
    const epi = useEpiserver();
    const repo = useIContentRepository();
    const ssr = useServerSideRendering();
    const path = props.location.pathname;
    const [iContent, setIContent] = useState(ssr.getIContentByPath(path));
    const debug = epi.isDebugActive();
    const lang = epi.Language;
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
    // Handle content changes
    useEffect(() => {
        let isCancelled = false;
        if (!iContent)
            return () => { isCancelled = true; };
        const linkId = ContentLinkService.createLanguageId(iContent, lang, true);
        const afterPatch = (link, oldValue, newValue) => {
            const itemApiId = ContentLinkService.createLanguageId(link, lang, true);
            if (debug)
                console.debug('RoutedComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
            if (linkId === itemApiId && !isCancelled) {
                if (debug)
                    console.debug('RoutedComponent.onContentPatched => Updating iContent', itemApiId, newValue);
                setIContent(newValue);
            }
        };
        repo.addListener("afterPatch", afterPatch);
        return () => {
            isCancelled = true;
            repo.removeListener("afterPatch", afterPatch);
        };
    }, [repo, debug, lang, iContent]);
    if (iContent === null)
        return React.createElement(Spinner, null);
    return React.createElement(IContentRenderer, { data: iContent, path: props.location.pathname });
};
RoutedComponent.displayName = "Optimizely CMS: Path IContent resolver";
export default RoutedComponent;
//# sourceMappingURL=RoutedComponent.js.map