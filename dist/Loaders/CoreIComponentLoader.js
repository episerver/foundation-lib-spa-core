export default class CoreIComponentLoader {
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
    async load(componentName) {
        if (this.debug)
            console.debug(`Loading component: ${componentName}`);
        const component = componentName.substr(15);
        return import(
        /* webpackInclude: /\.tsx$/ */
        /* webpackExclude: /\.noimport\.tsx$/ */
        /* webpackChunkName: "components" */
        /* webpackPrefetch: true */
        /* webpackMode: "lazy-once" */
        "app/Components/" + component) // Can't use the constant here, as it will Prevent Webpack from properly loading the component
            .then(exports => {
            if (!(exports && exports.default))
                throw new Error(`The component ${componentName} does not have a default export`);
            const c = exports.default;
            if (this.debug)
                console.debug(`Finished loading component: ${componentName}`, c);
            return c;
        });
    }
    setDebug(debug) {
        this.debug = debug;
    }
}
//# sourceMappingURL=CoreIComponentLoader.js.map