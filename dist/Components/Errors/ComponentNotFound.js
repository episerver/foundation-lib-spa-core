"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const EpiComponent_1 = require("../../EpiComponent");
const StringUtils_1 = __importDefault(require("../../Util/StringUtils"));
;
class ComponentNotFound extends EpiComponent_1.BaseEpiComponent {
    render() {
        let baseName = this.props.data.contentType.map((s) => { return StringUtils_1.default.SafeModelName(s); }).join("/");
        let name = this.props.contentType || "";
        if (name && name.length > 0 && name !== this.props.data.contentType.slice(0, 1)[0]) {
            baseName = name + '/' + baseName;
        }
        return react_1.default.createElement("div", { className: "alert alert-danger text-center m-3", role: "alert" },
            "Component app/Components/",
            baseName,
            " not found");
    }
}
exports.default = ComponentNotFound;
ComponentNotFound.displayName = 'Epi/ComponentNotFound';
