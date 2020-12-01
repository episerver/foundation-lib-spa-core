import React from 'react';
import EpiComponent from '../../EpiComponent';
import StringUtils from '../../Util/StringUtils';
export default class ComponentNotFound extends EpiComponent {
    render() {
        let baseName = this.props.data.contentType.map((s) => { return StringUtils.SafeModelName(s); }).join("/");
        const name = this.props.contentType || "";
        if (name && name.length > 0 && name !== this.props.data.contentType.slice(0, 1)[0]) {
            baseName = name + '/' + baseName;
        }
        return React.createElement("div", { className: "alert alert-danger text-center m-3", role: "alert" },
            "Component app/Components/",
            baseName,
            " not found");
    }
}
ComponentNotFound.displayName = 'Epi/Error/ComponentNotFound';
