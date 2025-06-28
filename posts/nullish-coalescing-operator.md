---
status: published
date: 2024-12-12
title: Nullish coalescing operator
description: |
  Use `??` over `||`
---

# Nullish coalescing operator

I wrote a post about how checking [truthy-/falsiness](falsy-and-is-defined.html) is prone to bugs. When it comes to defaulting to a value in javascript there are two ways.

You might have seen `||` or "logical or" ([read more here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR)). So for example

```javascript
const handleInput = (inputString) => {
  return inputString || "default";
};
```

Here if `inputString` is falsy it defaults to `"default"` which helps if we want the function to be able to handle `null` or `undefined` without crashing. The problem here is that logical or also returns `"default"` if the string is empty because

```javascript
"" == false; // evaluates to true
```

So the better option is the "nullish coalescing operator" `??` ([read more here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)) which does the same thing but only if `inputString` is `null` or `undefined` i.e.

```javascript
const handleInput = (inputString) => {
  return inputString ?? "default";
};
```
