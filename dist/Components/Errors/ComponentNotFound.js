import React from 'react';
import StringUtils from '../../Util/StringUtils';
export const ComponentNotFound = (props) => {
    var _a, _b, _c, _d, _e;
    let baseName = ((_c = (_b = (_a = props.data) === null || _a === void 0 ? void 0 : _a.contentType) === null || _b === void 0 ? void 0 : _b.map((s) => { return StringUtils.SafeModelName(s); })) === null || _c === void 0 ? void 0 : _c.join("/")) || '';
    const name = props.contentType || "";
    if (name && name.length > 0 && name !== ((_e = (_d = props.data) === null || _d === void 0 ? void 0 : _d.contentType) === null || _e === void 0 ? void 0 : _e.slice(0, 1)[0]))
        baseName = name + '/' + baseName;
    return React.createElement("div", { className: "alert alert-danger text-center m-3", role: "alert" },
        "Component app/Components/",
        baseName,
        " not found");
};
ComponentNotFound.displayName = 'Optimizely CMS: Component not found';
export default ComponentNotFound;
//# sourceMappingURL=ComponentNotFound.js.map