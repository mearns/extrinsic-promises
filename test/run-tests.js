#!/usr/bin/env node
const defineTests = require("./test-cases");

const stack = [];
const testCases = [];

function describe(description, cb) {
    stack.push(description);
    cb();
    stack.pop();
}

function it(description, testFunc) {
    stack.push(description);
    testCases.push([stack.slice(), testFunc]);
    stack.pop();
}

defineTests(describe, it);
const finished = testCases.reduce((p, [description, testFunc]) => {
    return p.then(() => {
        const descText = description.join(" ");
        console.log(descText);
        return testFunc();
    });
}, Promise.resolve());

finished
    .then(() => {
        console.log(`Success: ${testCases.length} tests`);
    })
    .catch(error => {
        process.exitCode = 1;
        console.error(error);
        console.error(`Test failed.`);
    })
    .then(() => {
        console.log(`Node Version: ${process.version}`);
    });
