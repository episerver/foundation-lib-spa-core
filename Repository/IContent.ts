import IContentModel from '../Models/IContent';
import { RepositoryAction, DispatchMethod, DispatchableMethod } from './AbstractRepostory';
import { AnyAction } from 'redux';
import ContentDeliveryAPI, { PathResponseIsIContent } from '../ContentDeliveryAPI';
import EpiserverSpaContext from '../Spa';
import { ContentLinkService } from '../Models/ContentLink';
import Website from '../Models/Website';
import ServerContext, { isSerializedIContent, isSerializedWebsite } from '../ServerSideRendering/ServerContext';
import IContent from '../Models/IContent';
import WebsiteList from '../Models/WebsiteList';
import merge from 'lodash/merge';

declare var __INITIAL__DATA__: ServerContext;

export type PartialStateWithIContentRepoState =
{
  iContentRepo: IContentRepoState;
}

/**
 * Descriptor of the state tree managed by this reducer
 */
export type IContentRepoState = {
  ids: string[];
  paths: IContentRepoItemIdByReference;
  items: IContentRepoItemById;
  refs: IContentRepoItemIdByReference;
  guids: IContentRepoItemIdByReference;
  isFetching: boolean;
  error: string | null;
  website: Website | null;
  websites: WebsiteList;
}

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
export interface IContentBaseAction<T> extends RepositoryAction<IContentRepoActions, T> {}
export interface IContentAction extends IContentBaseAction<IContentModel> {}
export interface WebsiteListAction extends IContentBaseAction<WebsiteList> {}
export interface WebsiteAction extends IContentBaseAction<Website> {}

enum IContentRepoActions {
  INIT = '@@EPI/INIT',
  ADD_ITEM = 'ADD_ICONTENT_ITEM',
  UPDATE_ITEM = 'UPDATE_ICONTENT_ITEM',
  ADD_OR_UPDATE_ITEM = 'ADD_UPDATE_ICONTENT_ITEM',
  REMOVE_ITEM = 'REMOVE_ICONTENT_ITEM',
  START_FETCH = 'START_ICONTENT_FETCH',
  FINISH_FETCH_SUCCESS = 'FINISH_ICONTENT_FETCH_SUCCESS',
  FINISH_FETCH_ERROR = 'FINISH_ICONTENT_FETCH_ERROR',
  REPLACE_WEBSITES = 'ICONTENT_REPLACE_WEBSITES',
  SET_CURRENT_WEBSITE = 'ICONTENT_SET_CURRENT_WEBSITE',
  REGISTER_PATH = 'ICONTENT_REGISTER_PATH',
  UPDATE_ITEM_PROPERTY = 'ICONTENT_UPDATE_ITEM_PROPERTY',
}

export class IContentActionFactory {
  public static addItem(item: IContentModel): IContentAction {
    return {
      type: IContentRepoActions.ADD_ITEM,
      item,
    };
  }

  public static updateItem(item: IContentModel): IContentAction {
    return {
      type: IContentRepoActions.UPDATE_ITEM,
      item,
    };
  }

  public static addOrUpdateItem(item: IContentModel): IContentAction {
    return {
      type: IContentRepoActions.ADD_OR_UPDATE_ITEM,
      item,
    };
  }

  public static removeItem(item: IContentModel): IContentAction {
    return {
      type: IContentRepoActions.REMOVE_ITEM,
      item,
    };
  }

  public static startFetch(): IContentAction {
    return {
      type: IContentRepoActions.START_FETCH,
    };
  }

  public static finishFetch(): IContentAction {
    return {
      type: IContentRepoActions.FINISH_FETCH_SUCCESS,
    };
  }

  public static fetchError(error: any): IContentAction {
    return {
      type: IContentRepoActions.FINISH_FETCH_ERROR,
    };
  }

  public static replaceWebsites(websites: WebsiteList): WebsiteListAction {
    return {
      type: IContentRepoActions.REPLACE_WEBSITES,
      item: websites,
    };
  }

  public static setCurrentWebsite(website: Website): WebsiteAction {
    return {
      type: IContentRepoActions.SET_CURRENT_WEBSITE,
      item: website,
    };
  }

