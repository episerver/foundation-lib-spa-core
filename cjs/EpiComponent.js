"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpiClassComponent = void 0;
const react_1 = require("react");
const Spa_1 = require("./Spa");
const Property_1 = require("./Property");
/**
 * Base abstract class to be used by components representing an Episerver IContent component (e.g. Block, Page, Media,
 * Catalog, Product, etc...)
 */
class EpiClassComponent extends react_1.Component {
    constructor(props) {
        super(props);
        this.read = Property_1.readPropertyValue;
        this.readExpanded = Property_1.readPropertyExpandedValue;
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
        const context = this.props.context || Spa_1.default;
        return context;
    }
    getContentDeliveryApi() {
        return this.getContext().serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
    }
    /**
     * Invoke a method on the underlying controller for this component, using strongly typed arguments and responses.
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    invokeTyped(method, verb, args) {
        return this.getContentDeliveryApi().invoke(this.getCurrentContentLink(), method, verb, args);
    }
    /**
     * Invoke a method on the underlying controller for this component
     *
     * @param method The (Case sensitive) name of the method to invoke on the controller for this component
     * @param verb The HTTP method to use when invoking, defaults to 'GET'
     * @param args The data to send (will be converted to JSON)
     */
    invoke(method, verb, args) {
        return this.getContentDeliveryApi().invoke(this.getCurrentContentLink(), method, verb, args);
    }
    htmlObject(htmlValue) {
        return { __html: htmlValue };
    }
}
exports.EpiClassComponent = EpiClassComponent;
exports.default = EpiClassComponent;
//# sourceMappingURL=EpiComponent.js.map