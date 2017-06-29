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

## build and test

```bash
npm install
```

```bash
npm test
```