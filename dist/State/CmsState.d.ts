import IContent from '../Models/IContent';
import { ServerContext } from '../ServerSideRendering/ServerContext';
export declare type CmsState = {
    currentLanguage?: string;
    iContent?: IContent;
    initialState?: ServerContext;
};
export default CmsState;
