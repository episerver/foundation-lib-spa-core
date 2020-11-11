import { ComponentProps } from '../EpiComponent';
import * as TypeMapperNS from '../Loaders/BaseTypeMapper';
import * as ComponentNS from '../Loaders/ComponentLoader';
import IContent from '../Models/IContent';

// Components
export const ComponentLoader = ComponentNS.ComponentLoader;
export type IComponentLoader = ComponentNS.IComponentLoader;
export type IComponentLoaderType = ComponentNS.IComponentLoaderType;
export type IComponentLoaderConfig = ComponentNS.IComponentLoaderConfig;
export type IComponentLoaderList = ComponentNS.IComponentLoaderList;

export type TComponentType<T extends unknown = ComponentProps<IContent>> = ComponentNS.TComponentType<T>;
export type TComponentTypePromise<T extends unknown = ComponentProps<IContent>> = ComponentNS.TComponentTypePromise<T>;

// TypeMapper
export const BaseTypeMapper = TypeMapperNS.BaseTypeMapper;
export type TypeMapper = TypeMapperNS.TypeMapperType;
export type TypeInfo = TypeMapperNS.TypeMapperTypeInfo;

// Guards
export const isComponentLoader = ComponentNS.isIComponentLoader;

// Default loader
export default ComponentLoader;