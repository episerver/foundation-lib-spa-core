"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_dom_1 = __importDefault(require("react-dom"));
const react_1 = __importDefault(require("react"));
const CmsSite_1 = __importDefault(require("./Components/CmsSite"));
const Spa_1 = __importDefault(require("./Spa"));
const ComponentPreLoader_1 = __importDefault(require("./Loaders/ComponentPreLoader"));
const DefaultServiceContainer_1 = __importDefault(require("./Core/DefaultServiceContainer"));
function InitBrowser(config, containerId, serviceContainer) {
    if (!serviceContainer) {
        serviceContainer = new DefaultServiceContainer_1.default();
    }
    Spa_1.default.init(config, serviceContainer);
    /*if ((new URLSearchParams(window.location.search)).get('epieditmode') !== 'True') {
        History.setupPageBinding(EpiContext);
    }*/
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