  public static registerPaths(content: IContent, paths: string[]): IContentAction {
    return {
      type: IContentRepoActions.REGISTER_PATH,
      item: content,
      args: [paths],
    };
  }

  public static updateContentProperty(content: IContent, property: string, value: any): IContentAction {
    return {
      type: IContentRepoActions.UPDATE_ITEM_PROPERTY,
      item: content,
      args: [property, value],
    };
  }
}

// tslint:disable-next-line: max-classes-per-file
export default class IContentRepository {
  public static StateKey: string = 'iContentRepo';
  public static ContentDeliveryAPI: ContentDeliveryAPI;

  protected static getMyState(state: any): Readonly<IContentRepoState> {
    return state[this.StateKey] as IContentRepoState;
  }

  /**
   * Build the dispatchable action that will resolve the IContentModel based upon
   * the provided path.
   *
   * @param path  The path to resolve the content for
   */
  public static getByPath(path: string): DispatchableMethod<Promise<IContentModel>> {
    return async (dispatch: DispatchMethod<Promise<IContentModel>>, getState: () => any): Promise<IContentModel> => {
      // Get state & verify that we're allowed to do this
      const state = this.getMyState(getState());
      if (state.isFetching) return Promise.reject('Already fetching content');

      // First check by path
      if (state.paths && state.paths[path]) {
        const itemId = state.paths[path];
        return Promise.resolve<IContentModel>(state.items[itemId].content);
      }

      const iContent = await this.ContentDeliveryAPI.getContentByPath(path);
      if (PathResponseIsIContent(iContent)) {
        dispatch(IContentActionFactory.addOrUpdateItem(iContent));
        return iContent;
      }
      return Promise.reject<IContentModel>('Path is not iContent');
    };
  }

  public static getByReference(ref: string): DispatchableMethod<Promise<IContentModel>> {
    return (dispatch: DispatchMethod<Promise<IContentModel>>, getState: () => any): Promise<IContentModel> => {
      const state = this.getMyState(getState());
      if (!state.refs[ref]) {
        return Promise.reject(`Unknown reference ${ref}`);
      }
      return dispatch(this.getById(state.refs[ref])) as Promise<IContentModel>;
    };
  }

  public static getById(id: string): DispatchableMethod<Promise<IContentModel>> {
    return async (dispatch: DispatchMethod<Promise<IContentModel>>, getState: () => any) => {
      const state = this.getMyState(getState());
      if (state.items && state.items[id]) {
        return state.items[id].content;
      }
      const iContent = await this.ContentDeliveryAPI.getContentByRef(id);
      dispatch(IContentActionFactory.addOrUpdateItem(iContent));
      return iContent;
    };
  }

  public static getCurrentWebsite(): DispatchableMethod<Promise<Website>> {
    return async (dispatch: DispatchMethod<Promise<Website>>, getState: () => any) => {
      const websites = await this.ContentDeliveryAPI.getWebsites();
      dispatch(IContentActionFactory.replaceWebsites(websites));
      const website = websites[0]; // @ToDo: Implement website detections
      dispatch(IContentActionFactory.setCurrentWebsite(website));
      return website;
    };
  }

  protected static getIContentId(iContent: IContentModel): string {
    return ContentLinkService.createApiId(iContent.contentLink);
  }

  public static reducer(state: Readonly<IContentRepoState>, action: IContentBaseAction<any>): IContentRepoState {
    const isSystemAction: boolean = action.type.substr(0, 2) == '@@';
    switch (action.type) {
      case IContentRepoActions.INIT:
        return this.buildInitialContext();
      case IContentRepoActions.START_FETCH:
        return { ...state, isFetching: true };
      case IContentRepoActions.FINISH_FETCH_ERROR:
        return { ...state, isFetching: false, error: action.error || null };
      case IContentRepoActions.FINISH_FETCH_SUCCESS:
        return { ...state, isFetching: false, error: null };
      case IContentRepoActions.ADD_OR_UPDATE_ITEM:
        return this.addIContentToState(action.item, state);
      case IContentRepoActions.REPLACE_WEBSITES:
        return { ...state, websites: action.item };
      case IContentRepoActions.SET_CURRENT_WEBSITE:
        return this.setCurrentWebsite(action.item, state);
      case IContentRepoActions.REGISTER_PATH:
        return this.addIContentToState(action.item, state, undefined, action.args ? action.args[0] : []);
      case IContentRepoActions.UPDATE_ITEM_PROPERTY:
        return this.updateIContentProperty(
          action.item,
          state,
          action.args ? action.args[0] : '',
          action.args ? action.args[1] : undefined,
        );
      default:
        if (!isSystemAction && EpiserverSpaContext.isDebugActive()) {
          console.debug('No action specified within the iContent Repo for', action.type);
        }
        break;
    }
    return Object.assign({}, state);
  }

