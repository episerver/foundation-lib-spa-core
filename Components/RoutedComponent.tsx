import React, { useState, useEffect, ReactElement, ComponentType, ComponentElement } from 'react';
import { RouteComponentProps, Route } from 'react-router';
import { useEpiserver } from '../index';
import IContent from '../Models/IContent';
import EpiComponent from './EpiComponent';
import Spinner from './Spinner';

namespace RoutedComponent 
{
    export function render(props: RouteComponentProps) : ComponentElement<any, any> | null
    {
        const epi = useEpiserver();
        const path = props.location.pathname;
        const [iContent, setIContent] = useState<IContent | null>(null);

        useEffect(() => {
            let newContent = epi.getContentByPath(path);
            if (!newContent) {
                epi.loadContentByPath(path).then((c) => {
                    setIContent(c);
                });
            } else {
                setIContent(newContent);
            }
        }, [props.location]);

        if (iContent === null) {
            return Spinner.CreateInstance({});
        } else {
            return <EpiComponent contentLink={ iContent.contentLink } context={ epi } expandedValue={ iContent } path={ props.location.pathname } />
        }
    }
}

export default RoutedComponent.render as ComponentType<RouteComponentProps>;