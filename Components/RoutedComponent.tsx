import React, { useState, useEffect, ReactElement, ComponentType, ComponentElement } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, Route } from 'react-router';

import { useEpiserver } from '../index';
import IContent from '../Models/IContent';
import { ContentLinkService } from '../Models/ContentLink';
import { PartialStateWithIContentRepoState } from '../Repository/IContent';
import EpiComponent, {EpiComponentProps} from './EpiComponent';
import Spinner from './Spinner';


export function RoutedComponent(props: RouteComponentProps) : ComponentElement<any, any> | null
{
    const epi = useEpiserver();
    const path = props.location.pathname;
    const [iContent, setIContent] = useState<IContent | null>(null);

    useEffect(() => {
        const newContent = epi.getContentByPath(path);
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
    } else if (epi.isServerSideRendering()) {
        return <EpiComponent contentLink={ iContent.contentLink } context={ epi } expandedValue={ iContent } path={ props.location.pathname } />
    } else {
        const myProps : EpiComponentProps = {
            contentLink: iContent.contentLink,
            context: epi,
            expandedValue: iContent,
            path: props.location.pathname
        }
        const ConnectedEpiComponent = connect<EpiComponentProps, {}, EpiComponentProps, PartialStateWithIContentRepoState>((state, baseProps) : EpiComponentProps => {
            const repoContentId = ContentLinkService.createApiId(baseProps.contentLink);
            if (state.iContentRepo.items[repoContentId]) {
                return Object.assign({}, baseProps, {
                    expandedValue: state.iContentRepo.items[repoContentId].content
                } as EpiComponentProps);
            }
            return baseProps;
        })(EpiComponent);
        return <ConnectedEpiComponent {...myProps} />
    }
}

export default RoutedComponent as ComponentType<RouteComponentProps>;