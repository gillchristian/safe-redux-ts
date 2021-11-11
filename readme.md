# safe-redux-ts :evergreen_tree:

**NOTE**: this library is based on [@martin_hotell](https://github.com/Hotell)'s
[rex-tils](https://github.com/Hotell/rex-tils) library and his article
[_Improved Redux type safety with TypeScript 2.8_](https://medium.com/@martin_hotell/improved-redux-type-safety-with-typescript-2-8-2c11a8062575).

> Instead of telling the program what types it should use, types are inferred
> from the implementation, so type checker gets out of our way!
>
> [_Improved Redux type safety with TypeScript 2.8_](https://medium.com/@martin_hotell/improved-redux-type-safety-with-typescript-2-8-2c11a8062575)

## Install

```
yarn add safe-redux-ts

npm i safe-redux-ts
```

## Use

Define the actions:

```ts
// src/pages/MyPage/actions.ts

import { ActionsUnion, createAction } from 'safe-redux-ts';

export const INC = '[counter] increment';
export const DEC = '[counter] decrement';
export const INC_BY = '[counter] increment_by';
export const WITH_META = '[counter] with_meta';

export const Actions = {
  inc: () => createAction(INC),
  dec: () => createAction(DEC),
  incBY: (by: number) => createAction(INC_BY, by),
  withMeta: (by: number, meta: string) => createAction(WITH_META, by, meta),
};

export type Actions = ActionsUnion<typeof Actions>;

export type ActionTypes =
  | typeof INC
  | typeof DEC
  | typeof INC_BY
  | typeof WITH_META;
```

Handle the actions:

```ts
// src/pages/MyPage/reducer.ts

import { handleActions, Handler } from 'safe-redux-ts';

import { User } from '../types';

import { INC, DEC, INC_BY, WITH_META, Actions, ActionTypes } from './actions';

interface State {
  count: number;
}

const initialState: State = {
  count: 0,
};

// `Handler` type can be used when you don't want to define the handlers inline
const handleIncBy: Handler<State, typeof INC_BY, Actions> = (
  { count },
  { payload },
) => ({ count: count + payload });

const reducer = handleActions<State, ActionTypes, Actions>(
  {
    [INC]: ({ count }) => ({ count: count + 1 }),
    [DEC]: ({ count }) => ({ count: count - 1 }),
    [INC_BY]: handleIncBy,
    [WITH_META]: ({ count }, { payload }) => ({ count: count + payload }),
  },
  initialState,
);

export default reducer;
```

`handleActions` works with React's `useReducer` as well. In that case, the
`initialState` state can be omitted.

```ts
// src/pages/MyPage/useMyReducer.ts

import { useReducer } from 'react';
import { handleActions } from 'safe-redux-ts';

import { User } from '../types';

import { INC, DEC, INC_BY, WITH_META, Actions, ActionTypes } from './actions';

interface State {
  count: number;
}

const reducer = handleActions<State, ActionTypes, Actions>({
  [INC]: ({ count }) => ({ count: count + 1 }),
  [DEC]: ({ count }) => ({ count: count - 1 }),
  [INC_BY]: ({ count }, { payload }) => ({ count: count + payload }),
  [WITH_META]: ({ count }, { payload }) => ({ count: count + payload }),
});

const useMyReducer = () => {
  const [state, dispatch] = useMyReducer(reducer, { count: 0 });

  return { state, dispatch };
};

export default useMyReducer;
```

### Type utils

`safe-redux-ts` also provides some type utils to work with Redux.

#### `BindAction`

Changes the return type of an action creator to `void`. In the context of a
component the only important part of an action is the types of it's arguments.
We don't rely on the return type.

```typescript
// src/pages/MyPage/actions.ts

import { ActionsUnion, createAction } from 'safe-redux-ts';

export const INC = '[counter] increment';
export const DEC = '[counter] decrement';
export const INC_BY = '[counter] increment_BY';

export const Actions = {
  incBy: (by: number) => createAction(INC_BY, { by }),
};

export type Actions = ActionsUnion<typeof Actions>;

// src/pages/MyPage/MyPage.container.ts

import { connect } from 'react-redux';
import { BindAction } from 'safe-redux-ts';

import { Actions } from './actions';
import MyPage from './MyPage';

interface StateProps {
  count: number;
}

interface DispatchProps {
  incBy: BindAction<typeof Actions.incBy>; // (arg: number) => void
}

type MyPageProps = StateProps & DispatchProps;

export default connect<StateProps, DispatchProps>((s) => ({ count: s.count }), {
  incBy: Actions.incBy,
})(MyPage);
```

## Differences with `rex-tils`

- Added `handleActions` to create type safe reducers.
- Smaller API. `safe-redux-ts` only exports a few functions and types:
  - Functions: `createAction` and `handleActions`.
  - Types: `Action`, `ActionsUnion`, `ActionsOfType`, `Handler` and
    `BindAction`.

## LICENSE

[MIT License](/LICENSE) © [Christian Gill](https://gillchristian.xyz)

Forked from
[housinganywhere/safe-redux](https://github.com/housinganywhere/safe-redux).
