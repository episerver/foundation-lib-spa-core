"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = void 0;
const react_1 = require("react");
const Context_1 = require("../Hooks/Context");
const Spa_1 = require("../Spa");
/**
 * Default spinner component, it will show either the children or the default
 * spinner. It has full support for a timeout before showing the spinner, to
 * prevent "jumpiness" the page due to spinners showing and hiding.
 *
 * @param props Spinner configuration
 * @returns The spinner
 */
const DefaultSpinner = (props) => {
    const cfg = Context_1.useEpiserver().config();
    const timeout = react_1.useCallback(() => { return props.timeout || (cfg === null || cfg === void 0 ? void 0 : cfg.spinnerTimeout) || 0; }, [props.timeout, cfg === null || cfg === void 0 ? void 0 : cfg.spinnerTimeout])();
    const [isVisible, setIsVisible] = react_1.useState(timeout === 0);
    react_1.useEffect(() => {
        if (timeout === 0)
            return;
        if ((cfg === null || cfg === void 0 ? void 0 : cfg.enableSpinner) !== true)
            return;
        setIsVisible(false);
        const timeoutHandle = setTimeout(() => { setIsVisible(true); }, timeout);
        return () => {
            clearTimeout(timeoutHandle);
        };
    }, [cfg, timeout]);
    if ((cfg === null || cfg === void 0 ? void 0 : cfg.enableSpinner) && isVisible) {
        if (props.children)
            return react_1.default.createElement("div", { className: "spinner" }, props.children);
        return react_1.default.createElement("div", { className: "spinner alert alert-secondary", role: "alert" },
            react_1.default.createElement("div", { className: "spinner-border text-primary", role: "status" },
                react_1.default.createElement("span", { className: "sr-only" }, "Loading...")),
            "Loading...");
    }
    return null;
};
DefaultSpinner.displayName = "Optimizely CMS: Default spinner";
/**
 * Create a spinner instance that can be returned from a component
 *
 * @deprecated	Use createSpinner instead
 * @param 		props 	The props for the spinner
 * @returns 	The spinner element
 */
DefaultSpinner.CreateInstance = DefaultSpinner.createInstance = (props) => {
    if (!Spa_1.default.config().enableSpinner)
        return null;
    const SpinnerType = (Spa_1.default.config().spinner || DefaultSpinner);
    return react_1.default.createElement(SpinnerType, Object.assign({}, props));
};
const Spinner = (props) => {
    const cfg = Context_1.useEpiserver().config();
    if (cfg.enableSpinner !== true)
        return null;
    const SpinnerType = cfg.spinner || DefaultSpinner;
    return react_1.default.createElement(SpinnerType, Object.assign({}, props));
};
exports.Spinner = Spinner;
exports.Spinner.displayName = "Optimizely CMS: Spinner resolver";
exports.default = DefaultSpinner;
//# sourceMappingURL=Spinner.js.map