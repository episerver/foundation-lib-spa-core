"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitBrowser = void 0;
const tslib_1 = require("tslib");
const react_dom_1 = require("react-dom");
const react_1 = require("react");
const CmsSite_1 = require("./Components/CmsSite");
const AppGlobal_1 = require("./AppGlobal");
const Spa_1 = require("./Spa");
const ComponentPreLoader_1 = require("./Loaders/ComponentPreLoader");
const DefaultServiceContainer_1 = require("./Core/DefaultServiceContainer");
function InitBrowser(config, containerId, serviceContainer, preload) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // First we wait untill the browser has created the intial data object
        yield whenInitialDataReady();
        // the we create the context and resolve the container object
        const ctx = yield whenContextReady(config, serviceContainer);
        // Now load the schema and get the render target
        const [, container] = yield Promise.all([
            whenSchemaReady(ctx),
            whenContainerReady(ctx, containerId)
        ]);
        // With the context & schema, determine the rendering function
        const renderer = yield whenRendererSelected(ctx, container, preload);
        // Now start the application
        return startSpa(renderer, container, ctx);
    });
}
exports.InitBrowser = InitBrowser;
function whenSchemaReady(ctx) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (ctx.isDebugActive())
            console.debug("Awaiting IContent Schema");
        const container = yield ctx.serviceContainer.getService("SchemaInfo" /* SchemaInfo */).whenReady;
        if (ctx.isDebugActive())
            console.debug("IContent Schema ready");
        return container;
    });
}
function whenInitialDataReady() {
    return new Promise((resolve, reject) => {
        var _a;
        try {
            const glbl = AppGlobal_1.default();
            if (((_a = glbl.__INITIAL__DATA__) === null || _a === void 0 ? void 0 : _a.status) === 'loading')
                glbl.__INITIAL__DATA__.onReady = () => resolve();
            else
                resolve();
        }
        catch (e) {
            reject(e);
        }
    });
}
function whenContainerReady(ctx, containerId) {
    return new Promise((resolve, reject) => {
        if (ctx.isDebugActive())
            console.debug('Looking for container element with id:', containerId);
        try {
            let container = document.getElementById(containerId ? containerId : "epi-page-container");
            if (!container) {
                if (ctx.isDebugActive())
                    console.debug('No container element found, generating and injecting new one');
                container = document.createElement("div");
                container.id = "epi-page-container";
                document.body.append(container);
            }
            resolve(container);
        }
        catch (e) {
            reject(e);
        }
    });
}
function whenContextReady(config, serviceContainer) {
    return new Promise((resolve, reject) => {
        try {
            if ((config === null || config === void 0 ? void 0 : config.enableDebug) === true)
                console.debug('Initializing Optimizely Content Cloud');
            Spa_1.default.init(config, serviceContainer || new DefaultServiceContainer_1.default());
            return resolve(Spa_1.default);
        }
        catch (e) {
            reject(e);
        }
    });
}
function whenRendererSelected(ctx, container, preload) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (ctx.isDebugActive())
            console.debug('Selecting Renderer');
        if (container.childElementCount > 0) {
            if (ctx.isDebugActive())
                console.debug('Elements in container, preloading components');
            try {
                if (!preload)
                    yield ComponentPreLoader_1.default.load(ctx.config().preLoadComponents || [], ctx.componentLoader());
                else
                    yield ComponentPreLoader_1.default.loadComponents(preload, ctx.componentLoader());
                if (ctx.isDebugActive())
                    console.debug('Elements in container, select ReactDOM.hydrate');
                return react_dom_1.default.hydrate;
            }
            catch (e) {
                if (ctx.isDebugActive())
                    console.warn('Error while preloadinging components, fallback to ReactDOM.render', e);
                return react_dom_1.default.render;
            }
        }
        if (ctx.isDebugActive())
            console.debug('Empty container, select: ReactDOM.render');
        return react_dom_1.default.render;
    });
}
function startSpa(render, container, ctx) {
    return new Promise((resolve, reject) => {
        try {
            if (ctx.isDebugActive())
                console.debug('Start application');
            render(react_1.default.createElement(CmsSite_1.default, { context: ctx }), container);
            resolve();
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.default = InitBrowser;
//# sourceMappingURL=InitBrowser.js.map