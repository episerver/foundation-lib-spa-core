"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
class CoreIComponentLoader {
    constructor() {
        this.debug = false;
    }
    get PREFIX() {
        return "app/Components/";
    }
    get order() {
        return 100;
    }
    canLoad(componentName) {
        return componentName.startsWith(this.PREFIX);
    }
    load(componentName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.debug)
                console.debug(`Loading component: ${componentName}`);
            const component = componentName.substr(15);
            // We would want to add webpackPrefetch: true, yet with larger projects, the prefetching eats all concurrent connections and delaying the page
            return Promise.resolve().then(() => require(
            /* webpackInclude: /\.tsx$/ */
            /* webpackExclude: /\.noimport\.tsx$/ */
            /* webpackChunkName: "components" */
            /* webpackMode: "lazy" */
            "app/Components/" + component)).then(exports => {
                if (!(exports && exports.default))
                    throw new Error(`The component ${componentName} does not have a default export`);
                const c = exports.default;
                if (this.debug)
                    console.debug(`Finished loading component: ${componentName}`, c);
                return c;
            });
        });
    }
    setDebug(debug) {
        this.debug = debug;
    }
}
exports.default = CoreIComponentLoader;
//# sourceMappingURL=CoreIComponentLoader.js.map