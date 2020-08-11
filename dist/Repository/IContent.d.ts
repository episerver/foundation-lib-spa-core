import IContentModel from '../Models/IContent';
import { RepositoryAction, DispatchableMethod } from './AbstractRepostory';
import ContentDeliveryAPI from '../ContentDeliveryAPI';
import Website from '../Models/Website';
import IContent from '../Models/IContent';
import WebsiteList from '../Models/WebsiteList';
export declare type PartialStateWithIContentRepoState = {
    iContentRepo: IContentRepoState;
};
/**
 * Descriptor of the state tree managed by this reducer
 */
export declare type IContentRepoState = {
    ids: string[];
    paths: IContentRepoItemIdByReference;
    items: IContentRepoItemById;
    refs: IContentRepoItemIdByReference;
    guids: IContentRepoItemIdByReference;
    isFetching: boolean;
    error: string | null;
    website: Website | null;
    websites: WebsiteList;
};
/**
 * Descriptor af an data entry in the tree of this reducer
 */
interface IContentRepoItem {
    id: string;
    path: string;
    content: IContentModel;
}
interface IContentRepoItemById {
    [key: string]: IContentRepoItem;
}
/**
 * Index to quickly find a content item by a string value
 * such as path, reference or guid
 */
interface IContentRepoItemIdByReference {
    [ref: string]: string;
}
/**
 * Action data type for this reducer
 */
export interface IContentBaseAction<T> extends RepositoryAction<IContentRepoActions, T> {
}
export interface IContentAction extends IContentBaseAction<IContentModel> {
}
export interface WebsiteListAction extends IContentBaseAction<WebsiteList> {
}
export interface WebsiteAction extends IContentBaseAction<Website> {
}
declare enum IContentRepoActions {
    INIT = "@@EPI/INIT",
    ADD_ITEM = "ADD_ICONTENT_ITEM",
    UPDATE_ITEM = "UPDATE_ICONTENT_ITEM",
    ADD_OR_UPDATE_ITEM = "ADD_UPDATE_ICONTENT_ITEM",
    REMOVE_ITEM = "REMOVE_ICONTENT_ITEM",
    START_FETCH = "START_ICONTENT_FETCH",
    FINISH_FETCH_SUCCESS = "FINISH_ICONTENT_FETCH_SUCCESS",
    FINISH_FETCH_ERROR = "FINISH_ICONTENT_FETCH_ERROR",
    REPLACE_WEBSITES = "ICONTENT_REPLACE_WEBSITES",
    SET_CURRENT_WEBSITE = "ICONTENT_SET_CURRENT_WEBSITE",
    REGISTER_PATH = "ICONTENT_REGISTER_PATH",
    UPDATE_ITEM_PROPERTY = "ICONTENT_UPDATE_ITEM_PROPERTY"
}
export declare class IContentActionFactory {
    static addItem(item: IContentModel): IContentAction;
    static updateItem(item: IContentModel): IContentAction;
    static addOrUpdateItem(item: IContentModel): IContentAction;
    static removeItem(item: IContentModel): IContentAction;
    static startFetch(): IContentAction;
    static finishFetch(): IContentAction;
    static fetchError(error: any): IContentAction;
    static replaceWebsites(websites: WebsiteList): WebsiteListAction;
    static setCurrentWebsite(website: Website): WebsiteAction;
    static registerPaths(content: IContent, paths: string[]): IContentAction;
    static updateContentProperty(content: IContent, property: string, value: any): IContentAction;
}
export default class IContentRepository {
    static StateKey: string;
    static ContentDeliveryAPI: ContentDeliveryAPI;
    protected static getMyState(state: any): Readonly<IContentRepoState>;
    /**
     * Build the dispatchable action that will resolve the IContentModel based upon
     * the provided path.
     *
     * @param path  The path to resolve the content for
     */
    static getByPath(path: string): DispatchableMethod<Promise<IContentModel>>;
    static getByReference(ref: string): DispatchableMethod<Promise<IContentModel>>;
    static getById(id: string): DispatchableMethod<Promise<IContentModel>>;
    static getCurrentWebsite(): DispatchableMethod<Promise<Website>>;
    protected static getIContentId(iContent: IContentModel): string;
    static reducer(state: Readonly<IContentRepoState>, action: IContentBaseAction<any>): IContentRepoState;
    protected static updateIContentProperty(content: IContent, state: Readonly<IContentRepoState>, property: string, value: any): IContentRepoState;
    protected static setCurrentWebsite(website: Website, state: Readonly<IContentRepoState>): IContentRepoState;
    /**
     * Add or update an iContent item within the store, it returns a modified copy of the store (i.e. the
     * provided store will be treated as an immuatable variable).
     *
     * @param   iContent    The iContent item to add to or update within the store
     * @param   state       The current store
     * @returns The mutated copy of the store
     */
    protected static addIContentToState(iContent: IContentModel, state: Readonly<IContentRepoState>, ref?: string, paths?: string[]): IContentRepoState;
    /**
     * Generate the initial context, loading & merging data from the various available sources.
     */
    protected static buildInitialContext(): IContentRepoState;
    protected static getInitialIContent(): IContent;
    protected static getInitialStartPage(): IContent;
    protected static getInitialWebsite(): Website;
}
export {};
