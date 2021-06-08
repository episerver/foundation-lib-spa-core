"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentNotFound = void 0;
const react_1 = require("react");
const StringUtils_1 = require("../../Util/StringUtils");
const ComponentNotFound = (props) => {
    var _a, _b, _c, _d, _e;
    let baseName = ((_c = (_b = (_a = props.data) === null || _a === void 0 ? void 0 : _a.contentType) === null || _b === void 0 ? void 0 : _b.map((s) => { return StringUtils_1.default.SafeModelName(s); })) === null || _c === void 0 ? void 0 : _c.join("/")) || '';
    const name = props.contentType || "";
    if (name && name.length > 0 && name !== ((_e = (_d = props.data) === null || _d === void 0 ? void 0 : _d.contentType) === null || _e === void 0 ? void 0 : _e.slice(0, 1)[0]))
        baseName = name + '/' + baseName;
    return react_1.default.createElement("div", { className: "alert alert-danger text-center m-3", role: "alert" },
        "Component app/Components/",
        baseName,
        " not found");
};
exports.ComponentNotFound = ComponentNotFound;
exports.ComponentNotFound.displayName = 'Optimizely CMS: Component not found';
exports.default = exports.ComponentNotFound;
//# sourceMappingURL=ComponentNotFound.js.map