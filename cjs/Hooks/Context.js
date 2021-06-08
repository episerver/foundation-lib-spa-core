"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCmsState = exports.useStore = exports.useEvents = exports.useServerSideRendering = exports.useForceUpdate = exports.useContentDeliveryAPI = exports.useIContentRepository = exports.useServiceContainer = exports.useEpiserver = exports.Episerver = void 0;
const react_1 = require("react");
/**
 * The React Context object for the Episerver context
 *
 * @constant { React.Context<IEpiserverContext | undefined> } Episerver
 */
exports.Episerver = react_1.default.createContext(undefined);
exports.default = exports.Episerver;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IEpiserverContext }
 */
function useEpiserver() {
    const myContext = react_1.useContext(exports.Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext;
}
exports.useEpiserver = useEpiserver;
/**
 * React Hook (for functional components) to retrieve the Episerver Service Container
 * from the nearest Provider in the virtual dom.
 *
 * @returns  { Core.IServiceContainer }
 */
function useServiceContainer() {
    const myContext = react_1.useContext(exports.Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer;
}
exports.useServiceContainer = useServiceContainer;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
function useIContentRepository() {
    const myContext = react_1.useContext(exports.Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer.getService("IContentRepository_V2" /* IContentRepository_V2 */);
}
exports.useIContentRepository = useIContentRepository;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
function useContentDeliveryAPI() {
    const myContext = react_1.useContext(exports.Episerver);
    if (!myContext) {
        throw new Error('There\'s no Episerver Context provider above this component.');
    }
    return myContext.serviceContainer.getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
}
exports.useContentDeliveryAPI = useContentDeliveryAPI;
/**
 * create your forceUpdate hook
 */
function useForceUpdate() {
    const [value, setValue] = react_1.useState(0); // integer state
    return () => setValue(value + 1); // update the state to force render
}
exports.useForceUpdate = useForceUpdate;
function useServerSideRendering() {
    const sc = useServiceContainer();
    return sc.getService("ServerContext" /* ServerContext */);
}
exports.useServerSideRendering = useServerSideRendering;
function useEvents() {
    const sc = useServiceContainer();
    return sc.getService("EventEngine" /* EventEngine */);
}
exports.useEvents = useEvents;
function useStore() {
    return useEpiserver().getStore();
}
exports.useStore = useStore;
function useCmsState() {
    const state = useEpiserver().getStore().getState();
    return state === null || state === void 0 ? void 0 : state.OptiContentCloud;
}
exports.useCmsState = useCmsState;
//# sourceMappingURL=Context.js.map