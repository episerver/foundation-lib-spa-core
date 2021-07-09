import { Component } from 'react';
import CurrentContext from './Spa';
import { readPropertyValue, readPropertyExpandedValue } from './Property';
/**
 * Base abstract class to be used by components representing an Episerver IContent component (e.g. Block, Page, Media,
 * Catalog, Product, etc...)
 */
export class EpiClassComponent extends Component {
    constructor(props) {
        super(props);
        this.read = readPropertyValue;
        this.readExpanded = readPropertyExpandedValue;
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
        const context = this.props.context || CurrentContext;
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
export default EpiClassComponent;
//# sourceMappingURL=EpiComponent.js.map