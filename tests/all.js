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

it('test error handling', done => {
  runErrors('error 1', 'error 2')
  .then(res => done(new Error("shouldn't resolve: " + res)))
  .catch(errors => {
    assert.deepEqual(errors, ['error 1', 'error 2']);
    done();
  })
  .catch(err => done(err));
});

it('test value resolving', done => {
  runResolves('hello 1', 'hello 2', 'no promise')
  .then(results => {
    assert.deepEqual(results, ['hello 1', 'hello 2', 'no promise']);
    done();
  })
  .catch(err => done(err));
});

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
