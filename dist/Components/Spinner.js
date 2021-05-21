import React, { useState, useEffect, useCallback } from 'react';
import { useEpiserver } from '../Hooks/Context';
import EpiContext from '../Spa';
/**
 * Default spinner component, it will show either the children or the default
 * spinner. It has full support for a timeout before showing the spinner, to
 * prevent "jumpiness" the page due to spinners showing and hiding.
 *
 * @param props Spinner configuration
 * @returns The spinner
 */
const DefaultSpinner = (props) => {
    const cfg = useEpiserver().config();
    const timeout = useCallback(() => { return props.timeout || (cfg === null || cfg === void 0 ? void 0 : cfg.spinnerTimeout) || 0; }, [props.timeout, cfg === null || cfg === void 0 ? void 0 : cfg.spinnerTimeout])();
    const [isVisible, setIsVisible] = useState(timeout === 0);
    useEffect(() => {
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
            return React.createElement("div", { className: "spinner" }, props.children);
        return React.createElement("div", { className: "spinner alert alert-secondary", role: "alert" },
            React.createElement("div", { className: "spinner-border text-primary", role: "status" },
                React.createElement("span", { className: "sr-only" }, "Loading...")),
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
    if (!EpiContext.config().enableSpinner)
        return null;
    const SpinnerType = (EpiContext.config().spinner || DefaultSpinner);
    return React.createElement(SpinnerType, Object.assign({}, props));
};
export const Spinner = (props) => {
    const cfg = useEpiserver().config();
    if (cfg.enableSpinner !== true)
        return null;
    const SpinnerType = cfg.spinner || DefaultSpinner;
    return React.createElement(SpinnerType, Object.assign({}, props));
};
Spinner.displayName = "Optimizely CMS: Spinner resolver";
export default DefaultSpinner;
//# sourceMappingURL=Spinner.js.map