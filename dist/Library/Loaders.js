import * as TypeMapperNS from '../Loaders/BaseTypeMapper';
import * as ComponentNS from '../Loaders/ComponentLoader';
// Components
export const ComponentLoader = ComponentNS.ComponentLoader;
// TypeMapper
export const BaseTypeMapper = TypeMapperNS.BaseTypeMapper;
// Guards
export const isComponentLoader = ComponentNS.isIComponentLoader;
// Default loader
export default ComponentLoader;
