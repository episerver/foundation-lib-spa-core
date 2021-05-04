import React, { useState, useEffect, FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { useEpiserver, useIContentRepository, useServerSideRendering } from '../Hooks/Context';
import IContent from '../Models/IContent';
import EpiComponent from './EpiComponent';
import { Spinner } from './Spinner';

export const RoutedComponent : FunctionComponent<RouteComponentProps> = (props: RouteComponentProps) =>
{
    const epi = useEpiserver();
    const repo = useIContentRepository();
    const ssr = useServerSideRendering();
    const path = props.location.pathname;
    const [iContent, setIContent] = useState<IContent | null>(ssr.getIContentByPath(path));

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

    if (iContent === null) return <Spinner />
    return <EpiComponent contentLink={ iContent.contentLink } expandedValue={ iContent } path={ props.location.pathname } />
}

export default RoutedComponent;