# extrinsic-promises

`extrinsic-promises` is a JavaScript module that provides a convenient promises anti-pattern
for those times when you just really need to settle (fulfill or reject) your promise from
_outside_ the promise's work-function.

Specifically, an `ExtrinsicPromise` is a thennable that you construct _without_ a
work-function, and instead call public `resolve` and `reject` methods on the object
to settle the state of the promise.

**Note:** this is generally a promises _antipattern_. It is not recommended for most use cases,
but there are some situations that can't reasonably be handled with traditional promises (at
least not without re-implementing extrinsic-promises.)

## Example

Basic usage:

```javascript
import ExtrinsicPromise from 'extrinsic-promises'

const promise = new ExtrinsicPromise()

// Setup handlers for the promise, just like you normally would.
promise.then((value) => {
  console.log('Promise was fulfilled with value:', value)
})

// Call the public methods on the promise to resolve/fulfill it.
promise.resolve('Some value')
```

Rejecting a promise:

```javascript
const promise = new ExtrinsicPromise()

// Register your on-reject handler for the promise,
// just like you normally would.
promise.then(null, (reason) => {
  console.log('Promise was reject for reason:', reason)
})

// Call the public methods on the promise to reject it.
promise.reject(new Error('some reason'))
```

## Getting an Extended API

The `ExtrinsicPromise` only provides the basic `.then(onFulfill, onReject)` method for promises. If
you want the convenience methods provided by your favoritate promises library, you can usually use that
library to wrap an `ExtrinsicPromise` appropriately:

```javascript
import Promise from 'bluebird'
import ExtrinsicPromise from 'extrinsic-promises'

const exPromise = new ExtrinsicPromise()
const bluebirdPromise = Promise.resolve(exPromise)
```

Or, if the library doesn't provide a method like that, you can use the standard `Promise` constructor
as follows:

```javascript
import ExtrinsicPromise from 'extrinsic-promises'

const exPromise = new ExtrinsicPromise()
const otherPromise = new Promise((resolve, reject) => {
  exPromise.then(resolve, reject)
})
```

## API

The `ExtrinsicPromise` class exports the following public methods:

### `ExtrinsicPromise::then(onFulfill[, onReject])`

The standard `then` method of the [Promises/A+](https://promisesaplus.com/#the-then-method) standard,
used to register an on-fulfill and/or on-reject handler for the promise.

### `ExtrinsicPromise::resolve([withValue])`

Resolve (fulfill) the `ExtrinsicPromise` with the optional given value. Note that there is no gaurantee as to when
fulfillment occurs (i.e., synchronously or asynchronously).

### `ExtrinsicPromise::reject([forReason])`

Reject the `ExtrinsicPromise` with the optional given reason (typically, an Error object). Note that there is
no gaurantee as to when rejection occurs (i.e., synchronously or asynchronously).

### `ExtrinsicPromise::work(workfunction)`

An alternative interface for settling the promise, this allows you to pass in a work-function just like
you normally would pass to the `Promise` constructor, but in this case you're passing it in after the promise
has already been constructed.

The given work function will be invoked _unconditionally_ (even if the promise is already settled) with
two arguments, typically called `resolve` and `reject`. These are functions that are used to settle the state
of the promise once the work you promise to do is done, just like the `.resolve()` and `.reject()` methods on
the `ExtrinsicPromise`.

If an error is thrown inside the workfunction, it will be treated as a rejection.

Note that the work function will be called _asynchronously_, i.e., the call to `.work()` will return _before_
the given work function has been called.

### `ExtrinsicPromise::hide()`

Returns a minimal _thennable_ object which only exposes the `.then()` method of this object as a bound function.
This allows you to pass around this object as a promise, without exposing it's state-mutating methods like
`.resolve()` and `.reject()`.
