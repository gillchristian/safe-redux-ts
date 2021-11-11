import { useReducer, Reducer as ReactReducer } from 'react';
import { Reducer as ReduxReducer } from 'redux';
import { createAction, handleActions, ActionsUnion, Handler } from './index';

describe('handleActions', () => {
  const ACTION = 'SOME_ACTION';
  const initialState = { foo: 'bar' };
  const returnedState = { foo: 'foo' };
  const actionHandler = jest.fn(() => returnedState);
  const reducer = handleActions(
    {
      [ACTION]: actionHandler,
    },
    initialState,
  );

  it('handles actions', () => {
    const action = { type: ACTION };

    const actual = reducer(initialState, action);

    expect(actual).toBe(returnedState);
    expect(actionHandler).toBeCalledWith(initialState, action);
  });

  it('returns state when action type is not handled', () => {
    const action = { type: 'other_action' };
    const state = { foo: 'foo' };

    const actual = reducer(state, action);

    expect(actual).toBe(state);
  });

  it('defaults to initialState when state is undefined', () => {
    const action = { type: ACTION };

    reducer(undefined as any, action);

    expect(actionHandler).toBeCalledWith(initialState, action);
  });

  it('returns initialState when state is undefined and action is not handled', () => {
    const actual = reducer(undefined as any, { type: '@@REDUX/INIT' });

    expect(actual).toBe(initialState);
  });
});

describe('createAction', () => {
  it('creates an action with only type', () => {
    const action = createAction('action-type');

    expect(action).toEqual({ type: 'action-type' });
  });

  it('creates an action with type and payload props', () => {
    const payload = { foo: 'bar' };
    const action = createAction('action-type', payload);

    expect(action).toEqual({ type: 'action-type', payload });
  });

  it('creates an action with type, payload and meta props', () => {
    const payload = { foo: 'bar' };
    const meta = { foo: 'bar' };
    const action = createAction('action-type', payload, meta);

    expect(action).toEqual({ type: 'action-type', payload, meta });
  });
});

// Type tests
//
// All these should type check, we don't care about running the code.
const _lazy = () => {
  interface State {
    foo: string;
  }

  const enum ActionTypes {
    foo = 'foo',
    bar = 'bar',
    baz = 'baz',
  }

  const Actions = {
    foo: () => createAction(ActionTypes.foo),
    bar: (s: string) => createAction(ActionTypes.bar, s),
    baz: (n: number) => createAction(ActionTypes.baz, n),
  };
  type Actions = ActionsUnion<typeof Actions>;

  const handleBaz: Handler<State, ActionTypes.baz, Actions> = (
    s,
    { payload },
  ) => ({ foo: s.foo + payload.toString() });

  const initialState: State = { foo: 'bar' };

  // We don't want to have Redux as a dependency,
  // but we do want to make sure `handleActions` creates a valid Reducer
  const reducer: ReduxReducer<State, Actions> = handleActions<
    State,
    ActionTypes,
    Actions
  >(
    {
      foo: () => ({ foo: 'foo' }),
      bar: (s, { payload }) => ({ foo: s.foo + payload }),
      baz: handleBaz,
    },
    initialState,
  );

  const useReducerReducer: ReactReducer<State, Actions> = reducer;

  // Same for React's useReducer
  useReducer(useReducerReducer, initialState);

  return reducer;
};
