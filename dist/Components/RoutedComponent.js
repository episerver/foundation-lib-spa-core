import React, { useState, useEffect } from 'react';
import { useCmsState, useEpiserver, useIContentRepository, useServerSideRendering } from '../Hooks/Context';
import { ContentLinkService } from '../Models/ContentLink';
import { IContentRenderer } from './EpiComponent';
import { Spinner } from './Spinner';
export const RoutedComponent = (props) => {
    var _a;
    const epi = useEpiserver();
    const cfg = epi.config();
    const NotFoundType = cfg.notFoundComponent || React.createElement(React.Fragment, null);
    const repo = useIContentRepository();
    const ssr = useServerSideRendering();
    const path = props.location.pathname;
    const tmpState = useCmsState();
    let ssrData = null;
    if (ssr.IsServerSideRendering) {
        ssrData = (_a = tmpState === null || tmpState === void 0 ? void 0 : tmpState.iContent) !== null && _a !== void 0 ? _a : ssr.getIContentByPath(path);
    }
    const [iContent, setIContent] = useState(ssrData);
    const [isLoading, setIsLoading] = useState(true);
    const debug = epi.isDebugActive();
    const lang = epi.Language;
    const store = epi.getStore();
    // Handle path changes
    useEffect(() => {
        let isCancelled = false;
        setIsLoading(true);
        repo.getByRoute(path).then((c) => {
            if (isCancelled)
                return;
            epi.setRoutedContent(c || undefined);
            setIContent(c);
            setIsLoading(false);
        });
        return () => {
            isCancelled = true;
            epi.setRoutedContent();
            setIsLoading(false);
        };
    }, [path, repo, epi]);
    // Handle content changes
    useEffect(() => {
        let isCancelled = false;
        setIsLoading(true);
        if (!iContent) {
            setIsLoading(false);
            return () => {
                isCancelled = true;
            };
        }
        const linkId = ContentLinkService.createLanguageId(iContent, lang, true);
        const afterPatch = (link, oldValue, newValue) => {
            const itemApiId = ContentLinkService.createLanguageId(link, lang, true);
            if (debug)
                console.debug('RoutedComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
            if (linkId === itemApiId && !isCancelled) {
                if (debug)
                    console.debug('RoutedComponent.onContentPatched => Updating iContent', itemApiId, newValue);
                setIContent(newValue);
                setIsLoading(false);
            }
        };
        const afterUpdate = (item) => {
            if (!item)
                return;
            const itemApiId = ContentLinkService.createLanguageId(item, lang, true);
            if (debug)
                console.debug('RoutedComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
            if (linkId === itemApiId) {
                if (debug)
                    console.debug('RoutedComponent.onContentUpdated => Updating iContent', itemApiId, item);
                setIContent(item);
                setIsLoading(false);
            }
        };
        repo.addListener('afterPatch', afterPatch);
        repo.addListener('afterUpdate', afterUpdate);
        store.dispatch({
            type: 'OptiContentCloud/SetState',
            iContent: iContent,
        });
        return () => {
            isCancelled = true;
            repo.removeListener('afterPatch', afterPatch);
            repo.removeListener('afterUpdate', afterUpdate);
            setIsLoading(false);
        };
    }, [repo, debug, lang, iContent]);
    console.log(iContent);
    if (!isLoading && iContent === null && cfg.notFoundComponent !== undefined)
        return React.createElement(React.Fragment, null, NotFoundType);
    if (iContent === null)
        return React.createElement(Spinner, null);
    return React.createElement(IContentRenderer, { data: iContent, path: props.location.pathname });
};
RoutedComponent.displayName = 'Optimizely CMS: Path IContent resolver';
export default RoutedComponent;
//# sourceMappingURL=RoutedComponent.js.map