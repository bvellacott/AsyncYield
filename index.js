function Undefined(){}; 

function isPromise(val) {
  return !!val && typeof val === 'object' && typeof val.then === 'function' && typeof val.catch === 'function';
}

function argsToArray(_args) {
  var args = [];
  for(var i = 0; i < _args.length; i++)
    args.push(_args[i]);
  return args;
}

function async(gen) {
  if(typeof gen !== 'function')
    throw new Error('The argument to async must be a generator function');

  function Async() {
    var args = argsToArray(arguments);
    return new Promise((resolve, reject) => {
      tryCatchIteration(gen.apply(null, args), new Undefined(), false, resolve, reject) 
    });
  };

// add testability
  Async.yieldAll = function yieldAll() {
    var args = argsToArray(arguments);
    return new Promise((resolve, reject) => {
      tryCatchIteration(gen.apply(null, args), new Undefined(), false, resolve, reject, []) 
    });
  }

  return Async;
}

function tryCatchIteration(iter, prevVal, isError, resolve, reject, results) {
  try {
    runIteration(iter, prevVal, isError, resolve, reject, results); 
  } catch(e) {
    reject(genResolvable(e, results));
  }
}

function runIteration(iter, prevVal, isError, resolve, reject, results) {
  // if we want to collect all results and/or errors
  if(!(prevVal instanceof Undefined) && typeof results !== 'undefined')
    results.push(prevVal);

  var retVal = isError ? iter.throw(prevVal) : iter.next(prevVal);

  var done = retVal.done;
  var value = retVal.value;

  if(!isPromise(value))
    value = isError ? Promise.reject(value) : Promise.resolve(value);

  if(done) {
    return value
      .then(res => resolve(genResolvable(res, results)))
      .catch(err => reject(genResolvable(err, results)));
  }

  value
  .then(res => { 
    tryCatchIteration(iter, res, false, resolve, reject, results);
  })
  .catch(err => { 
    tryCatchIteration(iter, err, true, resolve, reject, results);
  });
}

function genResolvable(value, results) {
      // if all results were collected resolve them. Else resolve the return value of the async function
    if(results) {
      results.push(value);
      return results;
    }
    return value;
}

module.exports = async;