// Core interfaces
import { BaseInitializableModule } from '../Core/IInitializableModule';
import RoutedComponent from '../Components/RoutedComponent';
export default class RoutingModule extends BaseInitializableModule {
    constructor() {
        super(...arguments);
        this.name = "Episerver CMS Routing";
        this.SortOrder = 20;
    }
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     *
     * @param {IServiceContainer} container The Service Container to update
     */
    ConfigureContainer(container) {
        const config = container.getService("Config" /* Config */);
        let haveStar = false;
        config.routes = config.routes || [];
        config.routes.forEach(c => haveStar = haveStar || c.path === "*");
        if (!haveStar)
            config.routes.push({
                path: "*",
                component: RoutedComponent
            });
    }
}
//# sourceMappingURL=RoutingModule.js.map