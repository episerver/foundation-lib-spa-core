import { EnhancedStore, Unsubscribe, Action, AnyAction, Middleware } from '@reduxjs/toolkit';

type Middlewares<S> = ReadonlyArray<Middleware<{}, S>>;

export function observeStore<T = any, S = any, A extends Action<any> = AnyAction, M extends Middlewares<S> = Middlewares<S>>
(   
    store: EnhancedStore<S, A, M>, 
    select: (state: S) => T, 
    onChange: (state: T) => void
) : Unsubscribe
{
    let currentState : any;

    function handleChange() {
        const nextState = select(store.getState());
        if (nextState !== currentState) {
            currentState = nextState;
            onChange(currentState);
        }
    }

    const unsubscribe = store.subscribe(handleChange);
    handleChange();
    return unsubscribe;
}

export function setLanguage<S = any, A extends Action<any> = AnyAction, M extends Middlewares<S> = Middlewares<S>>(newLanguage: string, store: EnhancedStore<S,A,M>) : void
{
    const action : A = {
        type: 'OptiContentCloud/SetState',
        currentLanguage: newLanguage
    } as unknown as A;
    store.dispatch(action);
}