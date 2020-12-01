import React, { useState, useEffect, FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { useEpiserver, useIContentRepository, useServerSideRendering } from '../Hooks/Context';
import IContent from '../Models/IContent';
import EpiComponent from './EpiComponent';
import Spinner from './Spinner';


export const RoutedComponent : FunctionComponent<RouteComponentProps> = (props: RouteComponentProps) =>
{
    const epi = useEpiserver();
    const repo = useIContentRepository();
    const ssr = useServerSideRendering();
    const path = props.location.pathname;
    const [iContent, setIContent] = useState<IContent | null>(path === ssr.Path ? ssr.IContent : null);

    // Handle path changes
    useEffect(() => {
        repo.getByRoute(path).then(c => {
            epi.setRoutedContent(c || undefined);
            setIContent(c);
        });
        return () => { epi.setRoutedContent() };
    }, [ path ]);

    // Handle content changes
    useEffect(() => {
        if (!iContent) return;
        const handleUpdate = (item : IContent | null) => {
            if (item && item.contentLink.guidValue === iContent.contentLink.guidValue) setIContent(item);
        }
        repo.on("afterUpdate", handleUpdate);
        return () => { repo.off("afterUpdate", handleUpdate); }
    }, [ iContent ]);

    if (iContent === null) {
        return Spinner.CreateInstance({});
    }
    return <EpiComponent contentLink={ iContent.contentLink } expandedValue={ iContent } path={ props.location.pathname } />
}

export default RoutedComponent;