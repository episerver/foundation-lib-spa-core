// Core interfaces
import { BaseInitializableModule } from '../Core/IInitializableModule';
import { DefaultServices } from '../Core/IServiceContainer';
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
        const config = container.getService(DefaultServices.Config);
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
