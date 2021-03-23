import React, { Component } from 'react';
import EpiContext from '../Spa';
export default class Spinner extends Component {
    /**
     * Create a new instance of a spinner component, used to mark
     * the loading state of the application.
     *
     * @param 	props 	The properties of the spinner
     */
    static CreateInstance(props) {
        if (!EpiContext.config().enableSpinner)
            return null;
        const SpinnerType = EpiContext.config().spinner || Spinner;
        return React.createElement(SpinnerType, props);
    }
    render() {
        return React.createElement("div", { className: "alert alert-secondary", role: "alert" },
            React.createElement("div", { className: "spinner-border text-primary", role: "status" },
                React.createElement("span", { className: "sr-only" }, "Loading...")),
            "Loading...");
    }
}
//# sourceMappingURL=Spinner.js.map