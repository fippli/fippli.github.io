---
status: published
date: 2024-10-19
title: React reducer idea
description: |
  ```javascript
  dispatch(action1, action2, action3, ...)
  ```
---

# React reducer idea

In react you can dispatch one action at the time with the `useReducer` dispatch function. This is a bit annoying to me if I have several actions that I want to operate on the same original state.

Therefore I have created a custom `useReducer` function that collects all actions passed to it like

```javascript
dispatch(action_1, action_2, action_3);
```

It's pretty straight forward to create the new dispatch function like

```jsx
import { useReducer, useCallback } from "react";

const useMultipleActionReducer = (reducer, initialState) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Wrap in useCallback to avoid rerenders
  const multipleActionDispatch = useCallback(
    (...actions) => {
      // Pass all actions as an array
      return dispatch(actions);
    },
    [dispatch],
  );

  return [state, multipleActionDispatch];
};
```

Then next step is to create a reducer function that can handle multiple arguments. It's not that complicated.

```javascript
const reducer = (state, actions) => actions.reduce(actionSwitch, state);
```

Now you can handle the actions the same way as you would normally do with something like:

```javascript
const actionSwitch = (state, action) => {
  switch (action.type) {
    case "increment": {
      return { ...state, count: state.count + 1 };
    }

    case "decrement": {
      return { ...state, count: state.count - 1 };
    }

    default: {
      return state;
    }
  }
};
```

Usage

```javascript
const [state, dispatch] = useMultipleActionReducer(reducer, { count: 0 });

// count + 1 + 1 - 1
dispatch({ type: "increment" }, { type: "increment" }, { type: "decrement" });
```
