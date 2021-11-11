export { BindAction } from './utils';
import { ReturnType } from './utils';

// We use conditional types so we can have only one type for defining Action
export type Action<
  T extends string = string,
  P = void,
  M = void,
> = P extends void
  ? M extends void
    ? Readonly<{ type: T }>
    : Readonly<{ type: T; meta: M }>
  : M extends void
  ? Readonly<{ type: T; payload: P }>
  : Readonly<{ type: T; payload: P; meta: M }>;

type ActionCreator = (...args: any[]) => Action;
type ActionCreators = { [k: string]: ActionCreator };

export type ActionsUnion<A extends ActionCreators> = ReturnType<A[keyof A]>;

// conditional type for filtering actions in epics/effects
export type ActionsOfType<
  ActionUnion,
  ActionType extends string,
> = ActionUnion extends Action<ActionType> ? ActionUnion : never;

export type Handler<State, ActionType extends string, Actions> = (
  state: State,
  action: ActionsOfType<Actions, ActionType>,
) => State;

export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(
  type: T,
  payload: P,
): Action<T, P>;
export function createAction<T extends string, P, M>(
  type: T,
  payload: P,
  meta: M,
): Action<T, P, M>;
export function createAction<T extends string, P, M>(
  type: T,
  payload?: P,
  meta?: M,
) {
  return payload === undefined
    ? meta === undefined
      ? { type }
      : { type, meta }
    : meta === undefined
    ? { type, payload }
    : { type, payload, meta };
}

export function handleActions<
  State,
  Types extends string,
  Actions extends ActionsUnion<{ [T in Types]: ActionCreator }>,
>(
  handlers: { [T in Types]: Handler<State, T, Actions> },
  initialState?: State,
) {
  return typeof initialState === 'undefined'
    ? (state: State, action: Actions): State => {
        const handler = handlers[action.type];

        return handler ? handler(state, action) : state;
      }
    : (state: State = initialState, action: Actions): State => {
        const handler = handlers[action.type];

        return handler ? handler(state, action) : state;
      };
}
