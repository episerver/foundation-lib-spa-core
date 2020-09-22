"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEpiComponent = void 0;
const react_1 = require("react");
/**
 * Base abstract class to be used by components representing an Episerver IContent component (e.g. Block, Page, Media,
 * Catalog, Product, etc...)
 */
class BaseEpiComponent extends react_1.Component {
    constructor(props) {
        super(props);
        this.currentComponentId = this.props.data.contentLink.id;
        this.currentComponentGuid = this.props.data.contentLink.guidValue;
        if (this.componentInitialize)
            this.componentInitialize();
        if (this.getInitialState)
            this.state = this.getInitialState();
    }
    /**
     * Return if debug mode is active
     */
    isDebugActive() {
        return this.getContext().isDebugActive() === true;
    }
    /**
     * Returns true for OPE only
     */
    isEditable() {
        return this.getContext().isEditable();
    }
    /**
     * Returns true for OPE & Preview
     */
    isInEditMode() {
        return this.getContext().isInEditMode();
    }
    /**
     * Retrieve the ContentLink for this component
     */
    getCurrentContentLink() {
        return this.props.data.contentLink;
    }
    getContext() {
        return this.props.context;
    }
    /**
     * Invoke a method on the underlying controller for this component, using strongly typed arguments and responses.
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    invokeTyped(method, verb, args) {
        return this.getContext().contentDeliveryApi().invokeTypedControllerMethod(this.getCurrentContentLink(), method, verb, args);
    }
    /**
     * Invoke a method on the underlying controller for this component
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    invoke(method, verb, args) {
        return this.getContext().contentDeliveryApi().invokeControllerMethod(this.getCurrentContentLink(), method, verb, args);
    }
    htmlObject(htmlValue) {
        return {
            __html: htmlValue
        };
    }
    navigateTo(toPage) {
        this.props.context.navigateTo(toPage);
    }
}
exports.BaseEpiComponent = BaseEpiComponent;
class EpiComponent extends BaseEpiComponent {
}
exports.default = EpiComponent;
