---
status: published
date: 2024-12-29
title: IIFE as a way to avoid mutation
description: |
  A trick if you want to have pure conditional declaration of variables
---

# [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) as a way to avoid mutation

Out of `var`, `let` and `const` you should have chosen to only use `const` at this point since it is immutable (with some exceptions when it comes to objects). So this is the way to go:

```javascript
const status = "ok";
```

However sometimes you might want to assign a value based on a condition like

```javascript
const status = isOk ? "ok" : "failed";
```

Fair enough. But if you want more complex conditions that are not binary and are not a straight forward mapping of values you might get tempted to do horrible things like this:

```javascript
let theTemptationMakeYouCheat = "ok";

if (thisOrThat) {
  theTemptationMakeYouCheat = "failed";
}

if (thatOrThis || time > 100) {
  // just making things up to make a point
  theTemptationMakeYouCheat = "pending";
}

useFilthyVariableInSomeSadWayBecause(theTemptationMakeYouCheat);
```

One way to go if you are lazy is to use `iife` to immediately calculate the result:

```javascript
const status = (() => {
  if (isOk) {
    return "ok";
  }

  if (isPending) {
    return "pending";
  }

  return "failed";
})();
```
