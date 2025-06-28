---
status: draft
date: 2025-01-27
title: Endpoint Data Class
description: |
  (work in progress...)
  ```javascript
  const user = new Endpoint("user/:id");
  ```
---

# Endpoint Data Class ([TL;DR jump straight to complete example]())

I wanted an easy to read class that builds url strings for api endpoints when I'm coding in react. I don't want to hard code urls because I want the paths to be built dynamically depending on states in the react application.

The idea

```javascript
// Define the dynamic endpoint with a template string
const users = new Endpoint("/users/:id");

// usage
users
  .parameters({
    id: "c4cf8dd7-0374-45e7-bdf2-31f09ff38675",
  })
  .query({
    age: 35,
  });
```

I chose the builder pattern because it is explicit than lets say positional arguments.

## Builder pattern

[Read more here](https://en.wikipedia.org/wiki/Builder_pattern)

How to implement it in JavaScript? It's pretty stright forward. Create a class where the methods return itself i.e. `this`

```JavaScript
// Not a complete example, just displaying the idea
class Endpoint(template) {

  parameters({id}) {
    // Do the magic
    return this
  }

}
```

The problem, if we want to avoid mutation is that when we create an instance we risk altering the state of the endpoint object. I want the methods to be callable only once or throw an error so I don't overwrite parameters by mistake in my code.

One solution is to make a factory class that creates classes that we allow to alter the state, but if we create a new one it's, well, new.

I'll call the factory method `create` and then I'll also add a method called `toString` that outputs the result of the built url.

## Complete example

```TypeScript


```
