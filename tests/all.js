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

var runErrors = async(function*(err1, err2) {
  var errors = [];

  try {
    yield waitAndReject(err1);
  } catch(e) {
    errors.push(e);
  }

  try {
    yield throwImmediateError(err2);
  } catch(e) {
    errors.push(e);
  }

  throw errors;
});

var runResolves = async(function*(res1, res2, res3) {
  var results = [];

  results.push(yield waitAndResolve(res1));

  results.push(yield waitAndResolve(res2));

  results.push(yield res3);

  return results;
});

it('test error handling', function(done) {
  runErrors('error 1', 'error 2')
  .then(res => done(new Error("shouldn't resolve")))
  .catch(errors => {
    assert.deepEqual(errors, ['error 1', 'error 2']);
    done();
  })
  .catch(err => done(err));
});

it('test value resolving', function(done) {
  runResolves('hello 1', 'hello 2', 'no promise')
  .then(results => {
    assert.deepEqual(results, ['hello 1', 'hello 2', 'no promise']);
    done();
  })
  .catch(err => done(err));
});
