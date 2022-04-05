import React, { useState, useEffect } from 'react';
import { useEpiserver, useIContentRepository, useServerSideRendering } from '../Hooks/Context';
import { ContentLinkService } from '../Models/ContentLink';
import { IContentRenderer } from './EpiComponent';
import { Spinner } from './Spinner';
export const RoutedComponent = (props) => {
    var _a, _b, _c;
    const epi = useEpiserver();
    const repo = useIContentRepository();
    const ssr = useServerSideRendering();
    const path = props.location.pathname;
    let ssrData = null;
    if (ssr.IsServerSideRendering) {
        console.warn('Routed component ssr');
        const tmpState = epi.getStore().getState();
        console.warn('Routed component state data', (_a = tmpState === null || tmpState === void 0 ? void 0 : tmpState.OptiContentCloud) === null || _a === void 0 ? void 0 : _a.currentLanguage);
        ssrData = (_c = (_b = tmpState === null || tmpState === void 0 ? void 0 : tmpState.OptiContentCloud) === null || _b === void 0 ? void 0 : _b.iContent) !== null && _c !== void 0 ? _c : ssr.getIContentByPath(path);
    }
    const [iContent, setIContent] = useState(ssrData);
    const debug = epi.isDebugActive();
    const lang = epi.Language;
    const store = epi.getStore();
    // Handle path changes
    useEffect(() => {
        let isCancelled = false;
        repo.getByRoute(path).then((c) => {
            if (isCancelled)
                return;
            epi.setRoutedContent(c || undefined);
            setIContent(c);
        });
        return () => {
            isCancelled = true;
            epi.setRoutedContent();
        };
    }, [path, repo, epi]);
    // Handle content changes
    useEffect(() => {
        let isCancelled = false;
        if (!iContent)
            return () => {
                isCancelled = true;
            };
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
        };
    }, [repo, debug, lang, iContent]);
    if (iContent === null)
        return React.createElement(Spinner, null);
    return React.createElement(IContentRenderer, { data: iContent, path: props.location.pathname });
};
RoutedComponent.displayName = 'Optimizely CMS: Path IContent resolver';
export default RoutedComponent;
//# sourceMappingURL=RoutedComponent.js.map