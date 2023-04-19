import { EnhancedStore, Unsubscribe, Action, AnyAction, Middleware } from '@reduxjs/toolkit';
type Middlewares<S> = ReadonlyArray<Middleware<{}, S>>;
export declare function observeStore<T = any, S = any, A extends Action<any> = AnyAction, M extends Middlewares<S> = Middlewares<S>>(store: EnhancedStore<S, A, M>, select: (state: S) => T, onChange: (state: T) => void): Unsubscribe;
export declare function setLanguage<S = any, A extends Action<any> = AnyAction, M extends Middlewares<S> = Middlewares<S>>(newLanguage: string, store: EnhancedStore<S, A, M>): void;
export {};
