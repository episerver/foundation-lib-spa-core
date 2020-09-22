"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IContentActionFactory = void 0;
const ContentDeliveryAPI_1 = require("../ContentDeliveryAPI");
const Spa_1 = __importDefault(require("../Spa"));
const ContentLink_1 = require("../Models/ContentLink");
const ServerContext_1 = require("../ServerSideRendering/ServerContext");
const merge_1 = __importDefault(require("lodash/merge"));
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
class IContentActionFactory {
    static addItem(item) {
        return {
            type: IContentRepoActions.ADD_ITEM,
            item,
        };
    }
    static updateItem(item) {
        return {
            type: IContentRepoActions.UPDATE_ITEM,
            item,
        };
    }
    static addOrUpdateItem(item) {
        return {
            type: IContentRepoActions.ADD_OR_UPDATE_ITEM,
            item,
        };
    }
    static removeItem(item) {
        return {
            type: IContentRepoActions.REMOVE_ITEM,
            item,
        };
    }
    static startFetch() {
        return {
            type: IContentRepoActions.START_FETCH,
        };
    }
    static finishFetch() {
        return {
            type: IContentRepoActions.FINISH_FETCH_SUCCESS,
        };
    }
    static fetchError(error) {
        return {
            type: IContentRepoActions.FINISH_FETCH_ERROR,
        };
    }
    static replaceWebsites(websites) {
        return {
            type: IContentRepoActions.REPLACE_WEBSITES,
            item: websites,
        };
    }
    static setCurrentWebsite(website) {
        return {
            type: IContentRepoActions.SET_CURRENT_WEBSITE,
            item: website,
        };
    }
    static registerPaths(content, paths) {
        return {
            type: IContentRepoActions.REGISTER_PATH,
            item: content,
            args: [paths],
        };
    }
    static updateContentProperty(content, property, value) {
        return {
            type: IContentRepoActions.UPDATE_ITEM_PROPERTY,
            item: content,
            args: [property, value],
        };
    }
}
exports.IContentActionFactory = IContentActionFactory;
// tslint:disable-next-line: max-classes-per-file
class IContentRepository {
    static getMyState(state) {
        return state[this.StateKey];
    }
    /**
     * Build the dispatchable action that will resolve the IContentModel based upon
     * the provided path.
     *
     * @param path  The path to resolve the content for
     */
    static getByPath(path) {
        return (dispatch, getState) => __awaiter(this, void 0, void 0, function* () {
            // Get state & verify that we're allowed to do this
            const state = this.getMyState(getState());
            if (state.isFetching)
                return Promise.reject('Already fetching content');
            // First check by path
            if (state.paths && state.paths[path]) {
                const itemId = state.paths[path];
                return Promise.resolve(state.items[itemId].content);
            }
            const iContent = yield this.ContentDeliveryAPI.getContentByPath(path);
            if (ContentDeliveryAPI_1.PathResponseIsIContent(iContent)) {
                dispatch(IContentActionFactory.addOrUpdateItem(iContent));
                return iContent;
            }
            return Promise.reject('Path is not iContent');
        });
    }
    static getByReference(ref) {
        return (dispatch, getState) => {
            const state = this.getMyState(getState());
            if (!state.refs[ref]) {
                return Promise.reject(`Unknown reference ${ref}`);
            }
            return dispatch(this.getById(state.refs[ref]));
        };
    }
    static getById(id) {
        return (dispatch, getState) => __awaiter(this, void 0, void 0, function* () {
            const state = this.getMyState(getState());
            if (state.items && state.items[id]) {
                return state.items[id].content;
            }
            const iContent = yield this.ContentDeliveryAPI.getContentByRef(id);
            dispatch(IContentActionFactory.addOrUpdateItem(iContent));
            return iContent;
        });
    }
    static getCurrentWebsite() {
        return (dispatch, getState) => __awaiter(this, void 0, void 0, function* () {
            const websites = yield this.ContentDeliveryAPI.getWebsites();
            dispatch(IContentActionFactory.replaceWebsites(websites));
            const website = websites[0]; // @ToDo: Implement website detections
            dispatch(IContentActionFactory.setCurrentWebsite(website));
            return website;
        });
    }
    static getIContentId(iContent) {
        return ContentLink_1.ContentLinkService.createApiId(iContent.contentLink);
    }
    static reducer(state, action) {
        const isSystemAction = action.type.substr(0, 2) == '@@';
        switch (action.type) {
            case IContentRepoActions.INIT:
                return this.buildInitialContext();
            case IContentRepoActions.START_FETCH:
                return Object.assign(Object.assign({}, state), { isFetching: true });
            case IContentRepoActions.FINISH_FETCH_ERROR:
                return Object.assign(Object.assign({}, state), { isFetching: false, error: action.error || null });
            case IContentRepoActions.FINISH_FETCH_SUCCESS:
                return Object.assign(Object.assign({}, state), { isFetching: false, error: null });
            case IContentRepoActions.ADD_OR_UPDATE_ITEM:
                return this.addIContentToState(action.item, state);
            case IContentRepoActions.REPLACE_WEBSITES:
                return Object.assign(Object.assign({}, state), { websites: action.item });
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
    }
    static updateIContentProperty(content, state, property, value) {
        const contentId = ContentLink_1.ContentLinkService.createApiId(content.contentLink);
        const toMerge = { items: {} };
        toMerge.items[contentId] = { content: {} };
        toMerge.items[contentId].content[property] = { value };
        const newState = merge_1.default({}, state, toMerge);
        console.log("Updated content", property, newState.items[contentId].content);
        return newState;
    }
    static setCurrentWebsite(website, state) {
        const refs = Object.assign({}, state.refs);
        for (const name in website.contentRoots) {
            refs[name] = ContentLink_1.ContentLinkService.createApiId(website.contentRoots[name]);
        }
        return Object.assign(Object.assign({}, state), { website, refs });
    }
    /**
     * Add or update an iContent item within the store, it returns a modified copy of the store (i.e. the
     * provided store will be treated as an immuatable variable).
     *
     * @param   iContent    The iContent item to add to or update within the store
     * @param   state       The current store
     * @returns The mutated copy of the store
     */
    static addIContentToState(iContent, state, ref, paths) {
        const newPartialState = {
            items: Object.assign({}, state.items),
            ids: Object.assign([], state.ids),
            guids: Object.assign({}, state.guids),
            paths: Object.assign({}, state.paths),
            refs: Object.assign({}, state.refs),
        };
        const id = this.getIContentId(iContent);
        const path = iContent.contentLink.url;
        const guid = iContent.contentLink.guidValue;
        newPartialState.items[id] = {
            content: iContent,
            id,
            path,
        };
        if (newPartialState.ids.indexOf(id) < 0) {
            newPartialState.ids.push(id);
        }
        if (path)
            newPartialState.paths[path] = id;
        if (paths)
            for (const pathIdx in paths) {
                newPartialState.paths[paths[pathIdx]] = id;
            }
        if (guid)
            newPartialState.guids[guid] = id;
        if (ref)
            newPartialState.refs[ref] = id;
        if (Spa_1.default.isDebugActive())
            console.log('Adding content to state', iContent.contentLink, newPartialState);
        return Object.assign({}, state, newPartialState);
    }
    /**
     * Generate the initial context, loading & merging data from the various available sources.
     */
    static buildInitialContext() {
        if (Spa_1.default.isDebugActive())
            console.debug('Initializing IContent state');
        let initialContext = {
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
            const initialIContent = this.getInitialIContent();
            const initialStartPage = this.getInitialStartPage();
            const initialWebsite = this.getInitialWebsite();
            initialContext = this.addIContentToState(initialIContent, initialContext);
            initialContext = this.addIContentToState(initialStartPage, initialContext, 'startPage', ['/']);
            initialContext.website = initialWebsite;
            initialContext.websites = [initialWebsite];
            for (const name in initialWebsite.contentRoots)
                if (initialWebsite.contentRoots.hasOwnProperty(name)) {
                    const contentLink = initialWebsite.contentRoots[name];
                    if (!initialContext.refs[name])
                        initialContext.refs[name] = ContentLink_1.ContentLinkService.createApiId(contentLink);
                }
        }
        catch (ex) {
            if (Spa_1.default.isDebugActive())
                console.warn('Not loading initial data', ex);
        }
        return initialContext;
    }
    static getInitialIContent() {
        if (ServerContext_1.isSerializedIContent(__INITIAL__DATA__.IContent)) {
            return JSON.parse(__INITIAL__DATA__.IContent);
        }
        return __INITIAL__DATA__.IContent;
    }
    static getInitialStartPage() {
        if (ServerContext_1.isSerializedIContent(__INITIAL__DATA__.StartPageData)) {
            return JSON.parse(__INITIAL__DATA__.StartPageData);
        }
        return __INITIAL__DATA__.StartPageData;
    }
    static getInitialWebsite() {
        if (ServerContext_1.isSerializedWebsite(__INITIAL__DATA__.Website)) {
            return JSON.parse(__INITIAL__DATA__.Website);
        }
        return __INITIAL__DATA__.Website;
    }
}
exports.default = IContentRepository;
IContentRepository.StateKey = 'iContentRepo';
