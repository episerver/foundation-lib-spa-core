"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const Spa_1 = __importDefault(require("../Spa"));
class Spinner extends react_1.Component {
    /**
     * Create a new instance of a spinner component, used to mark
     * the loading state of the application.
     *
     * @param 	props 	The properties of the spinner
     */
    static CreateInstance(props) {
        if (!Spa_1.default.config().enableSpinner)
            return null;
        const SpinnerType = Spa_1.default.config().spinner || Spinner;
        return react_1.default.createElement(SpinnerType, props);
    }
    render() {
        return react_1.default.createElement("div", { className: "alert alert-secondary", role: "alert" },
            react_1.default.createElement("div", { className: "spinner-border text-primary", role: "status" },
                react_1.default.createElement("span", { className: "sr-only" }, "Loading...")),
            "Loading...");
    }
}
exports.default = Spinner;
