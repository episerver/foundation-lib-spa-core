import React, { useState, useEffect, FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { useEpiserver, useIContentRepository } from '../Hooks/Context';
import IContent from '../Models/IContent';
import EpiComponent from './EpiComponent';
import Spinner from './Spinner';


export const RoutedComponent : FunctionComponent<RouteComponentProps> = (props: RouteComponentProps) =>
{
    const epi = useEpiserver();
    const repo = useIContentRepository();
    const path = props.location.pathname;
    const [iContent, setIContent] = useState<IContent | null>(null);

    useEffect(() => {
        repo.getByRoute(path).then(c => {
            epi.setRoutedContent(c || undefined);
            setIContent(c);
        });
        return () => { epi.setRoutedContent() };
    }, [ path ]);

    if (iContent === null) {
        return Spinner.CreateInstance({});
    }
    return <EpiComponent contentLink={ iContent.contentLink } expandedValue={ iContent } path={ props.location.pathname } />
}

export default RoutedComponent;