  protected static updateIContentProperty(
    content: IContent,
    state: Readonly<IContentRepoState>,
    property: string,
    value: any,
  ): IContentRepoState {
    const contentId = ContentLinkService.createApiId(content.contentLink);
    const toMerge: any = { items: { } };
    toMerge.items[contentId] = { content: {} };
    toMerge.items[contentId].content[property] = { value };
    const newState = merge({}, state, toMerge) as Readonly<IContentRepoState>;
    console.log("Updated content", property, newState.items[contentId].content);
    return newState;
  }

  protected static setCurrentWebsite(website: Website, state: Readonly<IContentRepoState>): IContentRepoState {
    const refs: IContentRepoItemIdByReference = { ...state.refs };
    for (const name in website.contentRoots) {
      refs[name] = ContentLinkService.createApiId(website.contentRoots[name]);
    }
    return { ...state, website, refs };
  }

  /**
   * Add or update an iContent item within the store, it returns a modified copy of the store (i.e. the
   * provided store will be treated as an immuatable variable).
   *
   * @param   iContent    The iContent item to add to or update within the store
   * @param   state       The current store
   * @returns The mutated copy of the store
   */
  protected static addIContentToState(
    iContent: IContentModel,
    state: Readonly<IContentRepoState>,
    ref?: string,
    paths?: string[],
  ): IContentRepoState {
    const newPartialState: Pick<IContentRepoState, 'items' | 'ids' | 'guids' | 'paths' | 'refs'> = {
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
    if (path) newPartialState.paths[path] = id;
    if (paths)
      for (const pathIdx in paths) {
        newPartialState.paths[paths[pathIdx]] = id;
      }
    if (guid) newPartialState.guids[guid] = id;
    if (ref) newPartialState.refs[ref] = id;
    if (EpiserverSpaContext.isDebugActive())
      console.log('Adding content to state', iContent.contentLink, newPartialState);
    return Object.assign({}, state, newPartialState);
  }

  /**
   * Generate the initial context, loading & merging data from the various available sources.
   */
  protected static buildInitialContext() {
    if (EpiserverSpaContext.isDebugActive()) console.debug('Initializing IContent state');
    let initialContext: IContentRepoState = {
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
      for (const name in initialWebsite.contentRoots) {
        const contentLink = initialWebsite.contentRoots[name];
        initialContext.refs[name] = ContentLinkService.createApiId(contentLink);
      }
    } catch (ex) {
      if (EpiserverSpaContext.isDebugActive()) console.warn('Not loading initial data', ex);
    }

    return initialContext;
  }

  protected static getInitialIContent(): IContent {
    if (isSerializedIContent(__INITIAL__DATA__.IContent)) {
      return JSON.parse(__INITIAL__DATA__.IContent);
    }
    return __INITIAL__DATA__.IContent;
  }

  protected static getInitialStartPage(): IContent {
    if (isSerializedIContent(__INITIAL__DATA__.StartPageData)) {
      return JSON.parse(__INITIAL__DATA__.StartPageData);
    }
    return __INITIAL__DATA__.StartPageData;
  }

  protected static getInitialWebsite(): Website {
    if (isSerializedWebsite(__INITIAL__DATA__.Website)) {
      return JSON.parse(__INITIAL__DATA__.Website);
    }
    return __INITIAL__DATA__.Website;
  }
}
