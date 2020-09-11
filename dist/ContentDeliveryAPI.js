"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIContentFromPathResponse = exports.PathResponseIsActionResponse = exports.PathResponseIsIContent = void 0;
var axios_1 = __importDefault(require("axios"));
var ContentLink_1 = require("./Models/ContentLink");
var ActionResponse_1 = require("./Models/ActionResponse");
function PathResponseIsIContent(iContent) {
    if (iContent.actionName) {
        return false;
    }
    return true;
}
exports.PathResponseIsIContent = PathResponseIsIContent;
function PathResponseIsActionResponse(actionResponse) {
    if (actionResponse.actionName) {
        return true;
    }
    return false;
}
exports.PathResponseIsActionResponse = PathResponseIsActionResponse;
function getIContentFromPathResponse(response) {
    if (PathResponseIsActionResponse(response)) {
        return response.currentContent;
    }
    if (PathResponseIsIContent(response)) {
        return response;
    }
    return null;
}
exports.getIContentFromPathResponse = getIContentFromPathResponse;
var ContentDeliveryAPI = /** @class */ (function () {
    function ContentDeliveryAPI(pathProvider, config) {
        this.componentService = '/api/episerver/v2.0/content/';
        this.websiteService = '/api/episerver/v3/site/';
        this.methodService = '/api/episerver/v3/action/';
        this.debug = false;
        /**
         * Marker to keep if we're in edit mode
         */
        this.inEditMode = false;
        this.counter = 0;
        this.pathProvider = pathProvider;
        this.config = config;
        this.debug = this.config.enableDebug === true;
    }
    Object.defineProperty(ContentDeliveryAPI.prototype, "currentPathProvider", {
        get: function () {
            return this.pathProvider;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContentDeliveryAPI.prototype, "currentConfig", {
        get: function () {
            return this.config;
        },
        enumerable: false,
        configurable: true
    });
    ContentDeliveryAPI.prototype.isInEditMode = function () {
        return this.inEditMode;
    };
    ContentDeliveryAPI.prototype.setInEditMode = function (editMode) {
        this.inEditMode = editMode === true;
        return this;
    };
    ContentDeliveryAPI.prototype.isDisabled = function () {
        return this.config.noAjax === true;
    };
    /**
     * Invoke an ASP.Net MVC controller method using the generic content API. This is intended
     * to be used only when attaching a SPA to an existing code-base.
     *
     * @param content The content for which the controller must be loaded
     * @param method  The (case sensitive) method name to invoke on the controller
     * @param verb    The HTTP verb to use when invoking the controller
     * @param data    The data (if any) to send to the controller for the method
     */
    ContentDeliveryAPI.prototype.invokeControllerMethod = function (content, method, verb, data) {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.getRequestSettings(verb);
                        options.data = data;
                        return [4 /*yield*/, this.doRequest(this.getMethodServiceUrl(content, method), options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Strongly typed variant of invokeControllerMethod
     *
     * @see   invokeControllerMethod()
     * @param content The content for which the controller must be loaded
     * @param method  The (case sensitive) method name to invoke on the controller
     * @param verb    The HTTP verb to use when invoking the controller
     * @param data    The data (if any) to send to the controller for the method
     */
    ContentDeliveryAPI.prototype.invokeTypedControllerMethod = function (content, method, verb, data) {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.getRequestSettings(verb);
                        options.data = data;
                        return [4 /*yield*/, this.doRequest(this.getMethodServiceUrl(content, method), options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieve a list of all websites registered within Episerver
     */
    ContentDeliveryAPI.prototype.getWebsites = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.websites) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.doRequest(this.config.epiBaseUrl + this.websiteService)];
                    case 1:
                        _a.websites = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.websites];
                }
            });
        });
    };
    /**
     * Retrieve the first website registered within Episerver
     */
    ContentDeliveryAPI.prototype.getWebsite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getWebsites()];
                    case 1:
                        list = _a.sent();
                        return [2 /*return*/, list[0]];
                }
            });
        });
    };
    ContentDeliveryAPI.prototype.getContent = function (content, forceGuid) {
        if (forceGuid === void 0) { forceGuid = false; }
        return __awaiter(this, void 0, void 0, function () {
            var useGuid, serviceUrl;
            var _this = this;
            return __generator(this, function (_a) {
                if (!(content && (content.guidValue || content.url))) {
                    if (this.config.enableDebug) {
                        console.warn('Loading content for an empty reference ', content);
                    }
                    return [2 /*return*/, null];
                }
                useGuid = content.guidValue ? this.config.preferGuid || forceGuid : false;
                if (useGuid) {
                    serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + content.guidValue);
                }
                else {
                    try {
                        serviceUrl = new URL(this.config.epiBaseUrl +
                            (content.url ? content.url : this.componentService + ContentLink_1.ContentLinkService.createApiId(content)));
                    }
                    catch (e) {
                        serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + ContentLink_1.ContentLinkService.createApiId(content));
                    }
                }
                //serviceUrl.searchParams.append('currentPageUrl', this.pathProvider.getCurrentPath());
                if (this.config.autoExpandRequests) {
                    serviceUrl.searchParams.append('expand', '*');
                }
                return [2 /*return*/, this.doRequest(serviceUrl.href).catch(function (r) {
                        return _this.buildNetworkError(r);
                    }).then(function (r) { return getIContentFromPathResponse(r); })];
            });
        });
    };
    ContentDeliveryAPI.prototype.getContentsByRefs = function (refs) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceUrl;
            return __generator(this, function (_a) {
                if (!refs || refs.length == 0) {
                    return [2 /*return*/, Promise.resolve([])];
                }
                serviceUrl = new URL(this.config.epiBaseUrl + this.componentService);
                serviceUrl.searchParams.append('references', refs.join(','));
                if (this.config.autoExpandRequests) {
                    serviceUrl.searchParams.append('expand', '*');
                }
                return [2 /*return*/, this.doRequest(serviceUrl.href).catch(function (r) {
                        return [];
                    })];
            });
        });
    };
    ContentDeliveryAPI.prototype.getContentByRef = function (ref) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceUrl;
            var _this = this;
            return __generator(this, function (_a) {
                serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + ref);
                if (this.config.autoExpandRequests) {
                    serviceUrl.searchParams.append('expand', '*');
                }
                return [2 /*return*/, this.doRequest(serviceUrl.href).catch(function (r) {
                        return _this.buildNetworkError(r);
                    })];
            });
        });
    };
    ContentDeliveryAPI.prototype.getContentByPath = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceUrl;
            var _this = this;
            return __generator(this, function (_a) {
                serviceUrl = new URL(this.config.epiBaseUrl + path);
                if (this.config.autoExpandRequests) {
                    serviceUrl.searchParams.append('expand', '*');
                }
                //serviceUrl.searchParams.append('currentPageUrl', this.pathProvider.getCurrentPath());
                return [2 /*return*/, this.doRequest(serviceUrl.href).catch(function (r) {
                        return _this.buildNetworkError(r, path);
                    })];
            });
        });
    };
    ContentDeliveryAPI.prototype.getContentChildren = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var itemId, serviceUrl;
            return __generator(this, function (_a) {
                itemId = ContentLink_1.ContentLinkService.createApiId(id);
                serviceUrl = new URL(this.config.epiBaseUrl + this.componentService + itemId + '/children');
                if (this.config.autoExpandRequests) {
                    serviceUrl.searchParams.append('expand', '*');
                }
                return [2 /*return*/, this.doRequest(serviceUrl.href).catch(function (r) {
                        return [];
                    })];
            });
        });
    };
    ContentDeliveryAPI.prototype.getContentAncestors = function (link) {
        return __awaiter(this, void 0, void 0, function () {
            var itemId, serviceUrl;
            return __generator(this, function (_a) {
                itemId = ContentLink_1.ContentLinkService.createApiId(link);
                serviceUrl = new URL("" + this.config.epiBaseUrl + this.componentService + itemId + "/ancestors");
                if (this.config.autoExpandRequests) {
                    serviceUrl.searchParams.append('expand', '*');
                }
                return [2 /*return*/, this.doRequest(serviceUrl.href).catch(function (r) {
                        return [];
                    })];
            });
        });
    };
    /**
     * Perform the actual request
     *
     * @param url The URL to request the data from
     * @param options The Request options to use
     */
    ContentDeliveryAPI.prototype.doRequest = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var urlObj;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isDisabled()) {
                    return [2 /*return*/, Promise.reject('The Content Delivery API has been disabled')];
                }
                if (this.isInEditMode()) {
                    urlObj = new URL(url);
                    urlObj.searchParams.append('epieditmode', 'True');
                    //Add channel...
                    //Add project...
                    urlObj.searchParams.append('preventCache', Math.round(Math.random() * 100000000).toString());
                    url = urlObj.href;
                }
                options = options ? options : this.getRequestSettings();
                if (this.debug)
                    console.debug('Requesting: ' + url);
                options.url = url;
                return [2 /*return*/, axios_1.default.request(options)
                        .then(function (response) {
                        if (_this.debug)
                            console.debug("Response from " + url + ":", response.data);
                        return response.data;
                    })
                        .catch(function (reason) {
                        if (_this.debug)
                            console.error("Response from " + url + ": HTTP Fetch error ", reason);
                        throw reason;
                    })];
            });
        });
    };
    ContentDeliveryAPI.prototype.getMethodServiceUrl = function (content, method) {
        var contentUrl = this.config.epiBaseUrl;
        contentUrl = contentUrl + this.methodService;
        contentUrl = contentUrl + content.guidValue + '/' + method;
        return contentUrl;
    };
    /**
     * Build the request parameters needed to perform the call to the Content Delivery API
     *
     * @param verb The verb for the generated configuration
     */
    ContentDeliveryAPI.prototype.getRequestSettings = function (verb) {
        var options = {
            method: verb ? verb : 'get',
            baseURL: this.config.epiBaseUrl,
            withCredentials: true,
            headers: __assign({}, this.getHeaders()),
            transformRequest: [
                function (data, headers) {
                    if (data) {
                        headers['Content-Type'] = 'application/json';
                        return JSON.stringify(data);
                    }
                    return data;
                },
            ],
            responseType: 'json',
        };
        if (this.config.networkAdapter) {
            options.adapter = this.config.networkAdapter;
        }
        return options;
    };
    ContentDeliveryAPI.prototype.getHeaders = function (customHeaders) {
        var defaultHeaders = {
            Accept: 'application/json',
            'Accept-Language': this.config.defaultLanguage,
        };
        if (!customHeaders)
            return defaultHeaders;
        return __assign(__assign({}, defaultHeaders), customHeaders);
    };
    ContentDeliveryAPI.IsActionResponse = function (response) {
        if (response &&
            response.responseType &&
            response.responseType == ActionResponse_1.ResponseType.ActionResult) {
            return true;
        }
        return false;
    };
    ContentDeliveryAPI.prototype.buildNetworkError = function (reason, path) {
        if (path === void 0) { path = ''; }
        var errorId = ++this.counter;
        return {
            name: {
                propertyDataType: 'String',
                value: 'Error',
            },
            contentType: ['Errors', 'NetworkError'],
            contentLink: {
                guidValue: '',
                id: errorId,
                providerName: 'ContentDeliveryAPI_Errors',
                url: path,
                workId: 0,
            },
            error: {
                propertyDataType: 'Unknown',
                value: '',
            },
        };
    };
    return ContentDeliveryAPI;
}());
exports.default = ContentDeliveryAPI;
