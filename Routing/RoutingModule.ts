// Core interfaces
import IInitializableModule, { BaseInitializableModule } from '../Core/IInitializableModule';
import IServiceContainer, { DefaultServices } from '../Core/IServiceContainer';
import AppConfig from '../AppConfig';
import RoutedComponent from '../Components/RoutedComponent';

export default class RoutingModule extends BaseInitializableModule implements IInitializableModule
{
    protected name : string = "Episerver Routing";
    
    public ConfigureContainer(container: IServiceContainer) : void
    {
        const config = container.getService<AppConfig>(DefaultServices.Config);
        let haveStar : boolean = false;
        (config.routes || []).forEach(c => haveStar = haveStar || c.path === "*");
        if (!haveStar) config.routes?.push({
            path: "*",
            component: RoutedComponent
        });
        container.setService(DefaultServices.Config, config);
    }
}
