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
exports.PageType = void 0;
var EpiComponent_1 = __importDefault(require("./EpiComponent"));
var PageType;
(function (PageType) {
    PageType["Home"] = "home";
    PageType["Product"] = "product";
    PageType["Category"] = "category";
    PageType["Basket"] = "basket";
    PageType["Other"] = "other";
})(PageType = exports.PageType || (exports.PageType = {}));
var Page = /** @class */ (function (_super) {
    __extends(Page, _super);
    function Page() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * The page type of the current page being rendered
         */
        _this.pageType = PageType.Other;
        /**
         * Make sure page tracking is done when a page is being rendered
         *
         * This method cannot be overridden in sub-classes, use the pageDidMount method, that
         * is invoked by this class as direct replacement.
         */
        _this.componentDidMount = function () {
            /*let initialContent = EpiContext.Instance.getInitialContentLink();
            if (!(initialContent && initialContent.guidValue == this.props.data.contentLink.guidValue)) {
                //Only track if we're not the initial page
                let trackingData = this.buildTrackingData();
                if (this.isDebugActive()) {
                    console.debug("ProductRecs tracking data: ", trackingData);
                }
                if (trackingData) Engine.trackPageView(trackingData);
            }*/
            if (_this.pageDidMount)
                _this.pageDidMount();
        };
        /**
         * This method creates the tracking data as send to the the Episerver tracking service
         */
        _this.buildTrackingData = function () {
            var trackingData = {};
            if (_this.pageWillTrack)
                trackingData = _this.pageWillTrack(trackingData);
            return trackingData;
        };
        /**
         * Retrieve the path of the current page
         */
        _this.getPagePath = function () {
            return _this.getCurrentContentLink().url;
        };
        /**
         * Build an action URL
         */
        _this.buildActionPath = function (action) {
            return (_this.getPagePath() + '/' + action + '/').replace('//', '/');
        };
        return _this;
    }
    return Page;
}(EpiComponent_1.default));
exports.default = Page;
