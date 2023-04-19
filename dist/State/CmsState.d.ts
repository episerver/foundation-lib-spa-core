import IContent from '../Models/IContent';
import { ServerContext } from '../ServerSideRendering/ServerContext';
export type CmsState = {
    currentLanguage?: string;
    iContent?: IContent;
    initialState?: ServerContext;
};
export default CmsState;
