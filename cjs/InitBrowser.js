"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitBrowser = void 0;
const react_dom_1 = require("react-dom");
const react_1 = require("react");
const CmsSite_1 = require("./Components/CmsSite");
const Spa_1 = require("./Spa");
const ComponentPreLoader_1 = require("./Loaders/ComponentPreLoader");
const DefaultServiceContainer_1 = require("./Core/DefaultServiceContainer");
function InitBrowser(config, containerId, serviceContainer) {
    try {
        if ((__INITIAL_DATA__ === null || __INITIAL_DATA__ === void 0 ? void 0 : __INITIAL_DATA__.status) === 'loading') {
            __INITIAL_DATA__.onReady = () => _doInitBrowser(config, containerId, serviceContainer);
            return;
        }
    }
    catch (e) {
        // Ignore on purpose
    }
    return _doInitBrowser(config, containerId, serviceContainer);
}
exports.InitBrowser = InitBrowser;
function _doInitBrowser(config, containerId, serviceContainer) {
    Spa_1.default.init(config, serviceContainer || new DefaultServiceContainer_1.default());
    const container = document.getElementById(containerId ? containerId : "epi-page-container");
    if (container && container.childElementCount > 0) {
        const components = Spa_1.default.config().preLoadComponents || [];
        if (Spa_1.default.isDebugActive())
            console.info('Hydrating existing render, Stage 1. Preloading components ...', components);
        const loader = Spa_1.default.componentLoader();
        ComponentPreLoader_1.default.load(components, loader).finally(() => {
            if (Spa_1.default.isDebugActive())
                console.info('Hydrating existing render, Stage 2. Hydration ...');
            react_dom_1.default.hydrate(react_1.default.createElement(CmsSite_1.default, { context: Spa_1.default }), container);
        });
    }
    else {
        if (Spa_1.default.isDebugActive())
            console.info('Building new application');
        react_dom_1.default.render(react_1.default.createElement(CmsSite_1.default, { context: Spa_1.default }), container);
    }
}
exports.default = InitBrowser;
//# sourceMappingURL=InitBrowser.js.map