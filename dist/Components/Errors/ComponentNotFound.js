import React from 'react';
import StringUtils from '../../Util/StringUtils';
export const ComponentNotFound = (props) => {
    let baseName = props.data?.contentType?.map((s) => { return StringUtils.SafeModelName(s); })?.join("/") || '';
    const name = props.contentType || "";
    if (name && name.length > 0 && name !== props.data?.contentType?.slice(0, 1)[0])
        baseName = name + '/' + baseName;
    return React.createElement("div", { className: "alert alert-danger text-center m-3", role: "alert" },
        "Component app/Components/",
        baseName,
        " not found");
};
ComponentNotFound.displayName = 'Optimizely CMS: Component not found';
export default ComponentNotFound;
//# sourceMappingURL=ComponentNotFound.js.map