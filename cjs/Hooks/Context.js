"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCmsState = exports.useStore = exports.useEvents = exports.useServerSideRendering = exports.useForceUpdate = exports.useContentDeliveryAPI = exports.useIContentSchema = exports.useIContentRepository = exports.useServiceContainer = exports.useEpiserver = exports.Episerver = void 0;
const react_1 = require("react");
/**
 * The React Context object for the Episerver context
 *
 * @constant { Context<IEpiserverContext | undefined> } Episerver
 */
exports.Episerver = react_1.createContext(undefined);
exports.default = exports.Episerver;
/**
 * React Hook (for functional components) to retrieve the Episerver Context from
 * the nearest Provider in the virtual dom.
 *
 * @returns  { IEpiserverContext }
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
 * @returns  { IServiceContainer }
 */
function useServiceContainer() {
    return useEpiserver().serviceContainer;
}
exports.useServiceContainer = useServiceContainer;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Repository
 * from the nearest Provider in the virtual dom
 */
function useIContentRepository() {
    return useServiceContainer().getService("IContentRepository_V2" /* IContentRepository_V2 */);
}
exports.useIContentRepository = useIContentRepository;
/**
 * Allow access to the current schema definition
 *
 * @returns The current schema descriptor
 */
function useIContentSchema() {
    return useServiceContainer().getService("SchemaInfo" /* SchemaInfo */);
}
exports.useIContentSchema = useIContentSchema;
/**
 * React Hook (for functional components) to retrieve the Episerver Content Delivery API
 * from the nearest Provider in the virtual dom
 */
function useContentDeliveryAPI() {
    return useServiceContainer().getService("IContentDeliveryAPI" /* ContentDeliveryAPI_V2 */);
}
exports.useContentDeliveryAPI = useContentDeliveryAPI;
/**
 * Force update hook, returns a force-update method, which
 * will trigger a state change of the component.
 */
function useForceUpdate() {
    const [value, setValue] = react_1.useState(0); // integer state
    return () => setValue(value + 1); // update the state to force render
}
exports.useForceUpdate = useForceUpdate;
/**
 * Obtain access to the Server Context, either as static information for hydrating the
 * page client side or rendering it on the server side.
 *
 * @returns The Server Context of the current environment
 */
function useServerSideRendering() {
    return useServiceContainer().getService("ServerContext" /* ServerContext */);
}
exports.useServerSideRendering = useServerSideRendering;
/**
 * Allow access to the global event engine, for globally distributed events.
 *
 * @returns The event engine
 */
function useEvents() {
    return useServiceContainer().getService("EventEngine" /* EventEngine */);
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