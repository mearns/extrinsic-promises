[![Build Status](https://travis-ci.org/mearns/extrinsic-promises.svg?branch=master)](https://travis-ci.org/mearns/extrinsic-promises)
[![JavaScript Standard Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# extrinsic-promises

_Supports node versions back to v6, and 0 runtime dependencies_

`extrinsic-promises` is a JavaScript module that provides a convenient promises anti-pattern
for those times when you just really need to settle (fulfill or reject) your promise from
_outside_ the promise's work-function.

Specifically, an `ExtrinsicPromise` is a thennable that you construct _without_ a
work-function, and instead call public `fulfill` and `reject` methods on the object
to settle the state of the promise.

**Note:** this is generally a promises _antipattern_. It is not recommended for most use cases,
but there are some situations that can't reasonably be handled with traditional promises (at
least not without re-implementing extrinsic-promises.)

## Installation

```console
npm install --save extrinsic-promises
```

## Example

Basic usage:

```javascript
import ExtrinsicPromise from "extrinsic-promises";

const promise = new ExtrinsicPromise();

// Setup handlers for the promise, just like you normally would.
promise.then(value => {
    console.log("Promise was fulfilled with value:", value);
});

// Call the public methods on the promise to fulfill/resolve it.
promise.fulfill("Some value");
```

Rejecting a promise:

```javascript
const promise = new ExtrinsicPromise();

// Register your on-reject handler for the promise,
// just like you normally would.
promise.then(null, reason => {
    console.log("Promise was reject for reason:", reason);
});

// Call the public methods on the promise to reject it.
promise.reject(new Error("some reason"));
```

## Getting an Extended API

The `ExtrinsicPromise` only provides the basic `.then(onFulfill, onReject)` method for promises. If
you want the convenience methods provided by your favoritate promises library, you can usually use that
library to wrap an `ExtrinsicPromise` appropriately:

```javascript
import Promise from "bluebird";
import ExtrinsicPromise from "extrinsic-promises";

const exPromise = new ExtrinsicPromise();
const bluebirdPromise = Promise.fulfill(exPromise);
```

Or, if the library doesn't provide a method like that, you can use the standard `Promise` constructor
as follows:

```javascript
import ExtrinsicPromise from "extrinsic-promises";

const exPromise = new ExtrinsicPromise();
const otherPromise = new Promise((fulfill, reject) => {
    exPromise.then(fulfill, reject);
});
```

## API

The `ExtrinsicPromise` class exports the following public methods:

### `ExtrinsicPromise::then(onFulfill[, onReject])`

The standard `then` method of the [Promises/A+](https://promisesaplus.com/#the-then-method) standard,
used to register an on-fulfill and/or on-reject handler for the promise.

### `ExtrinsicPromise::fulfill([withValue])`

Resolve (fulfill) the `ExtrinsicPromise` with the optional given value. Note that there is no gaurantee as to when
fulfillment occurs (i.e., synchronously or asynchronously).

This method is already bound and can be used correctly as a function reference. E.g.,:

```javascript
const exPromise = new ExtrinsicPromise();
const fulfillLater = exPromise.fulfill;
// ...
fulfillLater(value); // correctly fulfills exPromise.
```

### `ExtrinsicPromise::reject([forReason])`

Reject the `ExtrinsicPromise` with the optional given reason (typically, an Error object). Note that there is
no gaurantee as to when rejection occurs (i.e., synchronously or asynchronously).

This method is already bound and can be used correctly as a function reference. E.g.,:

```javascript
const exPromise = new ExtrinsicPromise();
const rejectLater = exPromise.reject;
// ...
rejectLater(reason); // correctly rejects exPromise.
```

### `ExtrinsicPromise::adopt(thennable)`

Adopt the state of the given thennable, once the thennable settles, if this extrinsic promise has not _already_
settled. This is a convenience for using this extrinsic promise's `fulfill` and `reject` methods as the on-fulfill
and on-reject handlers, respectively, of the given thennable, as follows:

```javascript
const exPromise = new ExtrinsicPromise();
thennable.then(exPromise.fulfill, exPromise.reject);
```

### `ExtrinsicPromise::work(workfunction)`

An alternative interface for settling the promise, this allows you to pass in a work-function just like
you normally would pass to the `Promise` constructor, but in this case you're passing it in after the promise
has already been constructed.

The given work function will be invoked _unconditionally_ (even if the promise is already settled) with
two arguments, typically called `fulfill` and `reject`. These are functions that are used to settle the state
of the promise once the work you promise to do is done, just like the `.fulfill()` and `.reject()` methods on
the `ExtrinsicPromise`.

If an error is thrown inside the workfunction, it will be treated as a rejection.

Note that the work function will be called _asynchronously_, i.e., the call to `.work()` will return _before_
the given work function has been called.

### `ExtrinsicPromise::hide()`

Returns a minimal _thennable_ object which only exposes the `.then()` method of this object as a bound function.
This allows you to pass around this object as a promise, without exposing it's state-mutating methods like
`.fulfill()` and `.reject()`.

## How Does it Work?

It's pretty simple, feel free to read the code. There's a few details necessary to avoid race conditions, but
the gist of it is to simply save the `fulfill` and `reject` signalling functions that the promise passes in
to the work function:

```javascript
constructor () {
  new Promise((fulfill, reject) => {
    this.fulfill = fulfill
    this.reject = reject
  })
}
```
