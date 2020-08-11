"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var EpiComponent_1 = require("../../EpiComponent");
var StringUtils_1 = __importDefault(require("../../Util/StringUtils"));
;
var ComponentNotFound = /** @class */ (function (_super) {
    __extends(ComponentNotFound, _super);
    function ComponentNotFound() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComponentNotFound.prototype.render = function () {
        var baseName = this.props.data.contentType.map(function (s) { return StringUtils_1.default.SafeModelName(s); }).join("/");
        var name = this.props.contentType || "";
        if (name && name.length > 0 && name !== this.props.data.contentType.slice(0, 1)[0]) {
            baseName = name + '/' + baseName;
        }
        return react_1.default.createElement("div", { className: "alert alert-danger text-center m-3", role: "alert" },
            "Component app/Components/",
            baseName,
            " not found");
    };
    ComponentNotFound.displayName = 'Epi/ComponentNotFound';
    return ComponentNotFound;
}(EpiComponent_1.BaseEpiComponent));
exports.default = ComponentNotFound;
