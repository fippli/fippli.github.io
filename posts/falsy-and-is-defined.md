---
status: published
date: 2024-10-25
title: Why falsiness is a bad idea
description: |
  Why this is a bad idea
  ```javascript
  if (myData) doSomething()
  ```
---

# Why falsiness is a bad idea

It doesn't require much thought to convince yourself that "falsy" and
"truthy" checking is prone to bugs.

It's a pretty common pattern among JavaScript developers, and can
introduce the most insidious (pretty awesome reference since the demon
is called the "lipstick demon") bugs.

## What is it?

Truty/falsy checking is when a value is interpreted as
`true` or `false`. The most obvious example is
`0 == false // true` if you care to open a browser terminal and type that in.

## What is the problem?

So another funky thing is this: `!null // true` or `!undefined // true` or
So when JavaScript developers want to check if thier variable is populated with a value they do stuff like this

```javascript
function(x) {
  if (x) {
    // We have a value
    doSomething();
  }
}
```

If we get an empty string or a zero here we are doomed.

What we really want to check is if the value is either
`undefined` or `null`. But that too is really annoying becase it's a lot of code for very basic stuff.

```javascript
function(x) {
  if (x !== undefined || x !== null) {
    // We have a value (including '' and 0)
    doSomething();
  }
}
```

Or another one I've tried `![null, undefined].includes(x)`.

This is a pretty nice function we can call

```javascript
const isDefined = (x) => ![null, undefined].includes(x);
```

and use it in our code.

It makes a lot of sense

```javascript
function(x) {
  if (isDefined(x)) {
    // We have a value (including '' and 0)
    doSomething();
  }
}
```

## Areas of application

```javascript
const xs = [0, 1, null, 13, undefined, 0, 12];

xs.filter(isDefined); // keeps all numbers
```
