import React, { useState, useEffect } from 'react';
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
const Spinner = (props) => {
    var ctx = useEpiserver();
    var timeout = props.timeout || ctx.config().spinnerTimeout || 0;
    var [isVisible, setIsVisible] = useState(timeout === 0);
    if (ctx.config().enableSpinner)
        return null;
    useEffect(() => {
        if (timeout === 0)
            return;
        setIsVisible(false);
        const timeoutHandle = setTimeout(() => { setIsVisible(true); }, timeout);
        return () => {
            clearTimeout(timeoutHandle);
        };
    }, []);
    if (isVisible) {
        if (props.children)
            return React.createElement("div", { className: "spinner" }, props.children);
        return React.createElement("div", { className: "spinner alert alert-secondary", role: "alert" },
            React.createElement("div", { className: "spinner-border text-primary", role: "status" },
                React.createElement("span", { className: "sr-only" }, "Loading...")),
            "Loading...");
    }
    return null;
};
Spinner.displayName = "Default spinner";
/**
 * Create a spinner instance that can be returned from a component
 *
 * @deprecated	Use createSpinner instead
 * @param 		props 	The props for the spinner
 * @returns 	The spinner element
 */
Spinner.CreateInstance = (props) => {
    if (!EpiContext.config().enableSpinner)
        return null;
    const SpinnerType = EpiContext.config().spinner || Spinner;
    return React.createElement(SpinnerType, Object.assign({}, props));
};
/**
 * Create a spinner instance that can be returned from a component
 *
 * @param 		props 	The props for the spinner
 * @returns 	The spinner element
 */
Spinner.createInstance = (props) => {
    if (!EpiContext.config().enableSpinner)
        return null;
    const SpinnerType = EpiContext.config().spinner || Spinner;
    return React.createElement(SpinnerType, Object.assign({}, props));
};
export default Spinner;
//# sourceMappingURL=Spinner.js.map