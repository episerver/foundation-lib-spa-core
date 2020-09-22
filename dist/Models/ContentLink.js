"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentLinkService = void 0;
var Spa_1 = __importDefault(require("../Spa"));
var ContentLinkService = /** @class */ (function () {
    function ContentLinkService() {
        //Just here to prevent instances
    }
    ContentLinkService.referenceIsIContent = function (ref) {
        return (ref && ref.contentType && ref.name) ? true : false;
    };
    ContentLinkService.referenceIsContentLink = function (ref) {
        return ref && ((ref.guidValue && typeof ref.guidValue === 'string') ||
            (ref.id && typeof ref.id === 'number')) ? true : false;
    };
    ContentLinkService.referenceIsString = function (ref) {
        return ref && ref.trim ? true : false;
    };
    /**
     *
     * @param ref The content reference to generate the API-ID for.
     */
    ContentLinkService.createApiId = function (ref, preferGuid) {
        if (preferGuid === void 0) { preferGuid = false; }
        if (this.referenceIsString(ref)) {
            return ref;
        }
        var link = null;
        if (this.referenceIsIContent(ref)) {
            link = ref.contentLink;
        }
        if (this.referenceIsContentLink(ref)) {
            link = ref;
        }
        if (link) {
            if ((preferGuid && link.guidValue) || !link.id) {
                return link.guidValue;
            }
            else {
                var out = link.id.toString();
                if (link.providerName) {
                    out = out + "__" + link.providerName;
                }
                return out;
            }
        }
        throw 'Unable to generate an Episerver API ID';
    };
    ContentLinkService.createHref = function (ref) {
        if (this.referenceIsIContent(ref)) {
            var path = this.getUrlFromLink(ref.contentLink);
            if (!path && ref.url) {
                return ref.url;
            }
            return path;
        }
        if (this.referenceIsContentLink(ref)) {
            return this.getUrlFromLink(ref);
        }
        return null;
    };
    ContentLinkService.getUrlFromLink = function (link) {
        var linkUrl = link.url || '';
        if (linkUrl.substr(0, 1) == '/') {
            //Absolute URL
            var basePath = Spa_1.default.config().basePath;
            linkUrl = linkUrl.substr(1);
            return basePath.substr(-1) == '/' ? basePath + linkUrl : basePath + '/' + linkUrl;
        }
        else {
            return linkUrl;
        }
    };
    return ContentLinkService;
}());
exports.ContentLinkService = ContentLinkService;
