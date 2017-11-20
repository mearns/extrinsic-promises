/**
 * Creates a thenable promise that can be settled _extrinsically_,
 * meaning from outside of a provided work function. In fact, there is no
 * work function; in addition to `then`, the object exposes two methods,
 * `resolve` and `reject`, which you can call to settle the promise, just
 * like you would from within a work function.
 */

const builtinPromiseFactory = (...args) => new Promise(...args)

/**
 * Optional constructor parameter is a function that can be used to construct
 * the new base promise. This does _not_ extend a particular class or type,
 * it just uses the given promise internally. The default is to use the
 * global `Promise` class.
 */
export class ExtrinsicPromise {
  constructor (promiseFactory = builtinPromiseFactory) {
    let resolvedWith, rejectedFor
    let resolved = false
    let rejected = false
    this.resolve = (withValue) => {
      if (!resolved && !rejected) {
        resolved = true
        resolvedWith = withValue
      }
      return this
    }
    this.reject = (forReason) => {
      if (!resolved && !rejected) {
        rejected = true
        rejectedFor = forReason
      }
      return this
    }
    const promise = promiseFactory((resolve, reject) => {
      if (resolved) {
        resolve(resolvedWith)
      } else if (rejected) {
        reject(rejectedFor)
      } else {
        this.resolve = (...args) => {
          resolve(...args)
          return this
        }
        this.reject = (...args) => {
          reject(...args)
          return this
        }
      }
    })
    this.then = promise.then.bind(promise)
  }

  /**
   * An alternative pattern where you can pass in a work function
   * after construction, which will be pushed onto the event stack
   * to be invoked with the `resolve` and `reject` functions that will
   * settle this ExtrinsicPromise, just like the normal work function passed
   * to a `Promise` constructor.
   *
   * This method returns `this` for chainability.
   */
  work (workFunction) {
    setImmediate(() => {
      workFunction(this.resolve, this.reject)
    })
    return this
  }

  /**
   * Returns a thennable which is bound to this extrinsic promise through
   * the closure, but only exposes a `then` method, thereby hiding all other
   * methods of the this extrnisic promise (i.e., preventing code which only
   * has the returned object from settling your promise).
   */
  hide () {
    return {
      then: (...args) => this.then(...args)
    }
  }
}
