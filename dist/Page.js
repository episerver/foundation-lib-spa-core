"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageType = void 0;
const EpiComponent_1 = __importDefault(require("./EpiComponent"));
var PageType;
(function (PageType) {
    PageType["Home"] = "home";
    PageType["Product"] = "product";
    PageType["Category"] = "category";
    PageType["Basket"] = "basket";
    PageType["Other"] = "other";
})(PageType = exports.PageType || (exports.PageType = {}));
class Page extends EpiComponent_1.default {
    constructor() {
        super(...arguments);
        /**
         * The page type of the current page being rendered
         */
        this.pageType = PageType.Other;
        /**
         * Make sure page tracking is done when a page is being rendered
         *
         * This method cannot be overridden in sub-classes, use the pageDidMount method, that
         * is invoked by this class as direct replacement.
         */
        this.componentDidMount = () => {
            /*let initialContent = EpiContext.Instance.getInitialContentLink();
            if (!(initialContent && initialContent.guidValue == this.props.data.contentLink.guidValue)) {
                //Only track if we're not the initial page
                let trackingData = this.buildTrackingData();
                if (this.isDebugActive()) {
                    console.debug("ProductRecs tracking data: ", trackingData);
                }
                if (trackingData) Engine.trackPageView(trackingData);
            }*/
            if (this.pageDidMount)
                this.pageDidMount();
        };
        /**
         * This method creates the tracking data as send to the the Episerver tracking service
         */
        this.buildTrackingData = () => {
            let trackingData = {};
            if (this.pageWillTrack)
                trackingData = this.pageWillTrack(trackingData);
            return trackingData;
        };
        /**
         * Retrieve the path of the current page
         */
        this.getPagePath = () => {
            return this.getCurrentContentLink().url;
        };
        /**
         * Build an action URL
         */
        this.buildActionPath = (action) => {
            return (this.getPagePath() + '/' + action + '/').replace('//', '/');
        };
    }
}
exports.default = Page;
