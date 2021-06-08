import React, { FunctionComponent } from 'react';
import IContent from '../../Models/IContent';
import StringUtils from '../../Util/StringUtils';

export type ComponentNotFoundProps = {
    data ?: IContent,
    contentType ?: string
}

export const ComponentNotFound : FunctionComponent<ComponentNotFoundProps> = (props) =>
{
    let baseName : string = props.data?.contentType?.map((s) => {return StringUtils.SafeModelName(s); })?.join("/") || '';
    const name : string = props.contentType || "";
    if (name && name.length > 0 && name !== props.data?.contentType?.slice(0,1)[0])
        baseName = name + '/' + baseName;
    
    return <div className="alert alert-danger text-center m-3" role="alert">Component app/Components/{ baseName } not found</div>
}
ComponentNotFound.displayName = 'Optimizely CMS: Component not found';

export default ComponentNotFound