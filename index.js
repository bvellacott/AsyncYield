function isPromise(val) {
  return !!val && typeof val === 'object' && typeof val.then === 'function' && typeof val.catch === 'function';
}

function async(gen) {
  if(typeof gen !== 'function')
    throw new Error('The argument to async must be a generator function');

  return function() {
    var args = [];
    for(var i = 0; i < arguments.length; i++)
      args.push(arguments[i]);

    return new Promise((resolve, reject) => {
      tryCatchIteration(gen.apply(null, args), undefined, false, resolve, reject) 
    });
  };
}

function tryCatchIteration(iter, prevVal, isError, resolve, reject) {
  try {
    runIteration(iter, prevVal, isError, resolve, reject); 
  } catch(e) {
    reject(e);
  }
}

function runIteration(iter, prevVal, isError, resolve, reject) {
  var retVal = isError ? iter.throw(prevVal) : iter.next(prevVal);
  var done = retVal.done;
  var value = retVal.value;

  if(isPromise(value)) {
    if(done) {
      return resolve(value);
    }

    value
    .then(res => { 
      tryCatchIteration(iter, res, false, resolve, reject);
    })
    .catch(err => { 
      tryCatchIteration(iter, err, true, resolve, reject);
    });
  }
  else {
    if(done) {
      return resolve(value);
    }
    tryCatchIteration(iter, value, false, resolve, reject);
  }
}

module.exports = async;