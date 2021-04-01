/* eslint no-unused-expressions:0 */ // for expect magic.

// Module under test
const ExtrinsicPromise = require("../src/index");

// Support
const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(chaiAsPromised);
chai.use(sinonChai);

module.exports = (describe, it) => {
    describe("extrinsic-promises", () => {
        it("should be requirable as an unamed import", () => {
            const ImportedClass = require("..");
            const inst = new ImportedClass();
            expect(ImportedClass).to.be.an.instanceof(Function);
            expect(ImportedClass.name).to.be.equal("ExtrinsicPromise");
            expect(inst)
                .to.have.property("constructor")
                .which.has.property("name")
                .which.equals("ExtrinsicPromise");
        });

        it('should be requirable as "default" on the module (legacy interface)', () => {
            const ImportedClass = require("..").default;
            const inst = new ImportedClass();
            expect(ImportedClass).to.be.an.instanceof(Function);
            expect(ImportedClass.name).to.be.equal("ExtrinsicPromise");
            expect(inst)
                .to.have.property("constructor")
                .which.has.property("name")
                .which.equals("ExtrinsicPromise");
        });

        it("Should fulfill promise when .fulfill() method is called", () => {
            // given
            const testFulfill = "test-value";
            const promiseUnderTest = new ExtrinsicPromise();

            // when
            promiseUnderTest.fulfill(testFulfill);

            // then
            return expect(promiseUnderTest).to.eventually.equal(testFulfill);
        });

        it("should have fulfill as a bound method", () => {
            // given
            const testFulfill = "test-value";
            const promiseUnderTest = new ExtrinsicPromise();
            const fulfill = promiseUnderTest.fulfill;

            // when
            fulfill(testFulfill);

            // then
            return expect(promiseUnderTest).to.eventually.equal(testFulfill);
        });

        it("should fulfill even if .reject() is called after .fulfill()", () => {
            // given
            const testFulfill = "test-value";
            const promiseUnderTest = new ExtrinsicPromise();

            // when
            promiseUnderTest.fulfill(testFulfill);
            promiseUnderTest.reject(new Error("test-error"));

            // then
            return expect(promiseUnderTest).to.eventually.equal(testFulfill);
        });

        it("should fulfill with the initial value if .fulfill() is called multiple times", () => {
            // given
            const testFulfill = "test-value";
            const promiseUnderTest = new ExtrinsicPromise();

            // when
            promiseUnderTest.fulfill(testFulfill);
            promiseUnderTest.fulfill("some other value");

            // then
            return expect(promiseUnderTest).to.eventually.equal(testFulfill);
        });

        it("Should fulfill promise when .fulfill() method is called later @slow", () => {
            // given
            const testFulfill = "test-value";
            const promiseUnderTest = new ExtrinsicPromise();

            // when
            return new Promise(resolve => {
                setTimeout(resolve, 10);
            })
                .then(() => {
                    promiseUnderTest.fulfill(testFulfill);
                    return null;
                })
                .then(() =>
                    expect(promiseUnderTest).to.eventually.equal(testFulfill)
                );
        });

        it("should reject promise when .reject() method is called", () => {
            // given
            const testReason = new Error("Test Reason");
            const promiseUnderTest = new ExtrinsicPromise();

            // when
            promiseUnderTest.reject(testReason);

            // then
            return expect(promiseUnderTest).to.be.rejectedWith(testReason);
        });

        it("should have reject as a bound method", () => {
            // given
            const testReason = new Error("Test Reason");
            const promiseUnderTest = new ExtrinsicPromise();
            const reject = promiseUnderTest.reject;

            // when
            reject(testReason);

            // then
            return expect(promiseUnderTest).to.be.rejectedWith(testReason);
        });

        it("should reject even if .fulfill() is called after .reject()", () => {
            // given
            const testReason = new Error("Test Reason");
            const promiseUnderTest = new ExtrinsicPromise();

            // when
            promiseUnderTest.reject(testReason);
            promiseUnderTest.fulfill("some value");

            // then
            return expect(promiseUnderTest).to.be.rejectedWith(testReason);
        });

        it("should reject with the initial reason if .reject() is called multiple times", () => {
            // given
            const testReason = new Error("Test Reason");
            const promiseUnderTest = new ExtrinsicPromise();

            // when
            promiseUnderTest.reject(testReason);
            promiseUnderTest.reject(new Error("Some other reason"));

            // then
            return expect(promiseUnderTest).to.be.rejectedWith(testReason);
        });

        it("should reject promise when .reject method is called later @slow", () => {
            // given
            const testReason = new Error("Test Reason");
            const promiseUnderTest = new ExtrinsicPromise();

            // when
            return new Promise(resolve => {
                setTimeout(resolve, 10);
            })
                .then(() => {
                    promiseUnderTest.reject(testReason);
                    return null;
                })
                .then(() =>
                    expect(promiseUnderTest).to.be.rejectedWith(testReason)
                );
        });

        describe("when a Promise calls the work function synchronously", () => {
            it("should fulfill promise when .fulfill method is called", () => {
                // given
                const testFulfill = "test-value";
                const promiseUnderTest = new ExtrinsicPromise(
                    wf => new SynchronousPromise(wf)
                );

                // when
                promiseUnderTest.fulfill(testFulfill);

                // then
                return expect(promiseUnderTest).to.eventually.equal(
                    testFulfill
                );
            });

            it("should reject promise when .reject method is called", () => {
                // given
                const testReason = new Error("Test Reason");
                const promiseUnderTest = new ExtrinsicPromise(
                    wf => new SynchronousPromise(wf)
                );

                // when
                promiseUnderTest.reject(testReason);

                // then
                return expect(promiseUnderTest).to.be.rejectedWith(testReason);
            });
        });

        describe("the hide() method", () => {
            it("should return a thennable that fulfills when the promise fulfills", () => {
                // given
                const testFulfill = "test-value";
                const promiseUnderTest = new ExtrinsicPromise();
                const hidden = promiseUnderTest.hide();

                // when
                promiseUnderTest.fulfill(testFulfill);

                // then
                return expect(hidden).to.eventually.equal(testFulfill);
            });

            it("should return a thennable that rejects when the promise rejects", () => {
                // given
                const testReason = new Error("Test Reason");
                const promiseUnderTest = new ExtrinsicPromise();
                const hidden = promiseUnderTest.hide();

                // when
                promiseUnderTest.reject(testReason);

                // then
                return expect(hidden).to.be.rejectedWith(testReason);
            });
        });

        describe("adopt() method", () => {
            it("should fulfill with the same value when the adopted promise fulfills", () => {
                // given
                const testFulfill = "test-value";
                const promiseUnderTest = new ExtrinsicPromise();
                const adoptedPromise = Promise.resolve(testFulfill);

                // when
                promiseUnderTest.adopt(adoptedPromise);

                // then
                return expect(promiseUnderTest).to.eventually.equal(
                    testFulfill
                );
            });

            it("should remain fulfilled with the same value if it was already fulfilled when the adopted promise is adopted", () => {
                // given
                const testFulfill = "test-value";
                const anotherFulfill = "another-value";
                const promiseUnderTest = new ExtrinsicPromise();
                const adoptedPromise = Promise.resolve(anotherFulfill);

                // when
                promiseUnderTest.fulfill(testFulfill);
                promiseUnderTest.adopt(adoptedPromise);

                // then
                return expect(promiseUnderTest).to.eventually.equal(
                    testFulfill
                );
            });

            it("should remain fulfilled with the same value if it was fulfilled after a promise is adopted but before it fulfills", () => {
                // given
                const testFulfill = "test-value";
                const anotherFulfill = "another-value";
                const promiseUnderTest = new ExtrinsicPromise();
                const adoptedPromise = new ExtrinsicPromise();

                // when
                promiseUnderTest.adopt(adoptedPromise);
                promiseUnderTest.fulfill(testFulfill);
                adoptedPromise.fulfill(anotherFulfill);

                // then
                return expect(promiseUnderTest).to.eventually.equal(
                    testFulfill
                );
            });

            it("should reject with the same reason when the adopted promise rejects", () => {
                // given
                const testReason = new Error("Test Reason");
                const promiseUnderTest = new ExtrinsicPromise();
                const adoptedPromise = Promise.reject(testReason);

                // when
                promiseUnderTest.adopt(adoptedPromise);

                // then
                return expect(promiseUnderTest).to.be.rejectedWith(testReason);
            });
        });

        describe("work() method", () => {
            it("should call the provided work function and fulfilled when the first arg is invoked", () => {
                // given
                const promiseUnderTest = new ExtrinsicPromise();
                const fulfillValue = "fulfilled-with-this";
                const workSpy = sinon.spy(fulfill => {
                    fulfill(fulfillValue);
                });

                // when
                promiseUnderTest.work(workSpy);

                // then
                return expect(promiseUnderTest)
                    .to.eventually.equal(fulfillValue)
                    .then(() => expect(workSpy).to.have.been.calledOnce);
            });

            it("should call the provided work function and reject when the second arg is invoked", () => {
                // given
                const promiseUnderTest = new ExtrinsicPromise();
                const testReason = new Error("test-error");
                const workSpy = sinon.spy((fulfill, reject) => {
                    reject(testReason);
                });

                // when
                promiseUnderTest.work(workSpy);

                // then
                return expect(promiseUnderTest)
                    .to.be.rejectedWith(testReason)
                    .then(() => expect(workSpy).to.have.been.calledOnce);
            });

            it("should call the provided work function and reject if it throws an error", () => {
                // given
                const promiseUnderTest = new ExtrinsicPromise();
                const testReason = new Error("test-error");
                const workSpy = sinon.spy(() => {
                    throw testReason;
                });

                // when
                promiseUnderTest.work(workSpy);

                // then
                return expect(promiseUnderTest)
                    .to.be.rejectedWith(testReason)
                    .then(() => expect(workSpy).to.have.been.calledOnce);
            });
        });

        describe("when promise constructor calls workfunction much later @slow", () => {
            it("should fulfill promise when .fulfill method is called immediately", () => {
                // given
                const testFulfill = "test-value";
                const promiseUnderTest = new ExtrinsicPromise(
                    wf => new LaterPromise(wf)
                );

                // when
                promiseUnderTest.fulfill(testFulfill);

                // then
                return expect(promiseUnderTest).to.eventually.equal(
                    testFulfill
                );
            });

            it("should fulfill even if .reject() is called after .fulfill()", () => {
                // given
                const testFulfill = "test-value";
                const promiseUnderTest = new ExtrinsicPromise(
                    wf => new LaterPromise(wf)
                );

                // when
                promiseUnderTest.fulfill(testFulfill);
                promiseUnderTest.reject(new Error("test-error"));

                // then
                return expect(promiseUnderTest).to.eventually.equal(
                    testFulfill
                );
            });

            it("should fulfill with the initial value if .fulfill() is called multiple times", () => {
                // given
                const testFulfill = "test-value";
                const promiseUnderTest = new ExtrinsicPromise(
                    wf => new LaterPromise(wf)
                );

                // when
                promiseUnderTest.fulfill(testFulfill);
                promiseUnderTest.fulfill("some other value");

                // then
                return expect(promiseUnderTest).to.eventually.equal(
                    testFulfill
                );
            });

            it("should reject promise when .reject method is called immediately", () => {
                // given
                const testReason = new Error("Test Reason");
                const promiseUnderTest = new ExtrinsicPromise(
                    wf => new LaterPromise(wf)
                );

                // when
                promiseUnderTest.reject(testReason);

                // then
                return expect(promiseUnderTest).to.be.rejectedWith(testReason);
            });

            it("should reject even if .reject() is called after .fulfill()", () => {
                // given
                const testReason = new Error("Test Reason");
                const promiseUnderTest = new ExtrinsicPromise(
                    wf => new LaterPromise(wf)
                );

                // when
                promiseUnderTest.reject(testReason);
                promiseUnderTest.fulfill("some value");

                // then
                return expect(promiseUnderTest).to.be.rejectedWith(testReason);
            });

            it("should reject with the initial reason if .reject() is called multiple times", () => {
                // given
                const testReason = new Error("Test Reason");
                const promiseUnderTest = new ExtrinsicPromise(
                    wf => new LaterPromise(wf)
                );

                // when
                promiseUnderTest.reject(testReason);
                promiseUnderTest.reject(new Error("Some other reason"));

                // then
                return expect(promiseUnderTest).to.be.rejectedWith(testReason);
            });
        });

        describe("when a custom promise constructor is provided that swaps fulfill and reject", () => {
            it("should reject when the .fulfill() method is called", () => {
                // given
                const promiseUnderTest = new ExtrinsicPromise(wf => {
                    return new Promise(wf).then(
                        () => {
                            throw new Error("test-error");
                        },
                        () => "fulfilled"
                    );
                });

                // when
                promiseUnderTest.fulfill();

                // then
                return expect(promiseUnderTest).to.be.rejectedWith(
                    "test-error"
                );
            });
        });
    });

    class SynchronousPromise {
        constructor(workfunction) {
            this.state = "pending";
            this.onFulfill = [];
            this.onReject = [];

            const fulfill = withValue => {
                this.state = "fulfilled";
                this.fulfilledWith = withValue;
                this.onFulfill.forEach(h => this.handle(h, withValue));
            };

            const reject = because => {
                this.state = "rejected";
                this.rejectedWith = because;
                this.onReject.forEach(h => this.handle(h, because));
            };

            this._callWorkFunction(workfunction, fulfill, reject);
        }

        _callWorkFunction(workfunction, fulfill, reject) {
            try {
                workfunction(fulfill, reject);
            } catch (error) {
                reject(error);
            }
        }

        handle({ handler, fulfill, reject }, value) {
            try {
                fulfill(handler(value));
            } catch (error) {
                reject(error);
            }
        }

        then(onFulfill, onReject) {
            if (this.state === "pending") {
                return new SynchronousPromise((fulfill, reject) => {
                    this.onFulfill.push({
                        handler: onFulfill,
                        fulfill,
                        reject
                    });
                    this.onReject.push({ handler: onReject, fulfill, reject });
                });
            } else if (this.state === "fulfilled") {
                return new SynchronousPromise((fulfill, reject) => {
                    this.handle(
                        { handler: onFulfill, fulfill, reject },
                        this.fulfilledWith
                    );
                });
            } else if (this.state === "rejected") {
                return new SynchronousPromise((fulfill, reject) => {
                    this.handle(
                        { handler: onReject, fulfill, reject },
                        this.rejectedWith
                    );
                });
            }
        }
    }

    class LaterPromise extends SynchronousPromise {
        _callWorkFunction(workfunction, fulfill, reject) {
            setTimeout(() => {
                try {
                    workfunction(fulfill, reject);
                } catch (error) {
                    reject(error);
                }
            }, 10);
        }
    }
};
