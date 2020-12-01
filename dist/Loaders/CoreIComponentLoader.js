var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    load(componentName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.debug)
                console.debug(`Loading component: ${componentName}`);
            const me = this;
            const component = componentName.substr(15);
            return import(
            /* webpackInclude: /\.tsx$/ */
            /* webpackExclude: /\.noimport\.tsx$/ */
            /* webpackChunkName: "components" */
            /* webpackMode: "lazy" */
            "app/Components/" + component) // Can't use the constant here, as it will Prevent Webpack from properly loading the component
                .then(exports => {
                if (!(exports && exports.default))
                    throw new Error(`The component ${componentName} does not have a default export`);
                const c = exports.default;
                if (me.debug)
                    console.debug(`Finished loading component: ${componentName}`, c);
                return c;
            });
        });
    }
    setDebug(debug) {
        this.debug = debug;
    }
}
