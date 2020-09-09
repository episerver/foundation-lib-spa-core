// Core interfaces
import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer, { DefaultServices } from '../Core/IServiceContainer';
import AppConfig from '../AppConfig';
import RoutedComponent from '../Components/RoutedComponent';

export default class RoutingModule extends BaseInitializableModule implements IInitializableModule
{
    protected name : string = "Episerver CMS Routing";
    
    /**
     * Ensure the configuration object within the service container contains a "*" route. If
     * this "*" route is not claimed by the implementation, it will be added as fall-back to
     * Episerver CMS based routing.
     * 
     * @param container The Service Container to update
     */
    public ConfigureContainer(container: IServiceContainer) : void
    {
        const config = container.getService<AppConfig>(DefaultServices.Config);
        let haveStar : boolean = false;
        config.routes = config.routes || [];
        config.routes.forEach(c => haveStar = haveStar || c.path === "*");
        if (!haveStar) config.routes.push({
            path: "*",
            component: RoutedComponent
        });
    }
}
