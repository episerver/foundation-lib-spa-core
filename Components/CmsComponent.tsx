import EpiComponent, { EpiComponentType } from './EpiComponent';
import EpiserverContext from '../Spa';

if (EpiserverContext.isDebugActive()) {
	console.warn('The CMS Component has been depricated, please start using the EPI Component. If you continue to use this component you can expect issues with server side rendering.');
}

const CmsComponent : EpiComponentType = EpiComponent.CreateComponent(EpiserverContext);
export default CmsComponent;