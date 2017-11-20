/* eslint-env mocha */
/* eslint no-unused-expressions:0 */  // for expect magic.

// Module under test
import {ExtrinsicPromise} from '../../src/index'

// Support
import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('extrinsic-promises', () => {
  it('Should resolve promise when .resolve() method is called', () => {
    // given
    const testFulfill = 'test-value'
    const promiseUnderTest = new ExtrinsicPromise()

    // when
    promiseUnderTest.resolve(testFulfill)

    // then
    return expect(promiseUnderTest).to.eventually.equal(testFulfill)
  })

  it('should resolve even if .reject() is called after .resolve()', () => {
    // given
    const testFulfill = 'test-value'
    const promiseUnderTest = new ExtrinsicPromise()

    // when
    promiseUnderTest.resolve(testFulfill)
    promiseUnderTest.reject(new Error('test-error'))

    // then
    return expect(promiseUnderTest).to.eventually.equal(testFulfill)
  })

  it('should resolve with the initial value if .resolve() is called multiple times', () => {
    // given
    const testFulfill = 'test-value'
    const promiseUnderTest = new ExtrinsicPromise()

    // when
    promiseUnderTest.resolve(testFulfill)
    promiseUnderTest.resolve('some other value')

    // then
    return expect(promiseUnderTest).to.eventually.equal(testFulfill)
  })

  it('Should resolve promise when .resolve() method is called later @slow', () => {
    // given
    const testFulfill = 'test-value'
    const promiseUnderTest = new ExtrinsicPromise()

    // when
    return new Promise((resolve) => {
      setTimeout(resolve, 10)
    })
      .then(() => {
        promiseUnderTest.resolve(testFulfill)
        return null
      })
      .then(() => expect(promiseUnderTest).to.eventually.equal(testFulfill))
  })

  it('should reject promise when .reject() method is called', () => {
    // given
    const testReason = new Error('Test Reason')
    const promiseUnderTest = new ExtrinsicPromise()

    // when
    promiseUnderTest.reject(testReason)

    // then
    return expect(promiseUnderTest).to.be.rejectedWith(testReason)
  })

  it('should reject even if .reject() is called after .resolve()', () => {
    // given
    const testReason = new Error('Test Reason')
    const promiseUnderTest = new ExtrinsicPromise()

    // when
    promiseUnderTest.reject(testReason)
    promiseUnderTest.resolve('some value')

    // then
    return expect(promiseUnderTest).to.be.rejectedWith(testReason)
  })

  it('should reject with the initial reason if .reject() is called multiple times', () => {
    // given
    const testReason = new Error('Test Reason')
    const promiseUnderTest = new ExtrinsicPromise()

    // when
    promiseUnderTest.reject(testReason)
    promiseUnderTest.reject(new Error('Some other reason'))

    // then
    return expect(promiseUnderTest).to.be.rejectedWith(testReason)
  })

  it('should reject promise when .reject method is called later @slow', () => {
    // given
    const testReason = new Error('Test Reason')
    const promiseUnderTest = new ExtrinsicPromise()

    // when
    return new Promise((resolve) => {
      setTimeout(resolve, 10)
    })
      .then(() => {
        promiseUnderTest.reject(testReason)
        return null
      })
      .then(() => expect(promiseUnderTest).to.be.rejectedWith(testReason))
  })

  describe('when a Promise calls the work function synchronously', () => {
    it('should resolve promise when .resolve method is called', () => {
      // given
      const testFulfill = 'test-value'
      const promiseUnderTest = new ExtrinsicPromise(wf => new SynchronousPromise(wf))

      // when
      promiseUnderTest.resolve(testFulfill)

      // then
      return expect(promiseUnderTest).to.eventually.equal(testFulfill)
    })

    it('should reject promise when .reject method is called', () => {
      // given
      const testReason = new Error('Test Reason')
      const promiseUnderTest = new ExtrinsicPromise(wf => new SynchronousPromise(wf))

      // when
      promiseUnderTest.reject(testReason)

      // then
      return expect(promiseUnderTest).to.be.rejectedWith(testReason)
    })
  })

  describe('the hide() method', () => {
    it('should return a thennable that fulfills when the promise fulfills', () => {
      // given
      const testFulfill = 'test-value'
      const promiseUnderTest = new ExtrinsicPromise()
      const hidden = promiseUnderTest.hide()

      // when
      promiseUnderTest.resolve(testFulfill)

      // then
      return expect(hidden).to.eventually.equal(testFulfill)
    })

    it('should return a thennable that rejects when the promise rejects', () => {
      // given
      const testReason = new Error('Test Reason')
      const promiseUnderTest = new ExtrinsicPromise()
      const hidden = promiseUnderTest.hide()

      // when
      promiseUnderTest.reject(testReason)

      // then
      return expect(hidden).to.be.rejectedWith(testReason)
    })
  })

  describe('work() method', () => {
    it('should call the provided work function and fulfilled when the first arg is invoked', () => {
      // given
      const promiseUnderTest = new ExtrinsicPromise()
      const fulfillValue = 'fulfilled-with-this'
      const workSpy = sinon.spy((resolve) => {
        resolve(fulfillValue)
      })

      // when
      promiseUnderTest.work(workSpy)

      // then
      return expect(promiseUnderTest).to.eventually.equal(fulfillValue)
        .then(() => expect(workSpy).to.have.been.calledOnce)
    })

    it('should call the provided work function and reject when the second arg is invoked', () => {
      // given
      const promiseUnderTest = new ExtrinsicPromise()
      const testReason = new Error('test-error')
      const workSpy = sinon.spy((resolve, reject) => {
        reject(testReason)
      })

      // when
      promiseUnderTest.work(workSpy)

      // then
      return expect(promiseUnderTest).to.be.rejectedWith(testReason)
        .then(() => expect(workSpy).to.have.been.calledOnce)
    })

    it('should call the provided work function and reject if it throws an error', () => {
      // given
      const promiseUnderTest = new ExtrinsicPromise()
      const testReason = new Error('test-error')
      const workSpy = sinon.spy(() => {
        throw testReason
      })

      // when
      promiseUnderTest.work(workSpy)

      // then
      return expect(promiseUnderTest).to.be.rejectedWith(testReason)
        .then(() => expect(workSpy).to.have.been.calledOnce)
    })
  })

  describe('when promise constructor calls workfunction much later @slow', () => {
    it('should resolve promise when .resolve method is called immediately', () => {
      // given
      const testFulfill = 'test-value'
      const promiseUnderTest = new ExtrinsicPromise(wf => new LaterPromise(wf))

      // when
      promiseUnderTest.resolve(testFulfill)

      // then
      return expect(promiseUnderTest).to.eventually.equal(testFulfill)
    })

    it('should resolve even if .reject() is called after .resolve()', () => {
      // given
      const testFulfill = 'test-value'
      const promiseUnderTest = new ExtrinsicPromise(wf => new LaterPromise(wf))

      // when
      promiseUnderTest.resolve(testFulfill)
      promiseUnderTest.reject(new Error('test-error'))

      // then
      return expect(promiseUnderTest).to.eventually.equal(testFulfill)
    })

    it('should resolve with the initial value if .resolve() is called multiple times', () => {
      // given
      const testFulfill = 'test-value'
      const promiseUnderTest = new ExtrinsicPromise(wf => new LaterPromise(wf))

      // when
      promiseUnderTest.resolve(testFulfill)
      promiseUnderTest.resolve('some other value')

      // then
      return expect(promiseUnderTest).to.eventually.equal(testFulfill)
    })

    it('should reject promise when .reject method is called immediately', () => {
      // given
      const testReason = new Error('Test Reason')
      const promiseUnderTest = new ExtrinsicPromise(wf => new LaterPromise(wf))

      // when
      promiseUnderTest.reject(testReason)

      // then
      return expect(promiseUnderTest).to.be.rejectedWith(testReason)
    })

    it('should reject even if .reject() is called after .resolve()', () => {
      // given
      const testReason = new Error('Test Reason')
      const promiseUnderTest = new ExtrinsicPromise(wf => new LaterPromise(wf))

      // when
      promiseUnderTest.reject(testReason)
      promiseUnderTest.resolve('some value')

      // then
      return expect(promiseUnderTest).to.be.rejectedWith(testReason)
    })

    it('should reject with the initial reason if .reject() is called multiple times', () => {
      // given
      const testReason = new Error('Test Reason')
      const promiseUnderTest = new ExtrinsicPromise(wf => new LaterPromise(wf))

      // when
      promiseUnderTest.reject(testReason)
      promiseUnderTest.reject(new Error('Some other reason'))

      // then
      return expect(promiseUnderTest).to.be.rejectedWith(testReason)
    })
  })
})

