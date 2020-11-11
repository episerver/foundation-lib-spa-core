import { ComponentProps } from '../EpiComponent';
import * as TypeMapperNS from '../Loaders/BaseTypeMapper';
import * as ComponentNS from '../Loaders/ComponentLoader';
import IContent from '../Models/IContent';
export declare const ComponentLoader: typeof ComponentNS.ComponentLoader;
export declare type IComponentLoader = ComponentNS.IComponentLoader;
export declare type IComponentLoaderType = ComponentNS.IComponentLoaderType;
export declare type IComponentLoaderConfig = ComponentNS.IComponentLoaderConfig;
export declare type IComponentLoaderList = ComponentNS.IComponentLoaderList;
export declare type TComponentType<T extends unknown = ComponentProps<IContent>> = ComponentNS.TComponentType<T>;
export declare type TComponentTypePromise<T extends unknown = ComponentProps<IContent>> = ComponentNS.TComponentTypePromise<T>;
export declare const BaseTypeMapper: typeof TypeMapperNS.BaseTypeMapper;
export declare type TypeMapper = TypeMapperNS.TypeMapperType;
export declare type TypeInfo = TypeMapperNS.TypeMapperTypeInfo;
export declare const isComponentLoader: (toTest: ComponentNS.IComponentLoader | ComponentNS.IComponentLoaderType) => toTest is ComponentNS.IComponentLoader;
export default ComponentLoader;
