---
status: published
date: 2024-10-23
title: Javascript Emptiness
description: |
  ```javascript
  [].isEmpty() // true
  ```
---

# JavaScript Emptiness

This `[].isEmpty() // true` is easier to read than `[].length === 0 // true`

But if you try that you will get an error saying
`Uncaught TypeError: [].isEmpty is not a function`

You can easily prototype this behavior.

## Arrays

```javascript
Array.prototype.isEmpty = function () {
  return this.length === 0;
};
```

```javascript
// Examples

[].isEmpty(); // true

const a = [];
a.isEmpty(); // true
```

## Strings

```javascript
String.prototype.isEmpty = function () {
  return this.length === 0;
};
```

```javascript
// Examples

"".isEmpty(); // true

const s = "";
s.isEmpty(); // true
```

## Objects

`{}.isEmpty()` wont work but it does if you define an object first.

```javascript
Object.prototype.isEmpty = function () {
  return Object.keys(this).length === 0;
};
```

Will work if you first define an object.

```javascript
// Examples

const o = {};
o.isEmpty(); // true
```

## Conclusion

Let's sum this up with a little "file" you can use

```javascript
// isEmpty.js

Array.prototype.isEmpty = function () {
  return this.length === 0;
};

String.prototype.isEmpty = function () {
  return this.length === 0;
};

Object.prototype.isEmpty = function () {
  return Object.keys(this).length === 0;
};
```
