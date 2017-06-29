var assert = require('assert');
var async = require('../index');

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

var runErrors = async(function*() {
  var errors = [];

  try {
    yield waitAndReject('error 1');
  } catch(e) {
    errors.push(e);
  }

  try {
    yield throwImmediateError('error 2');
  } catch(e) {
    errors.push(e);
  }

  throw errors;
});

var runResolves = async(function*() {
  var results = [];

  results.push(yield waitAndResolve('hello 1'));

  results.push(yield waitAndResolve('hello 2'));

  results.push(yield 'no promise');

  return results;
});

it('test error handling', function(done) {
  runErrors()
  .then(res => done(new Error("shouldn't resolve")))
  .catch(errors => {
    assert.deepEqual(errors, ['error 1', 'error 2']);
    done();
  })
  .catch(err => done(err));
});

it('test value resolving', function(done) {
  runResolves()
  .then(results => {
    assert.deepEqual(results, ['hello 1', 'hello 2', 'no promise']);
    done();
  })
  .catch(err => done(err));
});