class SynchronousPromise {
  constructor (workfunction) {
    this.state = 'pending'
    this.onFulfill = []
    this.onReject = []

    const resolve = (withValue) => {
      this.state = 'fulfilled'
      this.fulfilledWith = withValue
      this.onFulfill.forEach(h => this.handle(h, withValue))
    }

    const reject = (because) => {
      this.state = 'rejected'
      this.rejectedWith = because
      this.onReject.forEach(h => this.handle(h, because))
    }

    this._callWorkFunction(workfunction, resolve, reject)
  }

  _callWorkFunction (workfunction, resolve, reject) {
    try {
      workfunction(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  handle ({handler, resolve, reject}, value) {
    try {
      resolve(handler(value))
    } catch (error) {
      reject(error)
    }
  }

  then (onFulfill, onReject) {
    if (this.state === 'pending') {
      return new SynchronousPromise((resolve, reject) => {
        this.onFulfill.push({handler: onFulfill, resolve, reject})
        this.onReject.push({handler: onReject, resolve, reject})
      })
    } else if (this.state === 'fulfilled') {
      return new SynchronousPromise((resolve, reject) => {
        this.handle({handler: onFulfill, resolve, reject}, this.fulfilledWith)
      })
    } else if (this.state === 'rejected') {
      return new SynchronousPromise((resolve, reject) => {
        this.handle({handler: onReject, resolve, reject}, this.rejectedWith)
      })
    }
  }
}

class LaterPromise extends SynchronousPromise {
  _callWorkFunction (workfunction, resolve, reject) {
    setTimeout(() => {
      try {
        workfunction(resolve, reject)
      } catch (error) {
        reject(error)
      }
    }, 10)
  }
}
