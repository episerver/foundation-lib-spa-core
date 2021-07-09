import AppConfig from './AppConfig';
import { ImplementationPreLoader } from "./Loaders/ComponentPreLoader";
import IServiceContainer from './Core/IServiceContainer';
export declare function InitBrowser(config: AppConfig, containerId?: string, serviceContainer?: IServiceContainer, preload?: ImplementationPreLoader): Promise<void>;
export default InitBrowser;
