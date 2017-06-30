# AsyncYield
My implementation of async await using generator functions

## installation

```bash
npm install --save async-yield
```

## usage

```js
var async = require('async-yield');

// test
function waitAndResolve(res) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(res);
    }, 10);
  });
}

function waitAndReject(err) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(err);
    }, 10);
  });
}

function throwImmediateError(err) {
  throw err;
}

var runResolves = async(function*(res1, res2) {
  var results = [];

  // resolving promise
  results.push(yield waitAndResolve(res1));

  // no promise - just a plain js value
  results.push(yield res2);

  // this value will resolve the final async promise
  return results;
});

var runErrors = async(function*(err1, err2) {
  var errors = [];

  // rejecting promise
  try {
    yield waitAndReject(err1);
  } catch(e) {
    errors.push(e);
  }

  // no promise - just a simple exception thrown
  try {
    yield throwImmediateError(err2);
  } catch(e) {
    errors.push(e);
  }

  // this will reject the final async promise
  throw errors;
});

runResolves('result 1', 'result 2').then(console.log);
// [ 'result 1', 'result 2' ]

runErrors('error 1', 'error 2').catch(console.error);
// [ 'error 1', 'error 2' ]
```

## testing async functions
When you test your async functions, you might want to inspect the intermediate resolved and rejected yield values. You can do this by calling the yieldAll method.

### An example using mocha
```
var assert = require('assert');

var runErrorsYA = async(function*(err1, err2, err3) {
  try {
    yield waitAndReject(err1);
  } catch(e) {
    console.error(e);
  }

  try {
    yield throwImmediateError(err2);
  } catch(e) {
    console.error(e);
  }

  throw err3;
});

var runResolvesYA = async(function*(res1, res2, res3) {
  yield waitAndResolve(res1);

  yield res2;

  return res3;
});

it('test yieldAll for errors', done => {
  runErrorsYA.yieldAll('error 1', 'error 2', 'error 3')
  .then(res => done(new Error("shouldn't resolve: " + res)))
  .catch(errors => {
    // only rejected promises and uncaught errors should be listed, that's why 'error 2' is not
    // expected to show up
    assert.deepEqual(errors, ['error 1', 'error 3']);
    done();
  })
  .catch(err => done(err));
});

it('test yieldAll value resolving', done => {
  runResolvesYA.yieldAll('hello 1', 'hello 2', 'no promise')
  .then(results => {
    assert.deepEqual(results, ['hello 1', 'hello 2', 'no promise']);
    done();
  })
  .catch(err => done(err));
});
``` 

## build and test

```bash
npm install
```

```bash
npm test
```
or
```bash
node runTests
```