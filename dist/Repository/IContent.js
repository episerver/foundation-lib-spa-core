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
exports.IContentActionFactory = void 0;
var ContentDeliveryAPI_1 = require("../ContentDeliveryAPI");
var Spa_1 = __importDefault(require("../Spa"));
var ContentLink_1 = require("../Models/ContentLink");
var ServerContext_1 = require("../ServerSideRendering/ServerContext");
var merge_1 = __importDefault(require("lodash/merge"));
var IContentRepoActions;
(function (IContentRepoActions) {
    IContentRepoActions["INIT"] = "@@EPI/INIT";
    IContentRepoActions["ADD_ITEM"] = "ADD_ICONTENT_ITEM";
    IContentRepoActions["UPDATE_ITEM"] = "UPDATE_ICONTENT_ITEM";
    IContentRepoActions["ADD_OR_UPDATE_ITEM"] = "ADD_UPDATE_ICONTENT_ITEM";
    IContentRepoActions["REMOVE_ITEM"] = "REMOVE_ICONTENT_ITEM";
    IContentRepoActions["START_FETCH"] = "START_ICONTENT_FETCH";
    IContentRepoActions["FINISH_FETCH_SUCCESS"] = "FINISH_ICONTENT_FETCH_SUCCESS";
    IContentRepoActions["FINISH_FETCH_ERROR"] = "FINISH_ICONTENT_FETCH_ERROR";
    IContentRepoActions["REPLACE_WEBSITES"] = "ICONTENT_REPLACE_WEBSITES";
    IContentRepoActions["SET_CURRENT_WEBSITE"] = "ICONTENT_SET_CURRENT_WEBSITE";
    IContentRepoActions["REGISTER_PATH"] = "ICONTENT_REGISTER_PATH";
    IContentRepoActions["UPDATE_ITEM_PROPERTY"] = "ICONTENT_UPDATE_ITEM_PROPERTY";
})(IContentRepoActions || (IContentRepoActions = {}));
var IContentActionFactory = /** @class */ (function () {
    function IContentActionFactory() {
    }
    IContentActionFactory.addItem = function (item) {
        return {
            type: IContentRepoActions.ADD_ITEM,
            item: item,
        };
    };
    IContentActionFactory.updateItem = function (item) {
        return {
            type: IContentRepoActions.UPDATE_ITEM,
            item: item,
        };
    };
    IContentActionFactory.addOrUpdateItem = function (item) {
        return {
            type: IContentRepoActions.ADD_OR_UPDATE_ITEM,
            item: item,
        };
    };
    IContentActionFactory.removeItem = function (item) {
        return {
            type: IContentRepoActions.REMOVE_ITEM,
            item: item,
        };
    };
    IContentActionFactory.startFetch = function () {
        return {
            type: IContentRepoActions.START_FETCH,
        };
    };
    IContentActionFactory.finishFetch = function () {
        return {
            type: IContentRepoActions.FINISH_FETCH_SUCCESS,
        };
    };
    IContentActionFactory.fetchError = function (error) {
        return {
            type: IContentRepoActions.FINISH_FETCH_ERROR,
        };
    };
    IContentActionFactory.replaceWebsites = function (websites) {
        return {
            type: IContentRepoActions.REPLACE_WEBSITES,
            item: websites,
        };
    };
    IContentActionFactory.setCurrentWebsite = function (website) {
        return {
            type: IContentRepoActions.SET_CURRENT_WEBSITE,
            item: website,
        };
    };
    IContentActionFactory.registerPaths = function (content, paths) {
        return {
            type: IContentRepoActions.REGISTER_PATH,
            item: content,
            args: [paths],
        };
    };
    IContentActionFactory.updateContentProperty = function (content, property, value) {
        return {
            type: IContentRepoActions.UPDATE_ITEM_PROPERTY,
            item: content,
            args: [property, value],
        };
    };
    return IContentActionFactory;
}());
exports.IContentActionFactory = IContentActionFactory;
// tslint:disable-next-line: max-classes-per-file
var IContentRepository = /** @class */ (function () {
    function IContentRepository() {
    }
    IContentRepository.getMyState = function (state) {
        return state[this.StateKey];
    };
    /**
     * Build the dispatchable action that will resolve the IContentModel based upon
     * the provided path.
     *
     * @param path  The path to resolve the content for
     */
    IContentRepository.getByPath = function (path) {
        var _this = this;
        return function (dispatch, getState) { return __awaiter(_this, void 0, void 0, function () {
            var state, itemId, iContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        state = this.getMyState(getState());
                        if (state.isFetching)
                            return [2 /*return*/, Promise.reject('Already fetching content')];
                        // First check by path
                        if (state.paths && state.paths[path]) {
                            itemId = state.paths[path];
                            return [2 /*return*/, Promise.resolve(state.items[itemId].content)];
                        }
                        return [4 /*yield*/, this.ContentDeliveryAPI.getContentByPath(path)];
                    case 1:
                        iContent = _a.sent();
                        if (ContentDeliveryAPI_1.PathResponseIsIContent(iContent)) {
                            dispatch(IContentActionFactory.addOrUpdateItem(iContent));
                            return [2 /*return*/, iContent];
                        }
                        return [2 /*return*/, Promise.reject('Path is not iContent')];
                }
            });
        }); };
    };
    IContentRepository.getByReference = function (ref) {
        var _this = this;
        return function (dispatch, getState) {
            var state = _this.getMyState(getState());
            if (!state.refs[ref]) {
                return Promise.reject("Unknown reference " + ref);
            }
            return dispatch(_this.getById(state.refs[ref]));
        };
    };
    IContentRepository.getById = function (id) {
        var _this = this;
        return function (dispatch, getState) { return __awaiter(_this, void 0, void 0, function () {
            var state, iContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        state = this.getMyState(getState());
                        if (state.items && state.items[id]) {
                            return [2 /*return*/, state.items[id].content];
                        }
                        return [4 /*yield*/, this.ContentDeliveryAPI.getContentByRef(id)];
                    case 1:
                        iContent = _a.sent();
                        dispatch(IContentActionFactory.addOrUpdateItem(iContent));
                        return [2 /*return*/, iContent];
                }
            });
        }); };
    };
    IContentRepository.getCurrentWebsite = function () {
        var _this = this;
        return function (dispatch, getState) { return __awaiter(_this, void 0, void 0, function () {
            var websites, website;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ContentDeliveryAPI.getWebsites()];
                    case 1:
                        websites = _a.sent();
                        dispatch(IContentActionFactory.replaceWebsites(websites));
                        website = websites[0];
                        dispatch(IContentActionFactory.setCurrentWebsite(website));
                        return [2 /*return*/, website];
                }
            });
        }); };
    };
    IContentRepository.getIContentId = function (iContent) {
        return ContentLink_1.ContentLinkService.createApiId(iContent.contentLink);
    };
    IContentRepository.reducer = function (state, action) {
        var isSystemAction = action.type.substr(0, 2) == '@@';
        switch (action.type) {
            case IContentRepoActions.INIT:
                return this.buildInitialContext();
            case IContentRepoActions.START_FETCH:
                return __assign(__assign({}, state), { isFetching: true });
            case IContentRepoActions.FINISH_FETCH_ERROR:
                return __assign(__assign({}, state), { isFetching: false, error: action.error || null });
            case IContentRepoActions.FINISH_FETCH_SUCCESS:
                return __assign(__assign({}, state), { isFetching: false, error: null });
            case IContentRepoActions.ADD_OR_UPDATE_ITEM:
                return this.addIContentToState(action.item, state);
            case IContentRepoActions.REPLACE_WEBSITES:
                return __assign(__assign({}, state), { websites: action.item });
            case IContentRepoActions.SET_CURRENT_WEBSITE:
                return this.setCurrentWebsite(action.item, state);
            case IContentRepoActions.REGISTER_PATH:
                return this.addIContentToState(action.item, state, undefined, action.args ? action.args[0] : []);
            case IContentRepoActions.UPDATE_ITEM_PROPERTY:
                return this.updateIContentProperty(action.item, state, action.args ? action.args[0] : '', action.args ? action.args[1] : undefined);
            default:
                if (!isSystemAction && Spa_1.default.isDebugActive()) {
                    console.debug('No action specified within the iContent Repo for', action.type);
                }
                break;
        }
        return Object.assign({}, state);
    };
    IContentRepository.updateIContentProperty = function (content, state, property, value) {
        var contentId = ContentLink_1.ContentLinkService.createApiId(content.contentLink);
        var toMerge = { items: {} };
        toMerge.items[contentId] = { content: {} };
        toMerge.items[contentId].content[property] = { value: value };
        var newState = merge_1.default({}, state, toMerge);
        console.log("Updated content", property, newState.items[contentId].content);
        return newState;
    };
    IContentRepository.setCurrentWebsite = function (website, state) {
        var refs = __assign({}, state.refs);
        for (var name_1 in website.contentRoots) {
            refs[name_1] = ContentLink_1.ContentLinkService.createApiId(website.contentRoots[name_1]);
        }
        return __assign(__assign({}, state), { website: website, refs: refs });
    };
    /**
     * Add or update an iContent item within the store, it returns a modified copy of the store (i.e. the
     * provided store will be treated as an immuatable variable).
     *
     * @param   iContent    The iContent item to add to or update within the store
     * @param   state       The current store
     * @returns The mutated copy of the store
     */
    IContentRepository.addIContentToState = function (iContent, state, ref, paths) {
        var newPartialState = {
            items: Object.assign({}, state.items),
            ids: Object.assign([], state.ids),
            guids: Object.assign({}, state.guids),
            paths: Object.assign({}, state.paths),
            refs: Object.assign({}, state.refs),
        };
        var id = this.getIContentId(iContent);
        var path = iContent.contentLink.url;
        var guid = iContent.contentLink.guidValue;
        newPartialState.items[id] = {
            content: iContent,
            id: id,
            path: path,
        };
        if (newPartialState.ids.indexOf(id) < 0) {
            newPartialState.ids.push(id);
        }
        if (path)
            newPartialState.paths[path] = id;
        if (paths)
            for (var pathIdx in paths) {
                newPartialState.paths[paths[pathIdx]] = id;
            }
        if (guid)
            newPartialState.guids[guid] = id;
        if (ref)
            newPartialState.refs[ref] = id;
        if (Spa_1.default.isDebugActive())
            console.log('Adding content to state', iContent.contentLink, newPartialState);
        return Object.assign({}, state, newPartialState);
    };
    /**
     * Generate the initial context, loading & merging data from the various available sources.
     */
    IContentRepository.buildInitialContext = function () {
        if (Spa_1.default.isDebugActive())
            console.debug('Initializing IContent state');
        var initialContext = {
            items: {},
            ids: [],
            paths: {},
            isFetching: false,
            error: null,
            refs: {},
            guids: {},
            website: null,
            websites: [],
        };
        try {
            var initialIContent = this.getInitialIContent();
            var initialStartPage = this.getInitialStartPage();
            var initialWebsite = this.getInitialWebsite();
            initialContext = this.addIContentToState(initialIContent, initialContext);
            initialContext = this.addIContentToState(initialStartPage, initialContext, 'startPage', ['/']);
            initialContext.website = initialWebsite;
            initialContext.websites = [initialWebsite];
            for (var name_2 in initialWebsite.contentRoots)
                if (initialWebsite.contentRoots.hasOwnProperty(name_2)) {
                    var contentLink = initialWebsite.contentRoots[name_2];
                    if (!initialContext.refs[name_2])
                        initialContext.refs[name_2] = ContentLink_1.ContentLinkService.createApiId(contentLink);
                }
        }
        catch (ex) {
            if (Spa_1.default.isDebugActive())
                console.warn('Not loading initial data', ex);
        }
        return initialContext;
    };
    IContentRepository.getInitialIContent = function () {
        if (ServerContext_1.isSerializedIContent(__INITIAL__DATA__.IContent)) {
            return JSON.parse(__INITIAL__DATA__.IContent);
        }
        return __INITIAL__DATA__.IContent;
    };
    IContentRepository.getInitialStartPage = function () {
        if (ServerContext_1.isSerializedIContent(__INITIAL__DATA__.StartPageData)) {
            return JSON.parse(__INITIAL__DATA__.StartPageData);
        }
        return __INITIAL__DATA__.StartPageData;
    };
    IContentRepository.getInitialWebsite = function () {
        if (ServerContext_1.isSerializedWebsite(__INITIAL__DATA__.Website)) {
            return JSON.parse(__INITIAL__DATA__.Website);
        }
        return __INITIAL__DATA__.Website;
    };
    IContentRepository.StateKey = 'iContentRepo';
    return IContentRepository;
}());
exports.default = IContentRepository;
