import React, { useState, useEffect, FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { useEpiserver, useIContentRepository, useServerSideRendering } from '../Hooks/Context';
import { ContentReference, ContentLinkService } from '../Models/ContentLink';
import IContent from '../Models/IContent';
import { IContentRenderer } from './EpiComponent';
import { Spinner } from './Spinner';

export const RoutedComponent : FunctionComponent<RouteComponentProps> = (props: RouteComponentProps) =>
{
    const epi = useEpiserver();
    const repo = useIContentRepository();
    const ssr = useServerSideRendering();
    const path = props.location.pathname;
    const [iContent, setIContent] = useState<IContent | null>(ssr.getIContentByPath(path));
    const debug = epi.isDebugActive();
    const lang = epi.Language;

    // Handle path changes
    useEffect(() => {
        let isCancelled = false;
        repo.getByRoute(path).then(c => {
            if (isCancelled) return;
            epi.setRoutedContent(c || undefined);
            setIContent(c);
        });
        return () => { isCancelled = true; epi.setRoutedContent(); };
    }, [ path, repo, epi ]);

    // Handle content changes
    useEffect(() => {
        let isCancelled = false;
        if (!iContent) return () => { isCancelled = true; };
        const linkId = ContentLinkService.createLanguageId(iContent, lang, true);

        const afterPatch : (link: Readonly<ContentReference>, oldValue: Readonly<IContent>, newValue: IContent) => void = (link, oldValue, newValue) => {
            const itemApiId = ContentLinkService.createLanguageId(link, lang, true);
            if (debug) console.debug('RoutedComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
            if (linkId === itemApiId && !isCancelled) {
                if (debug) console.debug('RoutedComponent.onContentPatched => Updating iContent', itemApiId, newValue);
                setIContent(newValue);
            }
        }
        const afterUpdate : (item : IContent | null) => void = (item: IContent | null) => {
            if (!item) return;
            const itemApiId = ContentLinkService.createLanguageId(item, lang, true);
            if (debug) console.debug('RoutedComponent.onContentPatched => Checking content ids (link, received)', linkId, itemApiId);
            if (linkId === itemApiId) {
                if (debug) console.debug('RoutedComponent.onContentUpdated => Updating iContent', itemApiId, item);
                setIContent(item);
            }
        }
        repo.addListener("afterPatch", afterPatch );
        repo.addListener("afterUpdate", afterUpdate);

        return () => {
            isCancelled = true;
            repo.removeListener("afterPatch", afterPatch);
            repo.removeListener("afterUpdate", afterUpdate);
        }
    }, [ repo, debug, lang, iContent]);

    if (iContent === null) return <Spinner />
    return <IContentRenderer data={ iContent } path={ props.location.pathname } />
}
RoutedComponent.displayName = "Optimizely CMS: Path IContent resolver";
export default RoutedComponent;