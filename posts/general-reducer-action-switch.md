---
status: published
date: 2024-10-19
title: General Reducer Action Switch
description: |
  ```javascript
  dispatch({ $set: { count: 1 } })
  ```
---

# General Reducer Action Switch

It's a bit annoying to write specific action handlers for each action since most of them share the same pattern if they modify data of the same type or data structure. With the help of the `multipleActionReducer` [(blog post here)](./reducer.html) its possible to combine multiple actions to make a custom behavior closer to where the actions are called.

I want to have an action that takes an operator and a payload
describing how to modify the data by modeling the object to change. So
the action would look like this:
`{ $set: { count: 10 } }`
would set the key `count` to 10 in the state.

## Implementation of $set

```javascript
const actionSwitch = (state, action) => {
  const [operator, payload] = Object.entries(action).at(0);

  const [key, value] = Object.entries(payload).at(0);

  switch (operator) {
    case "$set": {
      return {
        ...state,
        [key]: value,
      };
    }

    default: {
      return state;
    }
  }
};
```

## More complex update with $function

If we need to modify the state in a more complex way we can make up an operator `$function` that takes a function as a value.

`{ $function: { count: f } }`
to calculate the next value for the action where

```javascript
const f = (state, action) => state.someNumber + state.count;
```

will set `count` to the sum of `someNumber + count`.

```javascript
const actionSwitch = (state, action) => {
  const [operator, payload] = Object.entries(action).at(0);

  const [key, fn] = Object.entries(payload).at(0);

  switch (operator) {
    case "$function": {
      return {
        ...state,
        [key]: fn(state, action);
      };
    }

    default: {
      return state;
    }
  }
}
```

## Usage in React

```jsx
const Component = () => {
  const [state, dispatch] = useReducer(actionSwitch, { email: "" });

  return (
    <input
      onChange={(event) => {
        dispatch({
          $set: { email: event.target.value },
        });
      }}
    />
  );
};
```

## Continuation

These examples only works for flat states. There are thing that can be done to handle nested payloads like
`{ $set: { count: { value: { n: 0 } } } }` but that's for another article.
