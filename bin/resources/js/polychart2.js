// Underscore.js 1.4.4
// ===================

// > http://underscorejs.org
// > (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
// > Underscore may be freely distributed under the MIT license.

// Baseline setup
// --------------
(function() {

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);




// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël 2.1.0 - JavaScript Vector Library                          │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)    │ \\
// │ Copyright © 2008-2012 Sencha Labs (http://sencha.com)              │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license.│ \\
// └────────────────────────────────────────────────────────────────────┘ \\
// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.4.2 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.4.2",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]

     * Fires event with given `name`, given scope and other parameters.

     > Arguments

     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers

     = (object) array of returned values from the listeners
    \*/
        eve = function (name, scope) {
			name = String(name);
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
		// Undocumented. Debug only.
		eve._events = events;
    /*\
     * eve.listeners
     [ method ]

     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.

     > Arguments

     - name (string) name of the event, dot (`.`) or slash (`/`) separated

     = (array) array of event handlers
    \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eatIt)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catchIt)(1);
     * This will ensure that `catchIt()` function will be called before `eatIt()`.
	 *
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
    eve.on = function (name, f) {
		name = String(name);
		if (typeof f != "function") {
			return function () {};
		}
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n: {}});
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.f
     [ method ]
     **
     * Returns function that will fire given event with optional arguments.
	 * Arguments that will be passed to the result function will be also
	 * concated to the list of final arguments.
 	 | el.onclick = eve.f("click", 1, 2);
 	 | eve.on("click", function (a, b, c) {
 	 |     console.log(a, b, c); // 1, 2, [event object]
 	 | });
     > Arguments
	 - event (string) event name
	 - varargs (…) and any other arguments
	 = (function) possible event handler function
    \*/
	eve.f = function (event) {
		var attrs = [].slice.call(arguments, 1);
		return function () {
			eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
		};
	};
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
    \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.nts
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     **
     = (array) names of the event
    \*/
    eve.nts = function () {
        return current_event.split(separator);
    };
    /*\
     * eve.off
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
	 * If no arguments specified all the events will be cleared.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
    /*\
     * eve.unbind
     [ method ]
     **
     * See @eve.off
    \*/
    eve.off = eve.unbind = function (name, f) {
		if (!name) {
		    eve._events = events = {n: {}};
			return;
		}
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
    eve.once = function (name, f) {
        var f2 = function () {
            eve.unbind(name, f2);
            return f.apply(this, arguments);
        };
        return eve.on(name, f2);
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(this);
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ "Raphaël 2.1.0" - JavaScript Vector Library                         │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function (glob, factory) {
    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define(["eve"], function( eve ) {
            return factory(glob, eve);
        });
    } else {
        // Browser globals (glob is window)
        // Raphael adds itself to window
        factory(glob, glob.eve);
    }
}(this, function (window, eve) {
    /*\
     * Raphael
     [ method ]
     **
     * Creates a canvas object on which to draw.
     * You must do this first, as all future calls to drawing methods
     * from this instance will be bound to this canvas.
     > Parameters
     **
     - container (HTMLElement|string) DOM element or its ID which is going to be a parent for drawing surface
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - x (number)
     - y (number)
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - all (array) (first 3 or 4 elements in the array are equal to [containerID, width, height] or [x, y, width, height]. The rest are element descriptions in format {type: type, <attributes>}). See @Paper.add.
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - onReadyCallback (function) function that is going to be called on DOM ready event. You can also subscribe to this event via Eve’s “DOMLoad” event. In this case method returns `undefined`.
     = (object) @Paper
     > Usage
     | // Each of the following examples create a canvas
     | // that is 320px wide by 200px high.
     | // Canvas is created at the viewport’s 10,50 coordinate.
     | var paper = Raphael(10, 50, 320, 200);
     | // Canvas is created at the top left corner of the #notepad element
     | // (or its top right corner in dir="rtl" elements)
     | var paper = Raphael(document.getElementById("notepad"), 320, 200);
     | // Same as above
     | var paper = Raphael("notepad", 320, 200);
     | // Image dump
     | var set = Raphael(["notepad", 320, 200, {
     |     type: "rect",
     |     x: 10,
     |     y: 10,
     |     width: 25,
     |     height: 25,
     |     stroke: "#f00"
     | }, {
     |     type: "text",
     |     x: 30,
     |     y: 40,
     |     text: "Dump"
     | }]);
    \*/
    function R(first) {
        if (R.is(first, "function")) {
            return loaded ? first() : eve.on("raphael.DOMload", first);
        } else if (R.is(first, array)) {
            return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
        } else {
            var args = Array.prototype.slice.call(arguments, 0);
            if (R.is(args[args.length - 1], "function")) {
                var f = args.pop();
                return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("raphael.DOMload", function () {
                    f.call(R._engine.create[apply](R, args));
                });
            } else {
                return R._engine.create[apply](R, arguments);
            }
        }
    }
    R.version = "2.1.0";
    R.eve = eve;
    var loaded,
        separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        g = {
            doc: document,
            win: window
        },
        oldRaphael = {
            was: Object.prototype[has].call(g.win, "Raphael"),
            is: g.win.Raphael
        },
        Paper = function () {
            /*\
             * Paper.ca
             [ property (object) ]
             **
             * Shortcut for @Paper.customAttributes
            \*/
            /*\
             * Paper.customAttributes
             [ property (object) ]
             **
             * If you have a set of attributes that you would like to represent
             * as a function of some number you can do it easily with custom attributes:
             > Usage
             | paper.customAttributes.hue = function (num) {
             |     num = num % 1;
             |     return {fill: "hsb(" + num + ", 0.75, 1)"};
             | };
             | // Custom attribute “hue” will change fill
             | // to be given hue with fixed saturation and brightness.
             | // Now you can use it like this:
             | var c = paper.circle(10, 10, 10).attr({hue: .45});
             | // or even like this:
             | c.animate({hue: 1}, 1e3);
             | 
             | // You could also create custom attribute
             | // with multiple parameters:
             | paper.customAttributes.hsb = function (h, s, b) {
             |     return {fill: "hsb(" + [h, s, b].join(",") + ")"};
             | };
             | c.attr({hsb: "0.5 .8 1"});
             | c.animate({hsb: [1, 0, 0.5]}, 1e3);
            \*/
            this.ca = this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = ('ontouchstart' in g.win) || g.win.DocumentTouch && g.doc instanceof DocumentTouch, //taken from Modernizr touch test
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        lowerCase = Str.prototype.toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object.prototype.toString,
        paper = {},
        push = "push",
        ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = Str.prototype.toUpperCase,
        availableAttrs = R._availableAttrs = {
            "arrow-end": "none",
            "arrow-start": "none",
            blur: 0,
            "clip-rect": "0 0 1e9 1e9",
            cursor: "default",
            cx: 0,
            cy: 0,
            fill: "#fff",
            "fill-opacity": 1,
            font: '10px "Arial"',
            "font-family": '"Arial"',
            "font-size": "10",
            "font-style": "normal",
            "font-weight": 400,
            gradient: 0,
            height: 0,
            href: "http://raphaeljs.com/",
            "letter-spacing": 0,
            opacity: 1,
            path: "M0,0",
            r: 0,
            rx: 0,
            ry: 0,
            src: "",
            stroke: "#000",
            "stroke-dasharray": "",
            "stroke-linecap": "butt",
            "stroke-linejoin": "butt",
            "stroke-miterlimit": 0,
            "stroke-opacity": 1,
            "stroke-width": 1,
            target: "_blank",
            "text-anchor": "middle",
            title: "Raphael",
            transform: "",
            width: 0,
            x: 0,
            y: 0
        },
        availableAnimAttrs = R._availableAnimAttrs = {
            blur: nu,
            "clip-rect": "csv",
            cx: nu,
            cy: nu,
            fill: "colour",
            "fill-opacity": nu,
            "font-size": nu,
            height: nu,
            opacity: nu,
            path: "path",
            r: nu,
            rx: nu,
            ry: nu,
            stroke: "colour",
            "stroke-opacity": nu,
            "stroke-width": nu,
            transform: "transform",
            width: nu,
            x: nu,
            y: nu
        },
        whitespace = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g,
        commaSpaces = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        tCommand = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,
        eldata = {},
        sortByKey = function (a, b) {
            return a.key - b.key;
        },
        sortByNumber = function (a, b) {
            return toFloat(a) - toFloat(b);
        },
        fun = function () {},
        pipe = function (x) {
            return x;
        },
        rectPath = R._rectPath = function (x, y, w, h, r) {
            if (r) {
                return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
            }
            return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
        },
        ellipsePath = function (x, y, rx, ry) {
            if (ry == null) {
                ry = rx;
            }
            return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
        },
        getPath = R._getPath = {
            path: function (el) {
                return el.attr("path");
            },
            circle: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.r);
            },
            ellipse: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.rx, a.ry);
            },
            rect: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height, a.r);
            },
            image: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height);
            },
            text: function (el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            },
            set : function(el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            }
        },
        /*\
         * Raphael.mapPath
         [ method ]
         **
         * Transform the path string with given matrix.
         > Parameters
         - path (string) path string
         - matrix (object) see @Matrix
         = (string) transformed path string
        \*/
        mapPath = R.mapPath = function (path, matrix) {
            if (!matrix) {
                return path;
            }
            var x, y, i, j, ii, jj, pathi;
            path = path2curve(path);
            for (i = 0, ii = path.length; i < ii; i++) {
                pathi = path[i];
                for (j = 1, jj = pathi.length; j < jj; j += 2) {
                    x = matrix.x(pathi[j], pathi[j + 1]);
                    y = matrix.y(pathi[j], pathi[j + 1]);
                    pathi[j] = x;
                    pathi[j + 1] = y;
                }
            }
            return path;
        };

    R._g = g;
    /*\
     * Raphael.type
     [ property (string) ]
     **
     * Can be “SVG”, “VML” or empty, depending on browser support.
    \*/
    R.type = (g.win.SVGAngle || g.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = g.doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return (R.type = E);
        }
        d = null;
    }
    /*\
     * Raphael.svg
     [ property (boolean) ]
     **
     * `true` if browser supports SVG.
    \*/
    /*\
     * Raphael.vml
     [ property (boolean) ]
     **
     * `true` if browser supports VML.
    \*/
    R.svg = !(R.vml = R.type == "VML");
    R._Paper = Paper;
    /*\
     * Raphael.fn
     [ property (object) ]
     **
     * You can add your own method to the canvas. For example if you want to draw a pie chart,
     * you can create your own pie chart function and ship it as a Raphaël plugin. To do this
     * you need to extend the `Raphael.fn` object. You should modify the `fn` object before a
     * Raphaël instance is created, otherwise it will take no effect. Please note that the
     * ability for namespaced plugins was removed in Raphael 2.0. It is up to the plugin to
     * ensure any namespacing ensures proper context.
     > Usage
     | Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
     |     return this.path( ... );
     | };
     | // or create namespace
     | Raphael.fn.mystuff = {
     |     arrow: function () {…},
     |     star: function () {…},
     |     // etc…
     | };
     | var paper = Raphael(10, 10, 630, 480);
     | // then use it
     | paper.arrow(10, 10, 30, 30, 5).attr({fill: "#f00"});
     | paper.mystuff.arrow();
     | paper.mystuff.star();
    \*/
    R.fn = paperproto = Paper.prototype = R.prototype;
    R._id = 0;
    R._oid = 0;
    /*\
     * Raphael.is
     [ method ]
     **
     * Handfull replacement for `typeof` operator.
     > Parameters
     - o (…) any object or primitive
     - type (string) name of the type, i.e. “string”, “function”, “number”, etc.
     = (boolean) is given value is of given type
    \*/
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        if (type == "array") {
            return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };

    function clone(obj) {
        if (Object(obj) !== obj) {
            return obj;
        }
        var res = new obj.constructor;
        for (var key in obj) if (obj[has](key)) {
            res[key] = clone(obj[key]);
        }
        return res;
    }

    /*\
     * Raphael.angle
     [ method ]
     **
     * Returns angle between two or three points
     > Parameters
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     - x3 (number) #optional x coord of third point
     - y3 (number) #optional y coord of third point
     = (number) angle in degrees.
    \*/
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    /*\
     * Raphael.rad
     [ method ]
     **
     * Transform angle to radians
     > Parameters
     - deg (number) angle in degrees
     = (number) angle in radians.
    \*/
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    /*\
     * Raphael.deg
     [ method ]
     **
     * Transform angle to degrees
     > Parameters
     - deg (number) angle in radians
     = (number) angle in degrees.
    \*/
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    /*\
     * Raphael.snapTo
     [ method ]
     **
     * Snaps given value to given grid.
     > Parameters
     - values (array|number) given array of values or step of the grid
     - value (number) value to adjust
     - tolerance (number) #optional tolerance for snapping. Default is `10`.
     = (number) adjusted value.
    \*/
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };

    /*\
     * Raphael.createUUID
     [ method ]
     **
     * Returns RFC4122, version 4 ID
    \*/
    var createUUID = R.createUUID = (function (uuidRegEx, uuidReplacer) {
        return function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
        };
    })(/[xy]/g, function (c) {
        var r = math.random() * 16 | 0,
            v = c == "x" ? r : (r & 3 | 8);
        return v.toString(16);
    });

    /*\
     * Raphael.setWindow
     [ method ]
     **
     * Used when you need to draw in `&lt;iframe>`. Switched window to the iframe one.
     > Parameters
     - newwin (window) new window object
    \*/
    R.setWindow = function (newwin) {
        eve("raphael.setWindow", R, g.win, newwin);
        g.win = newwin;
        g.doc = g.win.document;
        if (R._engine.initWin) {
            R._engine.initWin(g.win);
        }
    };
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color).replace(trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value.toString(16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = g.doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            g.doc.body.appendChild(i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    },
    prepareRGB = function (r, g, b) {
        if (g == null && R.is(r, "object") && "r" in r && "g" in r && "b" in r) {
            b = r.b;
            g = r.g;
            r = r.r;
        }
        if (g == null && R.is(r, string)) {
            var clr = R.getRGB(r);
            r = clr.r;
            g = clr.g;
            b = clr.b;
        }
        if (r > 1 || g > 1 || b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }

        return [r, g, b];
    },
    packageRGB = function (r, g, b, o) {
        r *= 255;
        g *= 255;
        b *= 255;
        var rgb = {
            r: r,
            g: g,
            b: b,
            hex: R.rgb(r, g, b),
            toString: rgbtoString
        };
        R.is(o, "finite") && (rgb.opacity = o);
        return rgb;
    };

    /*\
     * Raphael.color
     [ method ]
     **
     * Parses the color string and returns object with all values for the given color.
     > Parameters
     - clr (string) color string in one of the supported formats (see @Raphael.getRGB)
     = (object) Combined RGB & HSB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) `true` if string can’t be parsed,
     o     h (number) hue,
     o     s (number) saturation,
     o     v (number) value (brightness),
     o     l (number) lightness
     o }
    \*/
    R.color = function (clr) {
        var rgb;
        if (R.is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
            rgb = R.hsb2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else if (R.is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
            rgb = R.hsl2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else {
            if (R.is(clr, "string")) {
                clr = R.getRGB(clr);
            }
            if (R.is(clr, "object") && "r" in clr && "g" in clr && "b" in clr) {
                rgb = R.rgb2hsl(clr);
                clr.h = rgb.h;
                clr.s = rgb.s;
                clr.l = rgb.l;
                rgb = R.rgb2hsb(clr);
                clr.v = rgb.b;
            } else {
                clr = {hex: "none"};
                clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
            }
        }
        clr.toString = rgbtoString;
        return clr;
    };
    /*\
     * Raphael.hsb2rgb
     [ method ]
     **
     * Converts HSB values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - v (number) value or brightness
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsb2rgb = function (h, s, v, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            v = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.hsl2rgb
     [ method ]
     **
     * Converts HSL values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsl2rgb = function (h, s, l, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = 2 * s * (l < .5 ? l : 1 - l);
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = l - C / 2;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.rgb2hsb
     [ method ]
     **
     * Converts RGB values to HSB object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSB object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     b (number) brightness
     o }
    \*/
    R.rgb2hsb = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, V, C;
        V = mmax(r, g, b);
        C = V - mmin(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4
            );
        H = ((H + 360) % 6) * 60 / 360;
        S = C == 0 ? 0 : C / V;
        return {h: H, s: S, b: V, toString: hsbtoString};
    };
    /*\
     * Raphael.rgb2hsl
     [ method ]
     **
     * Converts RGB values to HSL object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSL object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     l (number) luminosity
     o }
    \*/
    R.rgb2hsl = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, L, M, m, C;
        M = mmax(r, g, b);
        m = mmin(r, g, b);
        C = M - m;
        H = (C == 0 ? null :
             M == r ? (g - b) / C :
             M == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = ((H + 360) % 6) * 60 / 360;
        L = (M + m) / 2;
        S = (C == 0 ? 0 :
             L < .5 ? C / (2 * L) :
                      C / (2 - 2 * L));
        return {h: H, s: S, l: L, toString: hsltoString};
    };
    R._path2string = function () {
        return this.join(",").replace(p2s, "$1");
    };
    function repush(array, item) {
        for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
            return array.push(array.splice(i, 1)[0]);
        }
    }
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0),
                args = arg.join("\u2400"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count.length >= 1e3 && delete cache[count.shift()];
            count.push(args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    var preload = R._preload = function (src, f) {
        var img = g.doc.createElement("img");
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function () {
            f.call(this);
            this.onload = null;
            g.doc.body.removeChild(this);
        };
        img.onerror = function () {
            g.doc.body.removeChild(this);
        };
        g.doc.body.appendChild(img);
        img.src = src;
    };

    function clrToString() {
        return this.hex;
    }

    /*\
     * Raphael.getRGB
     [ method ]
     **
     * Parses colour string as RGB object
     > Parameters
     - colour (string) colour string in one of formats:
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsl(•••, •••, •••) — same as hsb</li>
     #     <li>hsl(•••%, •••%, •••%) — same as hsb</li>
     # </ul>
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) true if string can’t be parsed
     o }
    \*/
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none", toString: clrToString};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue, toString: clrToString};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
    }, R);
    /*\
     * Raphael.hsb
     [ method ]
     **
     * Converts HSB values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - b (number) value or brightness
     = (string) hex representation of the colour.
    \*/
    R.hsb = cacher(function (h, s, b) {
        return R.hsb2rgb(h, s, b).hex;
    });
    /*\
     * Raphael.hsl
     [ method ]
     **
     * Converts HSL values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (string) hex representation of the colour.
    \*/
    R.hsl = cacher(function (h, s, l) {
        return R.hsl2rgb(h, s, l).hex;
    });
    /*\
     * Raphael.rgb
     [ method ]
     **
     * Converts RGB values to hex representation of the colour.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (string) hex representation of the colour.
    \*/
    R.rgb = cacher(function (r, g, b) {
        return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    });
    /*\
     * Raphael.getColor
     [ method ]
     **
     * On each call returns next colour in the spectrum. To reset it back to red call @Raphael.getColor.reset
     > Parameters
     - value (number) #optional brightness, default is `0.75`
     = (string) hex representation of the colour.
    \*/
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    /*\
     * Raphael.getColor.reset
     [ method ]
     **
     * Resets spectrum position for @Raphael.getColor back to red.
    \*/
    R.getColor.reset = function () {
        delete this.start;
    };

    // http://schepers.cc/getting-to-the-point
    function catmullRom2bezier(crp, z) {
        var d = [];
        for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
            var p = [
                        {x: +crp[i - 2], y: +crp[i - 1]},
                        {x: +crp[i],     y: +crp[i + 1]},
                        {x: +crp[i + 2], y: +crp[i + 3]},
                        {x: +crp[i + 4], y: +crp[i + 5]}
                    ];
            if (z) {
                if (!i) {
                    p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
                } else if (iLen - 4 == i) {
                    p[3] = {x: +crp[0], y: +crp[1]};
                } else if (iLen - 2 == i) {
                    p[2] = {x: +crp[0], y: +crp[1]};
                    p[3] = {x: +crp[2], y: +crp[3]};
                }
            } else {
                if (iLen - 4 == i) {
                    p[3] = p[2];
                } else if (!i) {
                    p[0] = {x: +crp[i], y: +crp[i + 1]};
                }
            }
            d.push(["C",
                  (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                  (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                  (p[1].x + 6 * p[2].x - p[3].x) / 6,
                  (p[1].y + 6*p[2].y - p[3].y) / 6,
                  p[2].x,
                  p[2].y
            ]);
        }

        return d;
    }
    /*\
     * Raphael.parsePathString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of arrays of path segments.
     > Parameters
     - pathString (string|array) path string or array of segments (in the last case it will be returned straight away)
     = (array) array of segments.
    \*/
    R.parsePathString = function (pathString) {
        if (!pathString) {
            return null;
        }
        var pth = paths(pathString);
        if (pth.arr) {
            return pathClone(pth.arr);
        }

        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data.length) {
            Str(pathString).replace(pathCommand, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                if (name == "r") {
                    data.push([b][concat](params));
                } else while (params.length >= paramCounts[name]) {
                    data.push([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data.toString = R._path2string;
        pth.arr = pathClone(data);
        return data;
    };
    /*\
     * Raphael.parseTransformString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of transformations.
     > Parameters
     - TString (string|array) transform string or array of transformations (in the last case it will be returned straight away)
     = (array) array of transformations.
    \*/
    R.parseTransformString = cacher(function (TString) {
        if (!TString) {
            return null;
        }
        var paramCounts = {r: 3, s: 4, t: 2, m: 6},
            data = [];
        if (R.is(TString, array) && R.is(TString[0], array)) { // rough assumption
            data = pathClone(TString);
        }
        if (!data.length) {
            Str(TString).replace(tCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                data.push([b][concat](params));
            });
        }
        data.toString = R._path2string;
        return data;
    });
    // PATHS
    var paths = function (ps) {
        var p = paths.ps = paths.ps || {};
        if (p[ps]) {
            p[ps].sleep = 100;
        } else {
            p[ps] = {
                sleep: 100
            };
        }
        setTimeout(function () {
            for (var key in p) if (p[has](key) && key != ps) {
                p[key].sleep--;
                !p[key].sleep && delete p[key];
            }
        });
        return p[ps];
    };
    /*\
     * Raphael.findDotsAtSegment
     [ method ]
     **
     * Utility method
     **
     * Find dot coordinates on the given cubic bezier curve at the given t.
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     - t (number) position on the curve (0..1)
     = (object) point information in format:
     o {
     o     x: (number) x coordinate of the point
     o     y: (number) y coordinate of the point
     o     m: {
     o         x: (number) x coordinate of the left anchor
     o         y: (number) y coordinate of the left anchor
     o     }
     o     n: {
     o         x: (number) x coordinate of the right anchor
     o         y: (number) y coordinate of the right anchor
     o     }
     o     start: {
     o         x: (number) x coordinate of the start of the curve
     o         y: (number) y coordinate of the start of the curve
     o     }
     o     end: {
     o         x: (number) x coordinate of the end of the curve
     o         y: (number) y coordinate of the end of the curve
     o     }
     o     alpha: (number) angle of the curve derivative at the point
     o }
    \*/
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            t13 = pow(t1, 3),
            t12 = pow(t1, 2),
            t2 = t * t,
            t3 = t2 * t,
            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
            ax = t1 * p1x + t * c1x,
            ay = t1 * p1y + t * c1y,
            cx = t1 * c2x + t * p2x,
            cy = t1 * c2y + t * p2y,
            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {
            x: x,
            y: y,
            m: {x: mx, y: my},
            n: {x: nx, y: ny},
            start: {x: ax, y: ay},
            end: {x: cx, y: cy},
            alpha: alpha
        };
    };
    /*\
     * Raphael.bezierBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given cubic bezier curve
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     * or
     - bez (array) array of six points for bezier curve
     = (object) point information in format:
     o {
     o     min: {
     o         x: (number) x coordinate of the left point
     o         y: (number) y coordinate of the top point
     o     }
     o     max: {
     o         x: (number) x coordinate of the right point
     o         y: (number) y coordinate of the bottom point
     o     }
     o }
    \*/
    R.bezierBBox = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        if (!R.is(p1x, "array")) {
            p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
        }
        var bbox = curveDim.apply(null, p1x);
        return {
            x: bbox.min.x,
            y: bbox.min.y,
            x2: bbox.max.x,
            y2: bbox.max.y,
            width: bbox.max.x - bbox.min.x,
            height: bbox.max.y - bbox.min.y
        };
    };
    /*\
     * Raphael.isPointInsideBBox
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside bounding boxes.
     > Parameters
     - bbox (string) bounding box
     - x (string) x coordinate of the point
     - y (string) y coordinate of the point
     = (boolean) `true` if point inside
    \*/
    R.isPointInsideBBox = function (bbox, x, y) {
        return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
    };
    /*\
     * Raphael.isBBoxIntersect
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if two bounding boxes intersect
     > Parameters
     - bbox1 (string) first bounding box
     - bbox2 (string) second bounding box
     = (boolean) `true` if they intersect
    \*/
    R.isBBoxIntersect = function (bbox1, bbox2) {
        var i = R.isPointInsideBBox;
        return i(bbox2, bbox1.x, bbox1.y)
            || i(bbox2, bbox1.x2, bbox1.y)
            || i(bbox2, bbox1.x, bbox1.y2)
            || i(bbox2, bbox1.x2, bbox1.y2)
            || i(bbox1, bbox2.x, bbox2.y)
            || i(bbox1, bbox2.x2, bbox2.y)
            || i(bbox1, bbox2.x, bbox2.y2)
            || i(bbox1, bbox2.x2, bbox2.y2)
            || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
            && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
    };
    function base3(t, p1, p2, p3, p4) {
        var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
        return t * t2 - 3 * p1 + 3 * p2;
    }
    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
        if (z == null) {
            z = 1;
        }
        z = z > 1 ? 1 : z < 0 ? 0 : z;
        var z2 = z / 2,
            n = 12,
            Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
            Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
            sum = 0;
        for (var i = 0; i < n; i++) {
            var ct = z2 * Tvalues[i] + z2,
                xbase = base3(ct, x1, x2, x3, x4),
                ybase = base3(ct, y1, y2, y3, y4),
                comb = xbase * xbase + ybase * ybase;
            sum += Cvalues[i] * math.sqrt(comb);
        }
        return z2 * sum;
    }
    function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
        if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
            return;
        }
        var t = 1,
            step = t / 2,
            t2 = t - step,
            l,
            e = .01;
        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        while (abs(l - ll) > e) {
            step /= 2;
            t2 += (l < ll ? 1 : -1) * step;
            l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        }
        return t2;
    }
    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        if (
            mmax(x1, x2) < mmin(x3, x4) ||
            mmin(x1, x2) > mmax(x3, x4) ||
            mmax(y1, y2) < mmin(y3, y4) ||
            mmin(y1, y2) > mmax(y3, y4)
        ) {
            return;
        }
        var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
            ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
            denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (!denominator) {
            return;
        }
        var px = nx / denominator,
            py = ny / denominator,
            px2 = +px.toFixed(2),
            py2 = +py.toFixed(2);
        if (
            px2 < +mmin(x1, x2).toFixed(2) ||
            px2 > +mmax(x1, x2).toFixed(2) ||
            px2 < +mmin(x3, x4).toFixed(2) ||
            px2 > +mmax(x3, x4).toFixed(2) ||
            py2 < +mmin(y1, y2).toFixed(2) ||
            py2 > +mmax(y1, y2).toFixed(2) ||
            py2 < +mmin(y3, y4).toFixed(2) ||
            py2 > +mmax(y3, y4).toFixed(2)
        ) {
            return;
        }
        return {x: px, y: py};
    }
    function inter(bez1, bez2) {
        return interHelper(bez1, bez2);
    }
    function interCount(bez1, bez2) {
        return interHelper(bez1, bez2, 1);
    }
    function interHelper(bez1, bez2, justCount) {
        var bbox1 = R.bezierBBox(bez1),
            bbox2 = R.bezierBBox(bez2);
        if (!R.isBBoxIntersect(bbox1, bbox2)) {
            return justCount ? 0 : [];
        }
        var l1 = bezlen.apply(0, bez1),
            l2 = bezlen.apply(0, bez2),
            n1 = ~~(l1 / 5),
            n2 = ~~(l2 / 5),
            dots1 = [],
            dots2 = [],
            xy = {},
            res = justCount ? 0 : [];
        for (var i = 0; i < n1 + 1; i++) {
            var p = R.findDotsAtSegment.apply(R, bez1.concat(i / n1));
            dots1.push({x: p.x, y: p.y, t: i / n1});
        }
        for (i = 0; i < n2 + 1; i++) {
            p = R.findDotsAtSegment.apply(R, bez2.concat(i / n2));
            dots2.push({x: p.x, y: p.y, t: i / n2});
        }
        for (i = 0; i < n1; i++) {
            for (var j = 0; j < n2; j++) {
                var di = dots1[i],
                    di1 = dots1[i + 1],
                    dj = dots2[j],
                    dj1 = dots2[j + 1],
                    ci = abs(di1.x - di.x) < .001 ? "y" : "x",
                    cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
                    is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
                if (is) {
                    if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                        continue;
                    }
                    xy[is.x.toFixed(4)] = is.y.toFixed(4);
                    var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                        t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                        if (justCount) {
                            res++;
                        } else {
                            res.push({
                                x: is.x,
                                y: is.y,
                                t1: t1,
                                t2: t2
                            });
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.pathIntersection
     [ method ]
     **
     * Utility method
     **
     * Finds intersections of two paths
     > Parameters
     - path1 (string) path string
     - path2 (string) path string
     = (array) dots of intersection
     o [
     o     {
     o         x: (number) x coordinate of the point
     o         y: (number) y coordinate of the point
     o         t1: (number) t value for segment of path1
     o         t2: (number) t value for segment of path2
     o         segment1: (number) order number for segment of path1
     o         segment2: (number) order number for segment of path2
     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1
     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
     o     }
     o ]
    \*/
    R.pathIntersection = function (path1, path2) {
        return interPathHelper(path1, path2);
    };
    R.pathIntersectionNumber = function (path1, path2) {
        return interPathHelper(path1, path2, 1);
    };
    function interPathHelper(path1, path2, justCount) {
        path1 = R._path2curve(path1);
        path2 = R._path2curve(path2);
        var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
            res = justCount ? 0 : [];
        for (var i = 0, ii = path1.length; i < ii; i++) {
            var pi = path1[i];
            if (pi[0] == "M") {
                x1 = x1m = pi[1];
                y1 = y1m = pi[2];
            } else {
                if (pi[0] == "C") {
                    bez1 = [x1, y1].concat(pi.slice(1));
                    x1 = bez1[6];
                    y1 = bez1[7];
                } else {
                    bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                    x1 = x1m;
                    y1 = y1m;
                }
                for (var j = 0, jj = path2.length; j < jj; j++) {
                    var pj = path2[j];
                    if (pj[0] == "M") {
                        x2 = x2m = pj[1];
                        y2 = y2m = pj[2];
                    } else {
                        if (pj[0] == "C") {
                            bez2 = [x2, y2].concat(pj.slice(1));
                            x2 = bez2[6];
                            y2 = bez2[7];
                        } else {
                            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                            x2 = x2m;
                            y2 = y2m;
                        }
                        var intr = interHelper(bez1, bez2, justCount);
                        if (justCount) {
                            res += intr;
                        } else {
                            for (var k = 0, kk = intr.length; k < kk; k++) {
                                intr[k].segment1 = i;
                                intr[k].segment2 = j;
                                intr[k].bez1 = bez1;
                                intr[k].bez2 = bez2;
                            }
                            res = res.concat(intr);
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.isPointInsidePath
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside a given closed path.
     > Parameters
     - path (string) path string
     - x (number) x of the point
     - y (number) y of the point
     = (boolean) true, if point is inside the path
    \*/
    R.isPointInsidePath = function (path, x, y) {
        var bbox = R.pathBBox(path);
        return R.isPointInsideBBox(bbox, x, y) &&
               interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
    };
    R._removedFactory = function (methodname) {
        return function () {
            eve("raphael.log", null, "Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object", methodname);
        };
    };
    /*\
     * Raphael.pathBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given path
     > Parameters
     - path (string) path string
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box
     o     y: (number) y coordinate of the left top point of the box
     o     x2: (number) x coordinate of the right bottom point of the box
     o     y2: (number) y coordinate of the right bottom point of the box
     o     width: (number) width of the box
     o     height: (number) height of the box
     o     cx: (number) x coordinate of the center of the box
     o     cy: (number) y coordinate of the center of the box
     o }
    \*/
    var pathDimensions = R.pathBBox = function (path) {
        var pth = paths(path);
        if (pth.bbox) {
            return clone(pth.bbox);
        }
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0};
        }
        path = path2curve(path);
        var x = 0,
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X.push(x);
                Y.push(y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y),
            xmax = mmax[apply](0, X),
            ymax = mmax[apply](0, Y),
            width = xmax - xmin,
            height = ymax - ymin,
                bb = {
                x: xmin,
                y: ymin,
                x2: xmax,
                y2: ymax,
                width: width,
                height: height,
                cx: xmin + width / 2,
                cy: ymin + height / 2
            };
        pth.bbox = clone(bb);
        return bb;
    },
        pathClone = function (pathArray) {
            var res = clone(pathArray);
            res.toString = R._path2string;
            return res;
        },
        pathToRelative = R._pathToRelative = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.rel) {
                return pathClone(pth.rel);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res.push(["M", x, y]);
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i].length;
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res.toString = R._path2string;
            pth.rel = pathClone(res);
            return res;
        },
        pathToAbsolute = R._pathToAbsolute = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.abs) {
                return pathClone(pth.abs);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            if (!pathArray || !pathArray.length) {
                return [["M", 0, 0]];
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
            for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                res.push(r = []);
                pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "R":
                            var dots = [x, y][concat](pa.slice(1));
                            for (var j = 2, jj = dots.length; j < jj; j++) {
                                dots[j] = +dots[j] + x;
                                dots[++j] = +dots[j] + y;
                            }
                            res.pop();
                            res = res[concat](catmullRom2bezier(dots, crz));
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else if (pa[0] == "R") {
                    dots = [x, y][concat](pa.slice(1));
                    res.pop();
                    res = res[concat](catmullRom2bezier(dots, crz));
                    r = ["R"][concat](pa.slice(-2));
                } else {
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        r[k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = r[r.length - 2];
                        my = r[r.length - 1];
                    default:
                        x = r[r.length - 2];
                        y = r[r.length - 1];
                }
            }
            res.toString = R._path2string;
            pth.abs = pathClone(res);
            return res;
        },
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res).join()[split](",");
                var newres = [];
                for (var i = 0, ii = res.length; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = R._path2curve = cacher(function (path, path2) {
            var pth = !path2 && paths(path);
            if (!path2 && pth.curve) {
                return pathClone(pth.curve);
            }
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i].length > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi.length) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                };
            for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg.length,
                    seg2len = p2 && seg2.length;
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            if (!p2) {
                pth.curve = pathClone(p);
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = R._parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient.length; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots.push(dot);
            }
            for (i = 1, ii = dots.length - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        tear = R._tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = R._tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = R._toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = R._insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = R._insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        /*\
         * Raphael.toMatrix
         [ method ]
         **
         * Utility method
         **
         * Returns matrix of transformations applied to a given path
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (object) @Matrix
        \*/
        toMatrix = R.toMatrix = function (path, transform) {
            var bb = pathDimensions(path),
                el = {
                    _: {
                        transform: E
                    },
                    getBBox: function () {
                        return bb;
                    }
                };
            extractTransform(el, transform);
            return el.matrix;
        },
        /*\
         * Raphael.transformPath
         [ method ]
         **
         * Utility method
         **
         * Returns path transformed by a given transformation
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (string) path
        \*/
        transformPath = R.transformPath = function (path, transform) {
            return mapPath(path, toMatrix(path, transform));
        },
        extractTransform = R._extractTransform = function (el, tstr) {
            if (tstr == null) {
                return el._.transform;
            }
            tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
            var tdata = R.parseTransformString(tstr),
                deg = 0,
                dx = 0,
                dy = 0,
                sx = 1,
                sy = 1,
                _ = el._,
                m = new Matrix;
            _.transform = tdata || [];
            if (tdata) {
                for (var i = 0, ii = tdata.length; i < ii; i++) {
                    var t = tdata[i],
                        tlen = t.length,
                        command = Str(t[0]).toLowerCase(),
                        absolute = t[0] != command,
                        inver = absolute ? m.invert() : 0,
                        x1,
                        y1,
                        x2,
                        y2,
                        bb;
                    if (command == "t" && tlen == 3) {
                        if (absolute) {
                            x1 = inver.x(0, 0);
                            y1 = inver.y(0, 0);
                            x2 = inver.x(t[1], t[2]);
                            y2 = inver.y(t[1], t[2]);
                            m.translate(x2 - x1, y2 - y1);
                        } else {
                            m.translate(t[1], t[2]);
                        }
                    } else if (command == "r") {
                        if (tlen == 2) {
                            bb = bb || el.getBBox(1);
                            m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            deg += t[1];
                        } else if (tlen == 4) {
                            if (absolute) {
                                x2 = inver.x(t[2], t[3]);
                                y2 = inver.y(t[2], t[3]);
                                m.rotate(t[1], x2, y2);
                            } else {
                                m.rotate(t[1], t[2], t[3]);
                            }
                            deg += t[1];
                        }
                    } else if (command == "s") {
                        if (tlen == 2 || tlen == 3) {
                            bb = bb || el.getBBox(1);
                            m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            sx *= t[1];
                            sy *= t[tlen - 1];
                        } else if (tlen == 5) {
                            if (absolute) {
                                x2 = inver.x(t[3], t[4]);
                                y2 = inver.y(t[3], t[4]);
                                m.scale(t[1], t[2], x2, y2);
                            } else {
                                m.scale(t[1], t[2], t[3], t[4]);
                            }
                            sx *= t[1];
                            sy *= t[2];
                        }
                    } else if (command == "m" && tlen == 7) {
                        m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                    }
                    _.dirtyT = 1;
                    el.matrix = m;
                }
            }

            /*\
             * Element.matrix
             [ property (object) ]
             **
             * Keeps @Matrix object, which represents element transformation
            \*/
            el.matrix = m;

            _.sx = sx;
            _.sy = sy;
            _.deg = deg;
            _.dx = dx = m.e;
            _.dy = dy = m.f;

            if (sx == 1 && sy == 1 && !deg && _.bbox) {
                _.bbox.x += +dx;
                _.bbox.y += +dy;
            } else {
                _.dirtyT = 1;
            }
        },
        getEmpty = function (item) {
            var l = item[0];
            switch (l.toLowerCase()) {
                case "t": return [l, 0, 0];
                case "m": return [l, 1, 0, 0, 1, 0, 0];
                case "r": if (item.length == 4) {
                    return [l, 0, item[2], item[3]];
                } else {
                    return [l, 0];
                }
                case "s": if (item.length == 5) {
                    return [l, 1, 1, item[3], item[4]];
                } else if (item.length == 3) {
                    return [l, 1, 1];
                } else {
                    return [l, 1];
                }
            }
        },
        equaliseTransform = R._equaliseTransform = function (t1, t2) {
            t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
            t1 = R.parseTransformString(t1) || [];
            t2 = R.parseTransformString(t2) || [];
            var maxlength = mmax(t1.length, t2.length),
                from = [],
                to = [],
                i = 0, j, jj,
                tt1, tt2;
            for (; i < maxlength; i++) {
                tt1 = t1[i] || getEmpty(t2[i]);
                tt2 = t2[i] || getEmpty(tt1);
                if ((tt1[0] != tt2[0]) ||
                    (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
                    (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
                    ) {
                    return;
                }
                from[i] = [];
                to[i] = [];
                for (j = 0, jj = mmax(tt1.length, tt2.length); j < jj; j++) {
                    j in tt1 && (from[i][j] = tt1[j]);
                    j in tt2 && (to[i][j] = tt2[j]);
                }
            }
            return {
                from: from,
                to: to
            };
        };
    R._getContainer = function (x, y, w, h) {
        var container;
        container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
        if (container == null) {
            return;
        }
        if (container.tagName) {
            if (y == null) {
                return {
                    container: container,
                    width: container.style.pixelWidth || container.offsetWidth,
                    height: container.style.pixelHeight || container.offsetHeight
                };
            } else {
                return {
                    container: container,
                    width: y,
                    height: w
                };
            }
        }
        return {
            container: 1,
            x: x,
            y: y,
            width: w,
            height: h
        };
    };
    /*\
     * Raphael.pathToRelative
     [ method ]
     **
     * Utility method
     **
     * Converts path to relative form
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.pathToRelative = pathToRelative;
    R._engine = {};
    /*\
     * Raphael.path2curve
     [ method ]
     **
     * Utility method
     **
     * Converts path to a new path where all segments are cubic bezier curves.
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.path2curve = path2curve;
    /*\
     * Raphael.matrix
     [ method ]
     **
     * Utility method
     **
     * Returns matrix based on given parameters.
     > Parameters
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     = (object) @Matrix
    \*/
    R.matrix = function (a, b, c, d, e, f) {
        return new Matrix(a, b, c, d, e, f);
    };
    function Matrix(a, b, c, d, e, f) {
        if (a != null) {
            this.a = +a;
            this.b = +b;
            this.c = +c;
            this.d = +d;
            this.e = +e;
            this.f = +f;
        } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
        }
    }
    (function (matrixproto) {
        /*\
         * Matrix.add
         [ method ]
         **
         * Adds given matrix to existing one.
         > Parameters
         - a (number)
         - b (number)
         - c (number)
         - d (number)
         - e (number)
         - f (number)
         or
         - matrix (object) @Matrix
        \*/
        matrixproto.add = function (a, b, c, d, e, f) {
            var out = [[], [], []],
                m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
                x, y, z, res;

            if (a && a instanceof Matrix) {
                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    res = 0;
                    for (z = 0; z < 3; z++) {
                        res += m[x][z] * matrix[z][y];
                    }
                    out[x][y] = res;
                }
            }
            this.a = out[0][0];
            this.b = out[1][0];
            this.c = out[0][1];
            this.d = out[1][1];
            this.e = out[0][2];
            this.f = out[1][2];
        };
        /*\
         * Matrix.invert
         [ method ]
         **
         * Returns inverted version of the matrix
         = (object) @Matrix
        \*/
        matrixproto.invert = function () {
            var me = this,
                x = me.a * me.d - me.b * me.c;
            return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
        };
        /*\
         * Matrix.clone
         [ method ]
         **
         * Returns copy of the matrix
         = (object) @Matrix
        \*/
        matrixproto.clone = function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
        };
        /*\
         * Matrix.translate
         [ method ]
         **
         * Translate the matrix
         > Parameters
         - x (number)
         - y (number)
        \*/
        matrixproto.translate = function (x, y) {
            this.add(1, 0, 0, 1, x, y);
        };
        /*\
         * Matrix.scale
         [ method ]
         **
         * Scales the matrix
         > Parameters
         - x (number)
         - y (number) #optional
         - cx (number) #optional
         - cy (number) #optional
        \*/
        matrixproto.scale = function (x, y, cx, cy) {
            y == null && (y = x);
            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
            this.add(x, 0, 0, y, 0, 0);
            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        };
        /*\
         * Matrix.rotate
         [ method ]
         **
         * Rotates the matrix
         > Parameters
         - a (number)
         - x (number)
         - y (number)
        \*/
        matrixproto.rotate = function (a, x, y) {
            a = R.rad(a);
            x = x || 0;
            y = y || 0;
            var cos = +math.cos(a).toFixed(9),
                sin = +math.sin(a).toFixed(9);
            this.add(cos, sin, -sin, cos, x, y);
            this.add(1, 0, 0, 1, -x, -y);
        };
        /*\
         * Matrix.x
         [ method ]
         **
         * Return x coordinate for given point after transformation described by the matrix. See also @Matrix.y
         > Parameters
         - x (number)
         - y (number)
         = (number) x
        \*/
        matrixproto.x = function (x, y) {
            return x * this.a + y * this.c + this.e;
        };
        /*\
         * Matrix.y
         [ method ]
         **
         * Return y coordinate for given point after transformation described by the matrix. See also @Matrix.x
         > Parameters
         - x (number)
         - y (number)
         = (number) y
        \*/
        matrixproto.y = function (x, y) {
            return x * this.b + y * this.d + this.f;
        };
        matrixproto.get = function (i) {
            return +this[Str.fromCharCode(97 + i)].toFixed(4);
        };
        matrixproto.toString = function () {
            return R.svg ?
                "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
                [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
        };
        matrixproto.toFilter = function () {
            return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
                ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
                ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
        };
        matrixproto.offset = function () {
            return [this.e.toFixed(4), this.f.toFixed(4)];
        };
        function norm(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        function normalize(a) {
            var mag = math.sqrt(norm(a));
            a[0] && (a[0] /= mag);
            a[1] && (a[1] /= mag);
        }
        /*\
         * Matrix.split
         [ method ]
         **
         * Splits matrix into primitive transformations
         = (object) in format:
         o dx (number) translation by x
         o dy (number) translation by y
         o scalex (number) scale by x
         o scaley (number) scale by y
         o shear (number) shear
         o rotate (number) rotation in deg
         o isSimple (boolean) could it be represented via simple transformations
        \*/
        matrixproto.split = function () {
            var out = {};
            // translation
            out.dx = this.e;
            out.dy = this.f;

            // scale and shear
            var row = [[this.a, this.c], [this.b, this.d]];
            out.scalex = math.sqrt(norm(row[0]));
            normalize(row[0]);

            out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
            row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

            out.scaley = math.sqrt(norm(row[1]));
            normalize(row[1]);
            out.shear /= out.scaley;

            // rotation
            var sin = -row[0][1],
                cos = row[1][1];
            if (cos < 0) {
                out.rotate = R.deg(math.acos(cos));
                if (sin < 0) {
                    out.rotate = 360 - out.rotate;
                }
            } else {
                out.rotate = R.deg(math.asin(sin));
            }

            out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
            out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
            out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
            return out;
        };
        /*\
         * Matrix.toTransformString
         [ method ]
         **
         * Return transform string that represents given matrix
         = (string) transform string
        \*/
        matrixproto.toTransformString = function (shorter) {
            var s = shorter || this[split]();
            if (s.isSimple) {
                s.scalex = +s.scalex.toFixed(4);
                s.scaley = +s.scaley.toFixed(4);
                s.rotate = +s.rotate.toFixed(4);
                return  (s.dx || s.dy ? "t" + [s.dx, s.dy] : E) +
                        (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                        (s.rotate ? "r" + [s.rotate, 0, 0] : E);
            } else {
                return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
            }
        };
    })(Matrix.prototype);

    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") ||
        (navigator.vendor == "Google Inc." && version && version[1] < 8)) {
        /*\
         * Paper.safari
         [ method ]
         **
         * There is an inconvenient rendering bug in Safari (WebKit):
         * sometimes the rendering should be forced.
         * This method should help with dealing with this bug.
        \*/
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = fun;
    }

    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    addEvent = (function () {
        if (g.doc.addEventListener) {
            return function (obj, type, fn, element) {
                var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
                    f = function (e) {
                        var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                            x = e.clientX + scrollX,
                            y = e.clientY + scrollY;
                    if (supportsTouch && touchMap[has](type)) {
                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                var olde = e;
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }
                    }
                    return fn.call(element, e, x, y);
                };
                obj.addEventListener(realName, f, false);
                return function () {
                    obj.removeEventListener(realName, f, false);
                    return true;
                };
            };
        } else if (g.doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || g.win.event;
                    var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                        scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                        x = e.clientX + scrollX,
                        y = e.clientY + scrollY;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e, x, y);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            var node = dragi.el.node,
                o,
                next = node.nextSibling,
                parent = node.parentNode,
                display = node.style.display;
            g.win.opera && parent.removeChild(node);
            node.style.display = "none";
            o = dragi.el.paper.getElementByPoint(x, y);
            node.style.display = display;
            g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
            o && eve("raphael.drag.over." + dragi.el.id, dragi.el, o);
            x += scrollX;
            y += scrollY;
            eve("raphael.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            eve("raphael.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    },
    /*\
     * Raphael.el
     [ property (object) ]
     **
     * You can add your own method to elements. This is usefull when you want to hack default functionality or
     * want to wrap some common transformation or attributes in one method. In difference to canvas methods,
     * you can redefine element method at any time. Expending element methods wouldn’t affect set.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | // then use it
     | paper.circle(100, 100, 20).red();
    \*/
    elproto = R.el = {};
    /*\
     * Element.click
     [ method ]
     **
     * Adds event handler for click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unclick
     [ method ]
     **
     * Removes event handler for click for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.dblclick
     [ method ]
     **
     * Adds event handler for double click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.undblclick
     [ method ]
     **
     * Removes event handler for double click for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousedown
     [ method ]
     **
     * Adds event handler for mousedown for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousedown
     [ method ]
     **
     * Removes event handler for mousedown for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousemove
     [ method ]
     **
     * Adds event handler for mousemove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousemove
     [ method ]
     **
     * Removes event handler for mousemove for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseout
     [ method ]
     **
     * Adds event handler for mouseout for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseout
     [ method ]
     **
     * Removes event handler for mouseout for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseover
     [ method ]
     **
     * Adds event handler for mouseover for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseover
     [ method ]
     **
     * Removes event handler for mouseover for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseup
     [ method ]
     **
     * Adds event handler for mouseup for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseup
     [ method ]
     **
     * Removes event handler for mouseup for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchstart
     [ method ]
     **
     * Adds event handler for touchstart for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchstart
     [ method ]
     **
     * Removes event handler for touchstart for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchmove
     [ method ]
     **
     * Adds event handler for touchmove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchmove
     [ method ]
     **
     * Removes event handler for touchmove for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchend
     [ method ]
     **
     * Adds event handler for touchend for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchend
     [ method ]
     **
     * Removes event handler for touchend for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchcancel
     [ method ]
     **
     * Adds event handler for touchcancel for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchcancel
     [ method ]
     **
     * Removes event handler for touchcancel for the element.
     > Parameters
     - handler (function) #optional handler for the event
     = (object) @Element
    \*/
    for (var i = events.length; i--;) {
        (function (eventName) {
            R[eventName] = elproto[eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || g.doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = elproto["un" + eventName] = function (fn) {
                var events = this.events || [],
                    l = events.length;
                while (l--){
                    if (events[l].name == eventName && (R.is(fn, "undefined") || events[l].f == fn)) {
                        events[l].unbind();
                        events.splice(l, 1);
                        !events.length && delete this.events;
                    }
                }
                return this;
            };
        })(events[i]);
    }

    /*\
     * Element.data
     [ method ]
     **
     * Adds or retrieves given value asociated with given key.
     ** 
     * See also @Element.removeData
     > Parameters
     - key (string) key to store data
     - value (any) #optional value to store
     = (object) @Element
     * or, if value is not specified:
     = (any) value
     * or, if key and value are not specified:
     = (object) Key/value pairs for all the data associated with the element.
     > Usage
     | for (var i = 0, i < 5, i++) {
     |     paper.circle(10 + 15 * i, 10, 10)
     |          .attr({fill: "#000"})
     |          .data("i", i)
     |          .click(function () {
     |             alert(this.data("i"));
     |          });
     | }
    \*/
    elproto.data = function (key, value) {
        var data = eldata[this.id] = eldata[this.id] || {};
        if (arguments.length == 0) {
            return data;
        }
        if (arguments.length == 1) {
            if (R.is(key, "object")) {
                for (var i in key) if (key[has](i)) {
                    this.data(i, key[i]);
                }
                return this;
            }
            eve("raphael.data.get." + this.id, this, data[key], key);
            return data[key];
        }
        data[key] = value;
        eve("raphael.data.set." + this.id, this, value, key);
        return this;
    };
    /*\
     * Element.removeData
     [ method ]
     **
     * Removes value associated with an element by given key.
     * If key is not provided, removes all the data of the element.
     > Parameters
     - key (string) #optional key
     = (object) @Element
    \*/
    elproto.removeData = function (key) {
        if (key == null) {
            eldata[this.id] = {};
        } else {
            eldata[this.id] && delete eldata[this.id][key];
        }
        return this;
    };
     /*\
     * Element.getData
     [ method ]
     **
     * Retrieves the element data
     = (object) data
    \*/
    elproto.getData = function () {
        return clone(eldata[this.id] || {});
    };
    /*\
     * Element.hover
     [ method ]
     **
     * Adds event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     - icontext (object) #optional context for hover in handler
     - ocontext (object) #optional context for hover out handler
     = (object) @Element
    \*/
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    /*\
     * Element.unhover
     [ method ]
     **
     * Removes event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     = (object) @Element
    \*/
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    var draggable = [];
    /*\
     * Element.drag
     [ method ]
     **
     * Adds event handlers for drag of the element.
     > Parameters
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events will be triggered: `drag.start.<id>` on start, 
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element will be dragged over another element 
     * `drag.over.<id>` will be fired as well.
     *
     * Start event and start handler will be called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler will be called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler will be called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
    \*/
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        function start(e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
            onstart && eve.on("raphael.drag.start." + this.id, onstart);
            onmove && eve.on("raphael.drag.move." + this.id, onmove);
            onend && eve.on("raphael.drag.end." + this.id, onend);
            eve("raphael.drag.start." + this.id, start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
        }
        this._drag = {};
        draggable.push({el: this, start: start});
        this.mousedown(start);
        return this;
    };
    /*\
     * Element.onDragOver
     [ method ]
     **
     * Shortcut for assigning event handler for `drag.over.<id>` event, where id is id of the element (see @Element.id).
     > Parameters
     - f (function) handler for event, first argument would be the element you are dragging over
    \*/
    elproto.onDragOver = function (f) {
        f ? eve.on("raphael.drag.over." + this.id, f) : eve.unbind("raphael.drag.over." + this.id);
    };
    /*\
     * Element.undrag
     [ method ]
     **
     * Removes all drag event handlers from given element.
    \*/
    elproto.undrag = function () {
        var i = draggable.length;
        while (i--) if (draggable[i].el == this) {
            this.unmousedown(draggable[i].start);
            draggable.splice(i, 1);
            eve.unbind("raphael.drag.*." + this.id);
        }
        !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
        drag = [];
    };
    /*\
     * Paper.circle
     [ method ]
     **
     * Draws a circle.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - r (number) radius
     = (object) Raphaël element object with type “circle”
     **
     > Usage
     | var c = paper.circle(50, 50, 40);
    \*/
    paperproto.circle = function (x, y, r) {
        var out = R._engine.circle(this, x || 0, y || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.rect
     [ method ]
     *
     * Draws a rectangle.
     **
     > Parameters
     **
     - x (number) x coordinate of the top left corner
     - y (number) y coordinate of the top left corner
     - width (number) width
     - height (number) height
     - r (number) #optional radius for rounded corners, default is 0
     = (object) Raphaël element object with type “rect”
     **
     > Usage
     | // regular rectangle
     | var c = paper.rect(10, 10, 50, 50);
     | // rectangle with rounded corners
     | var c = paper.rect(40, 40, 50, 50, 10);
    \*/
    paperproto.rect = function (x, y, w, h, r) {
        var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.ellipse
     [ method ]
     **
     * Draws an ellipse.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - rx (number) horizontal radius
     - ry (number) vertical radius
     = (object) Raphaël element object with type “ellipse”
     **
     > Usage
     | var c = paper.ellipse(50, 50, 40, 20);
    \*/
    paperproto.ellipse = function (x, y, rx, ry) {
        var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.path
     [ method ]
     **
     * Creates a path element by given path data string.
     > Parameters
     - pathString (string) #optional path string in SVG format.
     * Path string consists of one-letter commands, followed by comma seprarated arguments in numercal form. Example:
     | "M10,20L30,40"
     * Here we can see two commands: “M”, with arguments `(10, 20)` and “L” with arguments `(30, 40)`. Upper case letter mean command is absolute, lower case—relative.
     *
     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a>.</p>
     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
     * * “Catmull-Rom curveto” is a not standard SVG command and added in 2.0 to make life easier.
     * Note: there is a special case when path consist of just three commands: “M10,10R…z”. In this case path will smoothly connects to its beginning.
     > Usage
     | var c = paper.path("M10 10L90 90");
     | // draw a diagonal line:
     | // move to 10,10, line to 90,90
     * For example of path strings, check out these icons: http://raphaeljs.com/icons/
    \*/
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        var out = R._engine.path(R.format[apply](R, arguments), this);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.image
     [ method ]
     **
     * Embeds an image into the surface.
     **
     > Parameters
     **
     - src (string) URI of the source image
     - x (number) x coordinate position
     - y (number) y coordinate position
     - width (number) width of the image
     - height (number) height of the image
     = (object) Raphaël element object with type “image”
     **
     > Usage
     | var c = paper.image("apple.png", 10, 10, 80, 80);
    \*/
    paperproto.image = function (src, x, y, w, h) {
        var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.text
     [ method ]
     **
     * Draws a text string. If you need line breaks, put “\n” in the string.
     **
     > Parameters
     **
     - x (number) x coordinate position
     - y (number) y coordinate position
     - text (string) The text string to draw
     = (object) Raphaël element object with type “text”
     **
     > Usage
     | var t = paper.text(50, 50, "Raphaël\nkicks\nbutt!");
    \*/
    paperproto.text = function (x, y, text) {
        var out = R._engine.text(this, x || 0, y || 0, Str(text));
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.set
     [ method ]
     **
     * Creates array-like object to keep and operate several elements at once.
     * Warning: it doesn’t create any elements for itself in the page, it just groups existing elements.
     * Sets act as pseudo elements — all methods available to an element can be used on a set.
     = (object) array-like object that represents set of elements
     **
     > Usage
     | var st = paper.set();
     | st.push(
     |     paper.circle(10, 10, 5),
     |     paper.circle(30, 10, 5)
     | );
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.set = function (itemsArray) {
        !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
        var out = new Set(itemsArray);
        this.__set__ && this.__set__.push(out);
        out["paper"] = this;
        out["type"] = "set";
        return out;
    };
    /*\
     * Paper.setStart
     [ method ]
     **
     * Creates @Paper.set. All elements that will be created after calling this method and before calling
     * @Paper.setFinish will be added to the set.
     **
     > Usage
     | paper.setStart();
     | paper.circle(10, 10, 5),
     | paper.circle(30, 10, 5)
     | var st = paper.setFinish();
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.setStart = function (set) {
        this.__set__ = set || this.set();
    };
    /*\
     * Paper.setFinish
     [ method ]
     **
     * See @Paper.setStart. This method finishes catching and returns resulting set.
     **
     = (object) set
    \*/
    paperproto.setFinish = function (set) {
        var out = this.__set__;
        delete this.__set__;
        return out;
    };
    /*\
     * Paper.setSize
     [ method ]
     **
     * If you need to change dimensions of the canvas call this method
     **
     > Parameters
     **
     - width (number) new width of the canvas
     - height (number) new height of the canvas
    \*/
    paperproto.setSize = function (width, height) {
        return R._engine.setSize.call(this, width, height);
    };
    /*\
     * Paper.setViewBox
     [ method ]
     **
     * Sets the view box of the paper. Practically it gives you ability to zoom and pan whole paper surface by 
     * specifying new boundaries.
     **
     > Parameters
     **
     - x (number) new x position, default is `0`
     - y (number) new y position, default is `0`
     - w (number) new width of the canvas
     - h (number) new height of the canvas
     - fit (boolean) `true` if you want graphics to fit into new boundary box
    \*/
    paperproto.setViewBox = function (x, y, w, h, fit) {
        return R._engine.setViewBox.call(this, x, y, w, h, fit);
    };
    /*\
     * Paper.top
     [ property ]
     **
     * Points to the topmost element on the paper
    \*/
    /*\
     * Paper.bottom
     [ property ]
     **
     * Points to the bottom element on the paper
    \*/
    paperproto.top = paperproto.bottom = null;
    /*\
     * Paper.raphael
     [ property ]
     **
     * Points to the @Raphael object/function
    \*/
    paperproto.raphael = R;
    var getOffset = function (elem) {
        var box = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement,
            clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
            left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
        return {
            y: top,
            x: left
        };
    };
    /*\
     * Paper.getElementByPoint
     [ method ]
     **
     * Returns you topmost element under given point.
     **
     = (object) Raphaël element object
     > Parameters
     **
     - x (number) x coordinate from the top left corner of the window
     - y (number) y coordinate from the top left corner of the window
     > Usage
     | paper.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
    \*/
    paperproto.getElementByPoint = function (x, y) {
        var paper = this,
            svg = paper.canvas,
            target = g.doc.elementFromPoint(x, y);
        if (g.win.opera && target.tagName == "svg") {
            var so = getOffset(svg),
                sr = svg.createSVGRect();
            sr.x = x - so.x;
            sr.y = y - so.y;
            sr.width = sr.height = 1;
            var hits = svg.getIntersectionList(sr, null);
            if (hits.length) {
                target = hits[hits.length - 1];
            }
        }
        if (!target) {
            return null;
        }
        while (target.parentNode && target != svg.parentNode && !target.raphael) {
            target = target.parentNode;
        }
        target == paper.canvas.parentNode && (target = svg);
        target = target && target.raphael ? paper.getById(target.raphaelid) : null;
        return target;
    };

    /*\
     * Paper.getElementsByBBox
     [ method ]
     **
     * Returns set of elements that have an intersecting bounding box
     **
     > Parameters
     **
     - bbox (object) bbox to check with
     = (object) @Set
     \*/
    paperproto.getElementsByBBox = function (bbox) {
        var set = this.set();
        this.forEach(function (el) {
            if (R.isBBoxIntersect(el.getBBox(), bbox)) {
                set.push(el);
            }
        });
        return set;
    };

    /*\
     * Paper.getById
     [ method ]
     **
     * Returns you element by its internal ID.
     **
     > Parameters
     **
     - id (number) id
     = (object) Raphaël element object
    \*/
    paperproto.getById = function (id) {
        var bot = this.bottom;
        while (bot) {
            if (bot.id == id) {
                return bot;
            }
            bot = bot.next;
        }
        return null;
    };
    /*\
     * Paper.forEach
     [ method ]
     **
     * Executes given function for each element on the paper
     *
     * If callback function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Paper object
     > Usage
     | paper.forEach(function (el) {
     |     el.attr({ stroke: "blue" });
     | });
    \*/
    paperproto.forEach = function (callback, thisArg) {
        var bot = this.bottom;
        while (bot) {
            if (callback.call(thisArg, bot) === false) {
                return this;
            }
            bot = bot.next;
        }
        return this;
    };
    /*\
     * Paper.getElementsByPoint
     [ method ]
     **
     * Returns set of elements that have common point inside
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (object) @Set
    \*/
    paperproto.getElementsByPoint = function (x, y) {
        var set = this.set();
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                set.push(el);
            }
        });
        return set;
    };
    function x_y() {
        return this.x + S + this.y;
    }
    function x_y_w_h() {
        return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }
    /*\
     * Element.isPointInside
     [ method ]
     **
     * Determine if given point is inside this element’s shape
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point inside the shape
    \*/
    elproto.isPointInside = function (x, y) {
        var rp = this.realPath = this.realPath || getPath[this.type](this);
        return R.isPointInsidePath(rp, x, y);
    };
    /*\
     * Element.getBBox
     [ method ]
     **
     * Return bounding box for a given element
     **
     > Parameters
     **
     - isWithoutTransform (boolean) flag, `true` if you want to have bounding box before transformations. Default is `false`.
     = (object) Bounding box object:
     o {
     o     x: (number) top left corner x
     o     y: (number) top left corner y
     o     x2: (number) bottom right corner x
     o     y2: (number) bottom right corner y
     o     width: (number) width
     o     height: (number) height
     o }
    \*/
    elproto.getBBox = function (isWithoutTransform) {
        if (this.removed) {
            return {};
        }
        var _ = this._;
        if (isWithoutTransform) {
            if (_.dirty || !_.bboxwt) {
                this.realPath = getPath[this.type](this);
                _.bboxwt = pathDimensions(this.realPath);
                _.bboxwt.toString = x_y_w_h;
                _.dirty = 0;
            }
            return _.bboxwt;
        }
        if (_.dirty || _.dirtyT || !_.bbox) {
            if (_.dirty || !this.realPath) {
                _.bboxwt = 0;
                this.realPath = getPath[this.type](this);
            }
            _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
            _.bbox.toString = x_y_w_h;
            _.dirty = _.dirtyT = 0;
        }
        return _.bbox;
    };
    /*\
     * Element.clone
     [ method ]
     **
     = (object) clone of a given element
     **
    \*/
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var out = this.paper[this.type]().attr(this.attr());
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Element.glow
     [ method ]
     **
     * Return set of elements that create glow-like effect around given element. See @Paper.set.
     *
     * Note: Glow is not connected to the element. If you change element attributes it won’t adjust itself.
     **
     > Parameters
     **
     - glow (object) #optional parameters object with all properties optional:
     o {
     o     width (number) size of the glow, default is `10`
     o     fill (boolean) will it be filled, default is `false`
     o     opacity (number) opacity, default is `0.5`
     o     offsetx (number) horizontal offset, default is `0`
     o     offsety (number) vertical offset, default is `0`
     o     color (string) glow colour, default is `black`
     o }
     = (object) @Paper.set of elements that represents glow
    \*/
    elproto.glow = function (glow) {
        if (this.type == "text") {
            return null;
        }
        glow = glow || {};
        var s = {
            width: (glow.width || 10) + (+this.attr("stroke-width") || 1),
            fill: glow.fill || false,
            opacity: glow.opacity || .5,
            offsetx: glow.offsetx || 0,
            offsety: glow.offsety || 0,
            color: glow.color || "#000"
        },
            c = s.width / 2,
            r = this.paper,
            out = r.set(),
            path = this.realPath || getPath[this.type](this);
        path = this.matrix ? mapPath(path, this.matrix) : path;
        for (var i = 1; i < c + 1; i++) {
            out.push(r.path(path).attr({
                stroke: s.color,
                fill: s.fill ? s.color : "none",
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-width": +(s.width / c * i).toFixed(3),
                opacity: +(s.opacity / c).toFixed(3)
            }));
        }
        return out.insertBefore(this).translate(s.offsetx, s.offsety);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        if (length == null) {
            return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
        } else {
            return R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p.shift() + p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    /*\
     * Raphael.getTotalLength
     [ method ]
     **
     * Returns length of the given path in pixels.
     **
     > Parameters
     **
     - path (string) SVG path string.
     **
     = (number) length.
    \*/
    R.getTotalLength = getTotalLength;
    /*\
     * Raphael.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path.
     **
     > Parameters
     **
     - path (string) SVG path string
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    R.getPointAtLength = getPointAtLength;
    /*\
     * Raphael.getSubpath
     [ method ]
     **
     * Return subpath of a given path from given length to given length.
     **
     > Parameters
     **
     - path (string) SVG path string
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    R.getSubpath = function (path, from, to) {
        if (this.getTotalLength(path) - to < 1e-6) {
            return getSubpathsAtLength(path, from).end;
        }
        var a = getSubpathsAtLength(path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };
    /*\
     * Element.getTotalLength
     [ method ]
     **
     * Returns length of the path in pixels. Only works for element of “path” type.
     = (number) length.
    \*/
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    /*\
     * Element.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path. Only works for element of “path” type.
     **
     > Parameters
     **
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    /*\
     * Element.getSubpath
     [ method ]
     **
     * Return subpath of a given element from given length to given length. Only works for element of “path” type.
     **
     > Parameters
     **
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        return R.getSubpath(this.attrs.path, from, to);
    };
    /*\
     * Raphael.easing_formulas
     [ property ]
     **
     * Object that contains easing formulas for animation. You could extend it with your own. By default it has following list of easing:
     # <ul>
     #     <li>“linear”</li>
     #     <li>“&lt;” or “easeIn” or “ease-in”</li>
     #     <li>“>” or “easeOut” or “ease-out”</li>
     #     <li>“&lt;>” or “easeInOut” or “ease-in-out”</li>
     #     <li>“backIn” or “back-in”</li>
     #     <li>“backOut” or “back-out”</li>
     #     <li>“elastic”</li>
     #     <li>“bounce”</li>
     # </ul>
     # <p>See also <a href="http://raphaeljs.com/easing.html">Easing demo</a>.</p>
    \*/
    var ef = R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 1.7);
        },
        ">": function (n) {
            return pow(n, .48);
        },
        "<>": function (n) {
            var q = .48 - n / 1.04,
                Q = math.sqrt(.1734 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + .5;
            return (1 - t) * 3 * t * t + t * t * t;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == !!n) {
                return n;
            }
            return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };
    ef.easeIn = ef["ease-in"] = ef["<"];
    ef.easeOut = ef["ease-out"] = ef[">"];
    ef.easeInOut = ef["ease-in-out"] = ef["<>"];
    ef["back-in"] = ef.backIn;
    ef["back-out"] = ef.backOut;

    var animationElements = [],
        requestAnimFrame = window.requestAnimationFrame       ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame    ||
                           window.oRequestAnimationFrame      ||
                           window.msRequestAnimationFrame     ||
                           function (callback) {
                               setTimeout(callback, 16);
                           },
        animation = function () {
            var Now = +new Date,
                l = 0;
            for (; l < animationElements.length; l++) {
                var e = animationElements[l];
                if (e.el.removed || e.paused) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now,
                    init = {},
                    key;
                if (e.initstatus) {
                    time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
                    e.status = e.initstatus;
                    delete e.initstatus;
                    e.stop && animationElements.splice(l--, 1);
                } else {
                    e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
                }
                if (time < 0) {
                    continue;
                }
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ].join(",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i].join(S);
                                }
                                now = now.join(S);
                                break;
                            case "transform":
                                if (diff[attr].real) {
                                    now = [];
                                    for (i = 0, ii = from[attr].length; i < ii; i++) {
                                        now[i] = [from[attr][i][0]];
                                        for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                            now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                                        }
                                    }
                                } else {
                                    var get = function (i) {
                                        return +from[attr][i] + pos * ms * diff[attr][i];
                                    };
                                    // now = [["r", get(2), 0, 0], ["t", get(3), get(4)], ["s", get(0), get(1), 0, 0]];
                                    now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                                }
                                break;
                            case "csv":
                                if (attr == "clip-rect") {
                                    now = [];
                                    i = 4;
                                    while (i--) {
                                        now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                    }
                                }
                                break;
                            default:
                                var from2 = [][concat](from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    (function (id, that, anim) {
                        setTimeout(function () {
                            eve("raphael.anim.frame." + id, that, anim);
                        });
                    })(that.id, that, e.anim);
                } else {
                    (function(f, el, a) {
                        setTimeout(function() {
                            eve("raphael.anim.frame." + el.id, el, a);
                            eve("raphael.anim.finish." + el.id, el, a);
                            R.is(f, "function") && f.call(el);
                        });
                    })(e.callback, that, e.anim);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                    if (e.repeat > 1 && !e.next) {
                        for (key in to) if (to[has](key)) {
                            init[key] = e.totalOrigin[key];
                        }
                        e.el.attr(init);
                        runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
                    }
                    if (e.next && !e.stop) {
                        runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
                    }
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements.length && requestAnimFrame(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : color < 0 ? 0 : color;
        };
    /*\
     * Element.animateWith
     [ method ]
     **
     * Acts similar to @Element.animate, but ensure that given animation runs in sync with another given element.
     **
     > Parameters
     **
     - el (object) element to sync with
     - anim (object) animation to sync with
     - params (object) #optional final attributes for the element, see also @Element.attr
     - ms (number) #optional number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept on of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - element (object) element to sync with
     - anim (object) animation to sync with
     - animation (object) #optional animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animateWith = function (el, anim, params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var a = params instanceof Animation ? params : R.animation(params, ms, easing, callback),
            x, y;
        runAnimation(a, element, a.percents[0], null, element.attr());
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].anim == anim && animationElements[i].el == el) {
                animationElements[ii - 1].start = animationElements[i].start;
                break;
            }
        }
        return element;
        // 
        // 
        // var a = params ? R.animation(params, ms, easing, callback) : anim,
        //     status = element.status(anim);
        // return this.animate(a).status(a, status * anim.ms / a.ms);
    };
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        f ? eve.on("raphael.anim.frame." + this.id, f) : eve.unbind("raphael.anim.frame." + this.id);
        return this;
    };
    function Animation(anim, ms) {
        var percents = [],
            newAnim = {};
        this.ms = ms;
        this.times = 1;
        if (anim) {
            for (var attr in anim) if (anim[has](attr)) {
                newAnim[toFloat(attr)] = anim[attr];
                percents.push(toFloat(attr));
            }
            percents.sort(sortByNumber);
        }
        this.anim = newAnim;
        this.top = percents[percents.length - 1];
        this.percents = percents;
    }
    /*\
     * Animation.delay
     [ method ]
     **
     * Creates a copy of existing animation object with given delay.
     **
     > Parameters
     **
     - delay (number) number of ms to pass between animation start and actual animation
     **
     = (object) new altered Animation object
     | var anim = Raphael.animation({cx: 10, cy: 20}, 2e3);
     | circle1.animate(anim); // run the given animation immediately
     | circle2.animate(anim.delay(500)); // run the given animation after 500 ms
    \*/
    Animation.prototype.delay = function (delay) {
        var a = new Animation(this.anim, this.ms);
        a.times = this.times;
        a.del = +delay || 0;
        return a;
    };
    /*\
     * Animation.repeat
     [ method ]
     **
     * Creates a copy of existing animation object with given repetition.
     **
     > Parameters
     **
     - repeat (number) number iterations of animation. For infinite animation pass `Infinity`
     **
     = (object) new altered Animation object
    \*/
    Animation.prototype.repeat = function (times) {
        var a = new Animation(this.anim, this.ms);
        a.del = this.del;
        a.times = math.floor(mmax(times, 0)) || 1;
        return a;
    };
    function runAnimation(anim, element, percent, status, totalOrigin, times) {
        percent = toFloat(percent);
        var params,
            isInAnim,
            isInAnimSet,
            percents = [],
            next,
            prev,
            timestamp,
            ms = anim.ms,
            from = {},
            to = {},
            diff = {};
        if (status) {
            for (i = 0, ii = animationElements.length; i < ii; i++) {
                var e = animationElements[i];
                if (e.el.id == element.id && e.anim == anim) {
                    if (e.percent != percent) {
                        animationElements.splice(i, 1);
                        isInAnimSet = 1;
                    } else {
                        isInAnim = e;
                    }
                    element.attr(e.totalOrigin);
                    break;
                }
            }
        } else {
            status = +to; // NaN
        }
        for (var i = 0, ii = anim.percents.length; i < ii; i++) {
            if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
                percent = anim.percents[i];
                prev = anim.percents[i - 1] || 0;
                ms = ms / anim.top * (percent - prev);
                next = anim.percents[i + 1];
                params = anim.anim[percent];
                break;
            } else if (status) {
                element.attr(anim.anim[anim.percents[i]]);
            }
        }
        if (!params) {
            return;
        }
        if (!isInAnim) {
            for (var attr in params) if (params[has](attr)) {
                if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                    from[attr] = element.attr(attr);
                    (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                    to[attr] = params[attr];
                    switch (availableAnimAttrs[attr]) {
                        case nu:
                            diff[attr] = (to[attr] - from[attr]) / ms;
                            break;
                        case "colour":
                            from[attr] = R.getRGB(from[attr]);
                            var toColour = R.getRGB(to[attr]);
                            diff[attr] = {
                                r: (toColour.r - from[attr].r) / ms,
                                g: (toColour.g - from[attr].g) / ms,
                                b: (toColour.b - from[attr].b) / ms
                            };
                            break;
                        case "path":
                            var pathes = path2curve(from[attr], to[attr]),
                                toPath = pathes[1];
                            from[attr] = pathes[0];
                            diff[attr] = [];
                            for (i = 0, ii = from[attr].length; i < ii; i++) {
                                diff[attr][i] = [0];
                                for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                    diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                                }
                            }
                            break;
                        case "transform":
                            var _ = element._,
                                eq = equaliseTransform(_[attr], to[attr]);
                            if (eq) {
                                from[attr] = eq.from;
                                to[attr] = eq.to;
                                diff[attr] = [];
                                diff[attr].real = true;
                                for (i = 0, ii = from[attr].length; i < ii; i++) {
                                    diff[attr][i] = [from[attr][i][0]];
                                    for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                                    }
                                }
                            } else {
                                var m = (element.matrix || new Matrix),
                                    to2 = {
                                        _: {transform: _.transform},
                                        getBBox: function () {
                                            return element.getBBox(1);
                                        }
                                    };
                                from[attr] = [
                                    m.a,
                                    m.b,
                                    m.c,
                                    m.d,
                                    m.e,
                                    m.f
                                ];
                                extractTransform(to2, to[attr]);
                                to[attr] = to2._.transform;
                                diff[attr] = [
                                    (to2.matrix.a - m.a) / ms,
                                    (to2.matrix.b - m.b) / ms,
                                    (to2.matrix.c - m.c) / ms,
                                    (to2.matrix.d - m.d) / ms,
                                    (to2.matrix.e - m.e) / ms,
                                    (to2.matrix.f - m.f) / ms
                                ];
                                // from[attr] = [_.sx, _.sy, _.deg, _.dx, _.dy];
                                // var to2 = {_:{}, getBBox: function () { return element.getBBox(); }};
                                // extractTransform(to2, to[attr]);
                                // diff[attr] = [
                                //     (to2._.sx - _.sx) / ms,
                                //     (to2._.sy - _.sy) / ms,
                                //     (to2._.deg - _.deg) / ms,
                                //     (to2._.dx - _.dx) / ms,
                                //     (to2._.dy - _.dy) / ms
                                // ];
                            }
                            break;
                        case "csv":
                            var values = Str(params[attr])[split](separator),
                                from2 = Str(from[attr])[split](separator);
                            if (attr == "clip-rect") {
                                from[attr] = from2;
                                diff[attr] = [];
                                i = from2.length;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            }
                            to[attr] = values;
                            break;
                        default:
                            values = [][concat](params[attr]);
                            from2 = [][concat](from[attr]);
                            diff[attr] = [];
                            i = element.paper.customAttributes[attr].length;
                            while (i--) {
                                diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                            }
                            break;
                    }
                }
            }
            var easing = params.easing,
                easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy.length == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = pipe;
                }
            }
            timestamp = params.start || anim.start || +new Date;
            e = {
                anim: anim,
                percent: percent,
                timestamp: timestamp,
                start: timestamp + (anim.del || 0),
                status: 0,
                initstatus: status || 0,
                stop: false,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                callback: params.callback,
                prev: prev,
                next: next,
                repeat: times || anim.times,
                origin: element.attr(),
                totalOrigin: totalOrigin
            };
            animationElements.push(e);
            if (status && !isInAnim && !isInAnimSet) {
                e.stop = true;
                e.start = new Date - ms * status;
                if (animationElements.length == 1) {
                    return animation();
                }
            }
            if (isInAnimSet) {
                e.start = new Date - e.ms * status;
            }
            animationElements.length == 1 && requestAnimFrame(animation);
        } else {
            isInAnim.initstatus = status;
            isInAnim.start = new Date - isInAnim.ms * status;
        }
        eve("raphael.anim.start." + element.id, element, anim);
    }
    /*\
     * Raphael.animation
     [ method ]
     **
     * Creates an animation object that can be passed to the @Element.animate or @Element.animateWith methods.
     * See also @Animation.delay and @Animation.repeat methods.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     **
     = (object) @Animation
    \*/
    R.animation = function (params, ms, easing, callback) {
        if (params instanceof Animation) {
            return params;
        }
        if (R.is(easing, "function") || !easing) {
            callback = callback || easing || null;
            easing = null;
        }
        params = Object(params);
        ms = +ms || 0;
        var p = {},
            json,
            attr;
        for (attr in params) if (params[has](attr) && toFloat(attr) != attr && toFloat(attr) + "%" != attr) {
            json = true;
            p[attr] = params[attr];
        }
        if (!json) {
            return new Animation(params, ms);
        } else {
            easing && (p.easing = easing);
            callback && (p.callback = callback);
            return new Animation({100: p}, ms);
        }
    };
    /*\
     * Element.animate
     [ method ]
     **
     * Creates and starts animation for given element.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - animation (object) animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
        runAnimation(anim, element, anim.percents[0], null, element.attr());
        return element;
    };
    /*\
     * Element.setTime
     [ method ]
     **
     * Sets the status of animation of the element in milliseconds. Similar to @Element.status method.
     **
     > Parameters
     **
     - anim (object) animation object
     - value (number) number of milliseconds from the beginning of the animation
     **
     = (object) original element if `value` is specified
     * Note, that during animation following events are triggered:
     *
     * On each animation frame event `anim.frame.<id>`, on start `anim.start.<id>` and on end `anim.finish.<id>`.
    \*/
    elproto.setTime = function (anim, value) {
        if (anim && value != null) {
            this.status(anim, mmin(value, anim.ms) / anim.ms);
        }
        return this;
    };
    /*\
     * Element.status
     [ method ]
     **
     * Gets or sets the status of animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     - value (number) #optional 0 – 1. If specified, method works like a setter and sets the status of a given animation to the value. This will cause animation to jump to the given position.
     **
     = (number) status
     * or
     = (array) status if `anim` is not specified. Array of objects in format:
     o {
     o     anim: (object) animation object
     o     status: (number) status
     o }
     * or
     = (object) original element if `value` is specified
    \*/
    elproto.status = function (anim, value) {
        var out = [],
            i = 0,
            len,
            e;
        if (value != null) {
            runAnimation(anim, this, -1, mmin(value, 1));
            return this;
        } else {
            len = animationElements.length;
            for (; i < len; i++) {
                e = animationElements[i];
                if (e.el.id == this.id && (!anim || e.anim == anim)) {
                    if (anim) {
                        return e.status;
                    }
                    out.push({
                        anim: e.anim,
                        status: e.status
                    });
                }
            }
            if (anim) {
                return 0;
            }
            return out;
        }
    };
    /*\
     * Element.pause
     [ method ]
     **
     * Stops animation of the element with ability to resume it later on.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.pause = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.pause." + this.id, this, animationElements[i].anim) !== false) {
                animationElements[i].paused = true;
            }
        }
        return this;
    };
    /*\
     * Element.resume
     [ method ]
     **
     * Resumes animation if it was paused with @Element.pause method.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.resume = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            var e = animationElements[i];
            if (eve("raphael.anim.resume." + this.id, this, e.anim) !== false) {
                delete e.paused;
                this.status(e.anim, e.status);
            }
        }
        return this;
    };
    /*\
     * Element.stop
     [ method ]
     **
     * Stops animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.stop = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.stop." + this.id, this, animationElements[i].anim) !== false) {
                animationElements.splice(i--, 1);
            }
        }
        return this;
    };
    function stopAnimation(paper) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.paper == paper) {
            animationElements.splice(i--, 1);
        }
    }
    eve.on("raphael.remove", stopAnimation);
    eve.on("raphael.clear", stopAnimation);
    elproto.toString = function () {
        return "Rapha\xebl\u2019s object";
    };

    // Set
    var Set = function (items) {
        this.items = [];
        this.length = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items.length; i < ii; i++) {
                if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
                    this[this.items.length] = this.items[this.items.length] = items[i];
                    this.length++;
                }
            }
        }
    },
    setproto = Set.prototype;
    /*\
     * Set.push
     [ method ]
     **
     * Adds each argument to the current set.
     = (object) original element
    \*/
    setproto.push = function () {
        var item,
            len;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
                len = this.items.length;
                this[len] = this.items[len] = item;
                this.length++;
            }
        }
        return this;
    };
    /*\
     * Set.pop
     [ method ]
     **
     * Removes last element and returns it.
     = (object) element
    \*/
    setproto.pop = function () {
        this.length && delete this[this.length--];
        return this.items.pop();
    };
    /*\
     * Set.forEach
     [ method ]
     **
     * Executes given function for each element in the set.
     *
     * If function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Set object
    \*/
    setproto.forEach = function (callback, thisArg) {
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            if (callback.call(thisArg, this.items[i], i) === false) {
                return this;
            }
        }
        return this;
    };
    for (var method in elproto) if (elproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname][apply](el, arg);
                });
            };
        })(method);
    }
    setproto.attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name.length; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items.length; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    /*\
     * Set.clear
     [ method ]
     **
     * Removeds all elements from the set
    \*/
    setproto.clear = function () {
        while (this.length) {
            this.pop();
        }
    };
    /*\
     * Set.splice
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - index (number) position of the deletion
     - count (number) number of element to remove
     - insertion… (object) #optional elements to insert
     = (object) set elements that were deleted
    \*/
    setproto.splice = function (index, count, insertion) {
        index = index < 0 ? mmax(this.length + index, 0) : index;
        count = mmax(0, mmin(this.length - index, count));
        var tail = [],
            todel = [],
            args = [],
            i;
        for (i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (i = 0; i < count; i++) {
            todel.push(this[index + i]);
        }
        for (; i < this.length - index; i++) {
            tail.push(this[index + i]);
        }
        var arglen = args.length;
        for (i = 0; i < arglen + tail.length; i++) {
            this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
        }
        i = this.items.length = this.length -= count - arglen;
        while (this[i]) {
            delete this[i++];
        }
        return new Set(todel);
    };
    /*\
     * Set.exclude
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - element (object) element to remove
     = (boolean) `true` if object was found & removed from the set
    \*/
    setproto.exclude = function (el) {
        for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
            this.splice(i, 1);
            return true;
        }
    };
    setproto.animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items.length,
            i = len,
            item,
            set = this,
            collector;
        if (!len) {
            return this;
        }
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        var anim = R.animation(params, ms, easing, collector);
        item = this.items[--i].animate(anim);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, anim, anim);
            (this.items[i] && !this.items[i].removed) || len--;
        }
        return this;
    };
    setproto.insertAfter = function (el) {
        var i = this.items.length;
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    setproto.getBBox = function () {
        var x = [],
            y = [],
            x2 = [],
            y2 = [];
        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            x2.push(box.x + box.width);
            y2.push(box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        x2 = mmax[apply](0, x2);
        y2 = mmax[apply](0, y2);
        return {
            x: x,
            y: y,
            x2: x2,
            y2: y2,
            width: x2 - x,
            height: y2 - y
        };
    };
    setproto.clone = function (s) {
        s = this.paper.set();
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            s.push(this.items[i].clone());
        }
        return s;
    };
    setproto.toString = function () {
        return "Rapha\xebl\u2018s set";
    };

    setproto.glow = function(glowConfig) {
        var ret = this.paper.set();
        this.forEach(function(shape, index){
            var g = shape.glow(glowConfig);
            if(g != null){
                g.forEach(function(shape2, index2){
                    ret.push(shape2);
                });
            }
        });
        return ret;
    };


    /*\
     * Set.isPointInside
     [ method ]
     **
     * Determine if given point is inside this set’s elements
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point is inside any of the set's elements
     \*/
    setproto.isPointInside = function (x, y) {
        var isPointInside = false;
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                console.log('runned');
                isPointInside = true;
                return false; // stop loop
            }
        });
        return isPointInside;
    };

    /*\
     * Raphael.registerFont
     [ method ]
     **
     * Adds given font to the registered set of fonts for Raphaël. Should be used as an internal call from within Cufón’s font file.
     * Returns original parameter, so it could be used with chaining.
     # <a href="http://wiki.github.com/sorccu/cufon/about">More about Cufón and how to convert your font form TTF, OTF, etc to JavaScript file.</a>
     **
     > Parameters
     **
     - font (object) the font to register
     = (object) the font you passed in
     > Usage
     | Cufon.registerFont(Raphael.registerFont({…}));
    \*/
    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family].push(fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    /*\
     * Paper.getFont
     [ method ]
     **
     * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”.
     **
     > Parameters
     **
     - family (string) font family name or any word from it
     - weight (string) #optional font weight
     - style (string) #optional font style
     - stretch (string) #optional font stretch
     = (object) the font object
     > Usage
     | paper.print(100, 100, "Test string", paper.getFont("Times", 800), 30);
    \*/
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font.length; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    /*\
     * Paper.print
     [ method ]
     **
     * Creates path that represent given text written using given font at given position with given size.
     * Result of the method is path element that contains whole text as a separate path.
     **
     > Parameters
     **
     - x (number) x position of the text
     - y (number) y position of the text
     - string (string) text to print
     - font (object) font object, see @Paper.getFont
     - size (number) #optional size of the font, default is `16`
     - origin (string) #optional could be `"baseline"` or `"middle"`, default is `"middle"`
     - letter_spacing (number) #optional number in range `-1..1`, default is `0`
     - line_spacing (number) #optional number in range `1..3`, default is `1`
     = (object) resulting path element, which consist of all letters
     > Usage
     | var txt = r.print(10, 50, "print", r.getFont("Museo"), 30).attr({fill: "#fff"});
    \*/
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing, line_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        line_spacing = mmax(mmin(line_spacing || 1, 3), 1);
        var letters = Str(string)[split](E),
            shift = 0,
            notfirst = 0,
            path = E,
            scale;
        R.is(font, "string") && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox[split](separator),
                top = +bb[0],
                lineHeight = bb[3] - bb[1],
                shifty = 0,
                height = +bb[1] + (origin == "baseline" ? lineHeight + (+font.face.descent) : lineHeight / 2);
            for (var i = 0, ii = letters.length; i < ii; i++) {
                if (letters[i] == "\n") {
                    shift = 0;
                    curr = 0;
                    notfirst = 0;
                    shifty += lineHeight * line_spacing;
                } else {
                    var prev = notfirst && font.glyphs[letters[i - 1]] || {},
                        curr = font.glyphs[letters[i]];
                    shift += notfirst ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                    notfirst = 1;
                }
                if (curr && curr.d) {
                    path += R.transformPath(curr.d, ["t", shift * scale, shifty * scale, "s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
                }
            }
        }
        return this.path(path).attr({
            fill: "#000",
            stroke: "none"
        });
    };

    /*\
     * Paper.add
     [ method ]
     **
     * Imports elements in JSON array in format `{type: type, <attributes>}`
     **
     > Parameters
     **
     - json (array)
     = (object) resulting set of imported elements
     > Usage
     | paper.add([
     |     {
     |         type: "circle",
     |         cx: 10,
     |         cy: 10,
     |         r: 5
     |     },
     |     {
     |         type: "rect",
     |         x: 10,
     |         y: 10,
     |         width: 10,
     |         height: 10,
     |         fill: "#fc0"
     |     }
     | ]);
    \*/
    paperproto.add = function (json) {
        if (R.is(json, "array")) {
            var res = this.set(),
                i = 0,
                ii = json.length,
                j;
            for (; i < ii; i++) {
                j = json[i] || {};
                elements[has](j.type) && res.push(this[j.type]().attr(j));
            }
        }
        return res;
    };

    /*\
     * Raphael.format
     [ method ]
     **
     * Simple format function. Replaces construction of type “`{<number>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - … (string) rest of arguments will be treated as parameters for replacement
     = (string) formated string
     > Usage
     | var x = 10,
     |     y = 20,
     |     width = 40,
     |     height = 50;
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.format("M{0},{1}h{2}v{3}h{4}z", x, y, width, height, -width));
    \*/
    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args.length - 1 && (token = token.replace(formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    /*\
     * Raphael.fullfill
     [ method ]
     **
     * A little bit more advanced format function than @Raphael.format. Replaces construction of type “`{<name>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - json (object) object which properties will be used as a replacement
     = (string) formated string
     > Usage
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.fullfill("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
     |     x: 10,
     |     y: 20,
     |     dim: {
     |         width: 40,
     |         height: 50,
     |         "negative width": -40
     |     }
     | }));
    \*/
    R.fullfill = (function () {
        var tokenRegex = /\{([^\}]+)\}/g,
            objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
            replacer = function (all, key, obj) {
                var res = obj;
                key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                    name = name || quotedName;
                    if (res) {
                        if (name in res) {
                            res = res[name];
                        }
                        typeof res == "function" && isFunc && (res = res());
                    }
                });
                res = (res == null || res == obj ? all : res) + "";
                return res;
            };
        return function (str, obj) {
            return String(str).replace(tokenRegex, function (all, key) {
                return replacer(all, key, obj);
            });
        };
    })();
    /*\
     * Raphael.ninja
     [ method ]
     **
     * If you want to leave no trace of Raphaël (Well, Raphaël creates only one global variable `Raphael`, but anyway.) You can use `ninja` method.
     * Beware, that in this case plugins could stop working, because they are depending on global variable existance.
     **
     = (object) Raphael object
     > Usage
     | (function (local_raphael) {
     |     var paper = local_raphael(10, 10, 320, 200);
     |     …
     | })(Raphael.ninja());
    \*/
    R.ninja = function () {
        oldRaphael.was ? (g.win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    /*\
     * Raphael.st
     [ property (object) ]
     **
     * You can add your own method to elements and sets. It is wise to add a set method for each element method
     * you added, so you will be able to call the same method on sets too.
     **
     * See also @Raphael.el.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | Raphael.st.red = function () {
     |     this.forEach(function (el) {
     |         el.red();
     |     });
     | };
     | // then use it
     | paper.set(paper.circle(100, 100, 20), paper.circle(110, 100, 20)).red();
    \*/
    R.st = setproto;
    // Firefox <3.6 fix: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
    (function (doc, loaded, f) {
        if (doc.readyState == null && doc.addEventListener){
            doc.addEventListener(loaded, f = function () {
                doc.removeEventListener(loaded, f, false);
                doc.readyState = "complete";
            }, false);
            doc.readyState = "loading";
        }
        function isLoaded() {
            (/in/).test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("raphael.DOMload");
        }
        isLoaded();
    })(document, "DOMContentLoaded");

    eve.on("raphael.DOMload", function () {
        loaded = true;
    });

// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ SVG Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function(){
    if (!R.svg) {
        return;
    }
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        toInt = parseInt,
        math = Math,
        mmax = math.max,
        abs = math.abs,
        pow = math.pow,
        separator = /[, ]+/,
        eve = R.eve,
        E = "",
        S = " ";
    var xlink = "http://www.w3.org/1999/xlink",
        markers = {
            block: "M5,0 0,2.5 5,5z",
            classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
            diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
            open: "M6,1 1,3.5 6,6",
            oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
        },
        markerCounter = {};
    R.toString = function () {
        return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
    };
    var $ = function (el, attr) {
        if (attr) {
            if (typeof el == "string") {
                el = $(el);
            }
            for (var key in attr) if (attr[has](key)) {
                if (key.substring(0, 6) == "xlink:") {
                    el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
                } else {
                    el.setAttribute(key, Str(attr[key]));
                }
            }
        } else {
            el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
            el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
        }
        return el;
    },
    addGradientFill = function (element, gradient) {
        var type = "linear",
            id = element.id + gradient,
            fx = .5, fy = .5,
            o = element.node,
            SVG = element.paper,
            s = o.style,
            el = R._g.doc.getElementById(id);
        if (!el) {
            gradient = Str(gradient).replace(R._radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient.split(/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = R._parseDots(gradient);
            if (!dots) {
                return null;
            }
            id = id.replace(/[\(\)\s,\xb0#]/g, "_");
            
            if (element.gradient && id != element.gradient.id) {
                SVG.defs.removeChild(element.gradient);
                delete element.gradient;
            }

            if (!element.gradient) {
                el = $(type + "Gradient", {id: id});
                element.gradient = el;
                $(el, type == "radial" ? {
                    fx: fx,
                    fy: fy
                } : {
                    x1: vector[0],
                    y1: vector[1],
                    x2: vector[2],
                    y2: vector[3],
                    gradientTransform: element.matrix.invert()
                });
                SVG.defs.appendChild(el);
                for (var i = 0, ii = dots.length; i < ii; i++) {
                    el.appendChild($("stop", {
                        offset: dots[i].offset ? dots[i].offset : i ? "100%" : "0%",
                        "stop-color": dots[i].color || "#fff"
                    }));
                }
            }
        }
        $(o, {
            fill: "url(#" + id + ")",
            opacity: 1,
            "fill-opacity": 1
        });
        s.fill = E;
        s.opacity = 1;
        s.fillOpacity = 1;
        return 1;
    },
    updatePosition = function (o) {
        var bbox = o.getBBox(1);
        $(o.pattern, {patternTransform: o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
    },
    addArrow = function (o, value, isEnd) {
        if (o.type == "path") {
            var values = Str(value).toLowerCase().split("-"),
                p = o.paper,
                se = isEnd ? "end" : "start",
                node = o.node,
                attrs = o.attrs,
                stroke = attrs["stroke-width"],
                i = values.length,
                type = "classic",
                from,
                to,
                dx,
                refX,
                attr,
                w = 3,
                h = 3,
                t = 5;
            while (i--) {
                switch (values[i]) {
                    case "block":
                    case "classic":
                    case "oval":
                    case "diamond":
                    case "open":
                    case "none":
                        type = values[i];
                        break;
                    case "wide": h = 5; break;
                    case "narrow": h = 2; break;
                    case "long": w = 5; break;
                    case "short": w = 2; break;
                }
            }
            if (type == "open") {
                w += 2;
                h += 2;
                t += 2;
                dx = 1;
                refX = isEnd ? 4 : 1;
                attr = {
                    fill: "none",
                    stroke: attrs.stroke
                };
            } else {
                refX = dx = w / 2;
                attr = {
                    fill: attrs.stroke,
                    stroke: "none"
                };
            }
            if (o._.arrows) {
                if (isEnd) {
                    o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
                    o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
                } else {
                    o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
                    o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
                }
            } else {
                o._.arrows = {};
            }
            if (type != "none") {
                var pathId = "raphael-marker-" + type,
                    markerId = "raphael-marker-" + se + type + w + h;
                if (!R._g.doc.getElementById(pathId)) {
                    p.defs.appendChild($($("path"), {
                        "stroke-linecap": "round",
                        d: markers[type],
                        id: pathId
                    }));
                    markerCounter[pathId] = 1;
                } else {
                    markerCounter[pathId]++;
                }
                var marker = R._g.doc.getElementById(markerId),
                    use;
                if (!marker) {
                    marker = $($("marker"), {
                        id: markerId,
                        markerHeight: h,
                        markerWidth: w,
                        orient: "auto",
                        refX: refX,
                        refY: h / 2
                    });
                    use = $($("use"), {
                        "xlink:href": "#" + pathId,
                        transform: (isEnd ? "rotate(180 " + w / 2 + " " + h / 2 + ") " : E) + "scale(" + w / t + "," + h / t + ")",
                        "stroke-width": (1 / ((w / t + h / t) / 2)).toFixed(4)
                    });
                    marker.appendChild(use);
                    p.defs.appendChild(marker);
                    markerCounter[markerId] = 1;
                } else {
                    markerCounter[markerId]++;
                    use = marker.getElementsByTagName("use")[0];
                }
                $(use, attr);
                var delta = dx * (type != "diamond" && type != "oval");
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - delta * stroke;
                } else {
                    from = delta * stroke;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                attr = {};
                attr["marker-" + se] = "url(#" + markerId + ")";
                if (to || from) {
                    attr.d = R.getSubpath(attrs.path, from, to);
                }
                $(node, attr);
                o._.arrows[se + "Path"] = pathId;
                o._.arrows[se + "Marker"] = markerId;
                o._.arrows[se + "dx"] = delta;
                o._.arrows[se + "Type"] = type;
                o._.arrows[se + "String"] = value;
            } else {
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - from;
                } else {
                    from = 0;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                o._.arrows[se + "Path"] && $(node, {d: R.getSubpath(attrs.path, from, to)});
                delete o._.arrows[se + "Path"];
                delete o._.arrows[se + "Marker"];
                delete o._.arrows[se + "dx"];
                delete o._.arrows[se + "Type"];
                delete o._.arrows[se + "String"];
            }
            for (attr in markerCounter) if (markerCounter[has](attr) && !markerCounter[attr]) {
                var item = R._g.doc.getElementById(attr);
                item && item.parentNode.removeChild(item);
            }
        }
    },
    dasharray = {
        "": [0],
        "none": [0],
        "-": [3, 1],
        ".": [1, 1],
        "-.": [3, 1, 1, 1],
        "-..": [3, 1, 1, 1, 1, 1],
        ". ": [1, 3],
        "- ": [4, 3],
        "--": [8, 3],
        "- .": [4, 3, 1, 3],
        "--.": [8, 3, 1, 3],
        "--..": [8, 3, 1, 3, 1, 3]
    },
    addDashes = function (o, value, params) {
        value = dasharray[Str(value).toLowerCase()];
        if (value) {
            var width = o.attrs["stroke-width"] || "1",
                butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                dashes = [],
                i = value.length;
            while (i--) {
                dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
            }
            $(o.node, {"stroke-dasharray": dashes.join(",")});
        }
    },
    setFillAndStroke = function (o, params) {
        var node = o.node,
            attrs = o.attrs,
            vis = node.style.visibility;
        node.style.visibility = "hidden";
        for (var att in params) {
            if (params[has](att)) {
                if (!R._availableAttrs[has](att)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    case "blur":
                        o.blur(value);
                        break;
                    case "href":
                    case "title":
                    case "target":
                        var pn = node.parentNode;
                        if (pn.tagName.toLowerCase() != "a") {
                            var hl = $("a");
                            pn.insertBefore(hl, node);
                            hl.appendChild(node);
                            pn = hl;
                        }
                        if (att == "target") {
                            pn.setAttributeNS(xlink, "show", value == "blank" ? "new" : value);
                        } else {
                            pn.setAttributeNS(xlink, att, value);
                        }
                        break;
                    case "cursor":
                        node.style.cursor = value;
                        break;
                    case "transform":
                        o.transform(value);
                        break;
                    case "arrow-start":
                        addArrow(o, value);
                        break;
                    case "arrow-end":
                        addArrow(o, value, 1);
                        break;
                    case "clip-rect":
                        var rect = Str(value).split(separator);
                        if (rect.length == 4) {
                            o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                            var el = $("clipPath"),
                                rc = $("rect");
                            el.id = R.createUUID();
                            $(rc, {
                                x: rect[0],
                                y: rect[1],
                                width: rect[2],
                                height: rect[3]
                            });
                            el.appendChild(rc);
                            o.paper.defs.appendChild(el);
                            $(node, {"clip-path": "url(#" + el.id + ")"});
                            o.clip = rc;
                        }
                        if (!value) {
                            var path = node.getAttribute("clip-path");
                            if (path) {
                                var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        }
                    break;
                    case "path":
                        if (o.type == "path") {
                            $(node, {d: value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                            o._.dirty = 1;
                            if (o._.arrows) {
                                "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                            }
                        }
                        break;
                    case "width":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                        if (att == "rx" && o.type == "rect") {
                            break;
                        }
                    case "cx":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "height":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                        if (att == "ry" && o.type == "rect") {
                            break;
                        }
                    case "cy":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "r":
                        if (o.type == "rect") {
                            $(node, {rx: value, ry: value});
                        } else {
                            node.setAttribute(att, value);
                        }
                        o._.dirty = 1;
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        if (o._.sx != 1 || o._.sy != 1) {
                            value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
                        }
                        if (o.paper._vbSize) {
                            value *= o.paper._vbSize;
                        }
                        node.setAttribute(att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"], params);
                        }
                        if (o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value, params);
                        break;
                    case "fill":
                        var isURL = Str(value).match(R._ISURL);
                        if (isURL) {
                            el = $("pattern");
                            var ig = $("image");
                            el.id = R.createUUID();
                            $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                            $(ig, {x: 0, y: 0, "xlink:href": isURL[1]});
                            el.appendChild(ig);

                            (function (el) {
                                R._preload(isURL[1], function () {
                                    var w = this.offsetWidth,
                                        h = this.offsetHeight;
                                    $(el, {width: w, height: h});
                                    $(ig, {width: w, height: h});
                                    o.paper.safari();
                                });
                            })(el);
                            o.paper.defs.appendChild(el);
                            $(node, {fill: "url(#" + el.id + ")"});
                            o.pattern = el;
                            o.pattern && updatePosition(o);
                            break;
                        }
                        var clr = R.getRGB(value);
                        if (!clr.error) {
                            delete params.gradient;
                            delete attrs.gradient;
                            !R.is(attrs.opacity, "undefined") &&
                                R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                            !R.is(attrs["fill-opacity"], "undefined") &&
                                R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                        } else if ((o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value)) {
                            if ("opacity" in attrs || "fill-opacity" in attrs) {
                                var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    $(stops[stops.length - 1], {"stop-opacity": ("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                                }
                            }
                            attrs.gradient = value;
                            attrs.fill = "none";
                            break;
                        }
                        clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                    case "stroke":
                        clr = R.getRGB(value);
                        node.setAttribute(att, clr.hex);
                        att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        if (att == "stroke" && o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "gradient":
                        (o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value);
                        break;
                    case "opacity":
                        if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                            $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                        }
                        // fall
                    case "fill-opacity":
                        if (attrs.gradient) {
                            gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                            if (gradient) {
                                stops = gradient.getElementsByTagName("stop");
                                $(stops[stops.length - 1], {"stop-opacity": value});
                            }
                            break;
                        }
                    default:
                        att == "font-size" && (value = toInt(value, 10) + "px");
                        var cssrule = att.replace(/(\-.)/g, function (w) {
                            return w.substring(1).toUpperCase();
                        });
                        node.style[cssrule] = value;
                        o._.dirty = 1;
                        node.setAttribute(att, value);
                        break;
                }
            }
        }

        tuneText(o, params);
        node.style.visibility = vis;
    },
    leading = 1.2,
    tuneText = function (el, params) {
        if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
            return;
        }
        var a = el.attrs,
            node = el.node,
            fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

        if (params[has]("text")) {
            a.text = params.text;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            var texts = Str(params.text).split("\n"),
                tspans = [],
                tspan;
            for (var i = 0, ii = texts.length; i < ii; i++) {
                tspan = $("tspan");
                i && $(tspan, {dy: fontSize * leading, x: a.x});
                tspan.appendChild(R._g.doc.createTextNode(texts[i]));
                node.appendChild(tspan);
                tspans[i] = tspan;
            }
        } else {
            tspans = node.getElementsByTagName("tspan");
            for (i = 0, ii = tspans.length; i < ii; i++) if (i) {
                $(tspans[i], {dy: fontSize * leading, x: a.x});
            } else {
                $(tspans[0], {dy: 0});
            }
        }
        $(node, {x: a.x, y: a.y});
        el._.dirty = 1;
        var bb = el._getBBox(),
            dif = a.y - (bb.y + bb.height / 2);
        dif && R.is(dif, "finite") && $(tspans[0], {dy: dif});
    },
    Element = function (node, svg) {
        var X = 0,
            Y = 0;
        /*\
         * Element.node
         [ property (object) ]
         **
         * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
         **
         * Note: Don’t mess with it.
         > Usage
         | // draw a circle at coordinate 10,10 with radius of 10
         | var c = paper.circle(10, 10, 10);
         | c.node.onclick = function () {
         |     c.attr("fill", "red");
         | };
        \*/
        this[0] = this.node = node;
        /*\
         * Element.raphael
         [ property (object) ]
         **
         * Internal reference to @Raphael object. In case it is not available.
         > Usage
         | Raphael.el.red = function () {
         |     var hsb = this.paper.raphael.rgb2hsb(this.attr("fill"));
         |     hsb.h = 1;
         |     this.attr({fill: this.paper.raphael.hsb2rgb(hsb).hex});
         | }
        \*/
        node.raphael = true;
        /*\
         * Element.id
         [ property (number) ]
         **
         * Unique id of the element. Especially usesful when you want to listen to events of the element, 
         * because all events are fired in format `<module>.<action>.<id>`. Also useful for @Paper.getById method.
        \*/
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.matrix = R.matrix();
        this.realPath = null;
        /*\
         * Element.paper
         [ property (object) ]
         **
         * Internal reference to “paper” where object drawn. Mainly for use in plugins and element extensions.
         > Usage
         | Raphael.el.cross = function () {
         |     this.attr({fill: "red"});
         |     this.paper.path("M10,10L50,50M50,10L10,50")
         |         .attr({stroke: "red"});
         | }
        \*/
        this.paper = svg;
        this.attrs = this.attrs || {};
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            deg: 0,
            dx: 0,
            dy: 0,
            dirty: 1
        };
        !svg.bottom && (svg.bottom = this);
        /*\
         * Element.prev
         [ property (object) ]
         **
         * Reference to the previous element in the hierarchy.
        \*/
        this.prev = svg.top;
        svg.top && (svg.top.next = this);
        svg.top = this;
        /*\
         * Element.next
         [ property (object) ]
         **
         * Reference to the next element in the hierarchy.
        \*/
        this.next = null;
    },
    elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;

    R._engine.path = function (pathString, SVG) {
        var el = $("path");
        SVG.canvas && SVG.canvas.appendChild(el);
        var p = new Element(el, SVG);
        p.type = "path";
        setFillAndStroke(p, {
            fill: "none",
            stroke: "#000",
            path: pathString
        });
        return p;
    };
    /*\
     * Element.rotate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds rotation by given angle around given point to the list of
     * transformations of the element.
     > Parameters
     - deg (number) angle in degrees
     - cx (number) #optional x coordinate of the centre of rotation
     - cy (number) #optional y coordinate of the centre of rotation
     * If cx & cy aren’t specified centre of the shape is used as a point of rotation.
     = (object) @Element
    \*/
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    /*\
     * Element.scale
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds scale by given amount relative to given point to the list of
     * transformations of the element.
     > Parameters
     - sx (number) horisontal scale amount
     - sy (number) vertical scale amount
     - cx (number) #optional x coordinate of the centre of scale
     - cy (number) #optional y coordinate of the centre of scale
     * If cx & cy aren’t specified centre of the shape is used instead.
     = (object) @Element
    \*/
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        return this;
    };
    /*\
     * Element.translate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds translation by given amount to the list of transformations of the element.
     > Parameters
     - dx (number) horisontal shift
     - dy (number) vertical shift
     = (object) @Element
    \*/
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    /*\
     * Element.transform
     [ method ]
     **
     * Adds transformation to the element which is separate to other attributes,
     * i.e. translation doesn’t change `x` or `y` of the rectange. The format
     * of transformation string is similar to the path string syntax:
     | "t100,100r30,100,100s2,2,100,100r45s1.5"
     * Each letter is a command. There are four commands: `t` is for translate, `r` is for rotate, `s` is for
     * scale and `m` is for matrix.
     *
     * There are also alternative “absolute” translation, rotation and scale: `T`, `R` and `S`. They will not take previous transformation into account. For example, `...T100,0` will always move element 100 px horisontally, while `...t100,0` could move it vertically if there is `r90` before. Just compare results of `r90t100,0` and `r90T100,0`.
     *
     * So, the example line above could be read like “translate by 100, 100; rotate 30° around 100, 100; scale twice around 100, 100;
     * rotate 45° around centre; scale 1.5 times relative to centre”. As you can see rotate and scale commands have origin
     * coordinates as optional parameters, the default is the centre point of the element.
     * Matrix accepts six parameters.
     > Usage
     | var el = paper.rect(10, 20, 300, 200);
     | // translate 100, 100, rotate 45°, translate -100, 0
     | el.transform("t100,100r45t-100,0");
     | // if you want you can append or prepend transformations
     | el.transform("...t50,50");
     | el.transform("s2...");
     | // or even wrap
     | el.transform("t50,50...t-50-50");
     | // to reset transformation call method with empty string
     | el.transform("");
     | // to get current value call it without parameters
     | console.log(el.transform());
     > Parameters
     - tstr (string) #optional transformation string
     * If tstr isn’t specified
     = (string) current transformation string
     * else
     = (object) @Element
    \*/
    elproto.transform = function (tstr) {
        var _ = this._;
        if (tstr == null) {
            return _.transform;
        }
        R._extractTransform(this, tstr);

        this.clip && $(this.clip, {transform: this.matrix.invert()});
        this.pattern && updatePosition(this);
        this.node && $(this.node, {transform: this.matrix});
    
        if (_.sx != 1 || _.sy != 1) {
            var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
            this.attr({"stroke-width": sw});
        }

        return this;
    };
    /*\
     * Element.hide
     [ method ]
     **
     * Makes element invisible. See @Element.show.
     = (object) @Element
    \*/
    elproto.hide = function () {
        !this.removed && this.paper.safari(this.node.style.display = "none");
        return this;
    };
    /*\
     * Element.show
     [ method ]
     **
     * Makes element visible. See @Element.hide.
     = (object) @Element
    \*/
    elproto.show = function () {
        !this.removed && this.paper.safari(this.node.style.display = "");
        return this;
    };
    /*\
     * Element.remove
     [ method ]
     **
     * Removes element from the paper.
    \*/
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        var paper = this.paper;
        paper.__set__ && paper.__set__.exclude(this);
        eve.unbind("raphael.*.*." + this.id);
        if (this.gradient) {
            paper.defs.removeChild(this.gradient);
        }
        R._tear(this, paper);
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.removeChild(this.node.parentNode);
        } else {
            this.node.parentNode.removeChild(this.node);
        }
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto._getBBox = function () {
        if (this.node.style.display == "none") {
            this.show();
            var hide = true;
        }
        var bbox = {};
        try {
            bbox = this.node.getBBox();
        } catch(e) {
            // Firefox 3.0.x plays badly here
        } finally {
            bbox = bbox || {};
        }
        hide && this.hide();
        return bbox;
    };
    /*\
     * Element.attr
     [ method ]
     **
     * Sets the attributes of the element.
     > Parameters
     - attrName (string) attribute’s name
     - value (string) value
     * or
     - params (object) object of name/value pairs
     * or
     - attrName (string) attribute’s name
     * or
     - attrNames (array) in this case method returns array of current values for given attribute names
     = (object) @Element if attrsName & value or params are passed in.
     = (...) value of the attribute if only attrsName is passed in.
     = (array) array of values of the attribute if attrsNames is passed in.
     = (object) object of attributes if nothing is passed in.
     > Possible parameters
     # <p>Please refer to the <a href="http://www.w3.org/TR/SVG/" title="The W3C Recommendation for the SVG language describes these properties in detail.">SVG specification</a> for an explanation of these parameters.</p>
     o arrow-end (string) arrowhead on the end of the path. The format for string is `<type>[-<width>[-<length>]]`. Possible types: `classic`, `block`, `open`, `oval`, `diamond`, `none`, width: `wide`, `narrow`, `medium`, length: `long`, `short`, `midium`.
     o clip-rect (string) comma or space separated values: x, y, width and height
     o cursor (string) CSS type of the cursor
     o cx (number) the x-axis coordinate of the center of the circle, or ellipse
     o cy (number) the y-axis coordinate of the center of the circle, or ellipse
     o fill (string) colour, gradient or image
     o fill-opacity (number)
     o font (string)
     o font-family (string)
     o font-size (number) font size in pixels
     o font-weight (string)
     o height (number)
     o href (string) URL, if specified element behaves as hyperlink
     o opacity (number)
     o path (string) SVG path string format
     o r (number) radius of the circle, ellipse or rounded corner on the rect
     o rx (number) horisontal radius of the ellipse
     o ry (number) vertical radius of the ellipse
     o src (string) image URL, only works for @Element.image element
     o stroke (string) stroke colour
     o stroke-dasharray (string) [“”, “`-`”, “`.`”, “`-.`”, “`-..`”, “`. `”, “`- `”, “`--`”, “`- .`”, “`--.`”, “`--..`”]
     o stroke-linecap (string) [“`butt`”, “`square`”, “`round`”]
     o stroke-linejoin (string) [“`bevel`”, “`round`”, “`miter`”]
     o stroke-miterlimit (number)
     o stroke-opacity (number)
     o stroke-width (number) stroke width in pixels, default is '1'
     o target (string) used with href
     o text (string) contents of the text element. Use `\n` for multiline text
     o text-anchor (string) [“`start`”, “`middle`”, “`end`”], default is “`middle`”
     o title (string) will create tooltip with a given text
     o transform (string) see @Element.transform
     o width (number)
     o x (number)
     o y (number)
     > Gradients
     * Linear gradient format: “`‹angle›-‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`90-#fff-#000`” – 90°
     * gradient from white to black or “`0-#fff-#f00:20-#000`” – 0° gradient from white via red (at 20%) to black.
     *
     * radial gradient: “`r[(‹fx›, ‹fy›)]‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`r#fff-#000`” –
     * gradient from white to black or “`r(0.25, 0.75)#fff-#000`” – gradient from white to black with focus point
     * at 0.25, 0.75. Focus point coordinates are in 0..1 range. Radial gradients can only be applied to circles and ellipses.
     > Path String
     # <p>Please refer to <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path’s data attribute’s format are described in the SVG specification.">SVG documentation regarding path string</a>. Raphaël fully supports it.</p>
     > Colour Parsing
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>rgba(•••, •••, •••, •••) — red, green and blue channels’ values: (“<code>rgba(200,&nbsp;100,&nbsp;0, .5)</code>”)</li>
     #     <li>rgba(•••%, •••%, •••%, •••%) — same as above, but in %: (“<code>rgba(100%,&nbsp;175%,&nbsp;0%, 50%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsba(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>hsl(•••, •••, •••) — almost the same as hsb, see <a href="http://en.wikipedia.org/wiki/HSL_and_HSV" title="HSL and HSV - Wikipedia, the free encyclopedia">Wikipedia page</a></li>
     #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsla(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>Optionally for hsb and hsl you could specify hue as a degree: “<code>hsl(240deg,&nbsp;1,&nbsp;.5)</code>” or, if you want to go fancy, “<code>hsl(240°,&nbsp;1,&nbsp;.5)</code>”</li>
     # </ul>
    \*/
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            if (name == "transform") {
                return this._.transform;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        if (value != null) {
            var params = {};
            params[name] = value;
        } else if (name != null && R.is(name, "object")) {
            params = name;
        }
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
            var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
            this.attrs[key] = params[key];
            for (var subkey in par) if (par[has](subkey)) {
                params[subkey] = par[subkey];
            }
        }
        setFillAndStroke(this, params);
        return this;
    };
    /*\
     * Element.toFront
     [ method ]
     **
     * Moves the element so it is the closest to the viewer’s eyes, on top of other elements.
     = (object) @Element
    \*/
    elproto.toFront = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.appendChild(this.node.parentNode);
        } else {
            this.node.parentNode.appendChild(this.node);
        }
        var svg = this.paper;
        svg.top != this && R._tofront(this, svg);
        return this;
    };
    /*\
     * Element.toBack
     [ method ]
     **
     * Moves the element so it is the furthest from the viewer’s eyes, behind other elements.
     = (object) @Element
    \*/
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        var parent = this.node.parentNode;
        if (parent.tagName.toLowerCase() == "a") {
            parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild); 
        } else if (parent.firstChild != this.node) {
            parent.insertBefore(this.node, this.node.parentNode.firstChild);
        }
        R._toback(this, this.paper);
        var svg = this.paper;
        return this;
    };
    /*\
     * Element.insertAfter
     [ method ]
     **
     * Inserts current object after the given one.
     = (object) @Element
    \*/
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[element.length - 1].node;
        if (node.nextSibling) {
            node.parentNode.insertBefore(this.node, node.nextSibling);
        } else {
            node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    /*\
     * Element.insertBefore
     [ method ]
     **
     * Inserts current object before the given one.
     = (object) @Element
    \*/
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[0].node;
        node.parentNode.insertBefore(this.node, node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        // Experimental. No Safari support. Use it on your own risk.
        var t = this;
        if (+size !== 0) {
            var fltr = $("filter"),
                blur = $("feGaussianBlur");
            t.attrs.blur = size;
            fltr.id = R.createUUID();
            $(blur, {stdDeviation: +size || 1.5});
            fltr.appendChild(blur);
            t.paper.defs.appendChild(fltr);
            t._blur = fltr;
            $(t.node, {filter: "url(#" + fltr.id + ")"});
        } else {
            if (t._blur) {
                t._blur.parentNode.removeChild(t._blur);
                delete t._blur;
                delete t.attrs.blur;
            }
            t.node.removeAttribute("filter");
        }
        return t;
    };
    R._engine.circle = function (svg, x, y, r) {
        var el = $("circle");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
        res.type = "circle";
        $(el, res.attrs);
        return res;
    };
    R._engine.rect = function (svg, x, y, w, h, r) {
        var el = $("rect");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
        res.type = "rect";
        $(el, res.attrs);
        return res;
    };
    R._engine.ellipse = function (svg, x, y, rx, ry) {
        var el = $("ellipse");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
        res.type = "ellipse";
        $(el, res.attrs);
        return res;
    };
    R._engine.image = function (svg, src, x, y, w, h) {
        var el = $("image");
        $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
        el.setAttributeNS(xlink, "href", src);
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, src: src};
        res.type = "image";
        return res;
    };
    R._engine.text = function (svg, x, y, text) {
        var el = $("text");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {
            x: x,
            y: y,
            "text-anchor": "middle",
            text: text,
            font: R._availableAttrs.font,
            stroke: "none",
            fill: "#000"
        };
        res.type = "text";
        setFillAndStroke(res, res.attrs);
        return res;
    };
    R._engine.setSize = function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        if (this._viewBox) {
            this.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con && con.container,
            x = con.x,
            y = con.y,
            width = con.width,
            height = con.height;
        if (!container) {
            throw new Error("SVG container not found.");
        }
        var cnvs = $("svg"),
            css = "overflow:hidden;",
            isFloating;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        $(cnvs, {
            height: height,
            version: 1.1,
            width: width,
            xmlns: "http://www.w3.org/2000/svg"
        });
        if (container == 1) {
            cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
            R._g.doc.body.appendChild(cnvs);
            isFloating = 1;
        } else {
            cnvs.style.cssText = css + "position:relative";
            if (container.firstChild) {
                container.insertBefore(cnvs, container.firstChild);
            } else {
                container.appendChild(cnvs);
            }
        }
        container = new R._Paper;
        container.width = width;
        container.height = height;
        container.canvas = cnvs;
        container.clear();
        container._left = container._top = 0;
        isFloating && (container.renderfix = function () {});
        container.renderfix();
        return container;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var size = mmax(w / this.width, h / this.height),
            top = this.top,
            aspectRatio = fit ? "meet" : "xMinYMin",
            vb,
            sw;
        if (x == null) {
            if (this._vbSize) {
                size = 1;
            }
            delete this._vbSize;
            vb = "0 0 " + this.width + S + this.height;
        } else {
            this._vbSize = size;
            vb = x + S + y + S + w + S + h;
        }
        $(this.canvas, {
            viewBox: vb,
            preserveAspectRatio: aspectRatio
        });
        while (size && top) {
            sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
            top.attr({"stroke-width": sw});
            top._.dirty = 1;
            top._.dirtyT = 1;
            top = top.prev;
        }
        this._viewBox = [x, y, w, h, !!fit];
        return this;
    };
    /*\
     * Paper.renderfix
     [ method ]
     **
     * Fixes the issue of Firefox and IE9 regarding subpixel rendering. If paper is dependant
     * on other elements after reflow it could shift half pixel which cause for lines to lost their crispness.
     * This method fixes the issue.
     **
       Special thanks to Mariusz Nowak (http://www.medikoo.com/) for this method.
    \*/
    R.prototype.renderfix = function () {
        var cnvs = this.canvas,
            s = cnvs.style,
            pos;
        try {
            pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix();
        } catch (e) {
            pos = cnvs.createSVGMatrix();
        }
        var left = -pos.e % 1,
            top = -pos.f % 1;
        if (left || top) {
            if (left) {
                this._left = (this._left + left) % 1;
                s.left = this._left + "px";
            }
            if (top) {
                this._top = (this._top + top) % 1;
                s.top = this._top + "px";
            }
        }
    };
    /*\
     * Paper.clear
     [ method ]
     **
     * Clears the paper, i.e. removes all the elements.
    \*/
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        var c = this.canvas;
        while (c.firstChild) {
            c.removeChild(c.firstChild);
        }
        this.bottom = this.top = null;
        (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\xebl " + R.version));
        c.appendChild(this.desc);
        c.appendChild(this.defs = $("defs"));
    };
    /*\
     * Paper.remove
     [ method ]
     **
     * Removes the paper from the DOM.
    \*/
    R.prototype.remove = function () {
        eve("raphael.remove", this);
        this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
    };
    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
})();

// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ VML Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

(function(){
    if (!R.vml) {
        return;
    }
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        math = Math,
        round = math.round,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        fillString = "fill",
        separator = /[, ]+/,
        eve = R.eve,
        ms = " progid:DXImageTransform.Microsoft",
        S = " ",
        E = "",
        map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
        bites = /([clmz]),?([^clmz]*)/gi,
        blurregexp = / progid:\S+Blur\([^\)]+\)/g,
        val = /-?[^,\s-]+/g,
        cssDot = "position:absolute;left:0;top:0;width:1px;height:1px",
        zoom = 21600,
        pathTypes = {path: 1, rect: 1, image: 1},
        ovalTypes = {circle: 1, ellipse: 1},
        path2vml = function (path) {
            var total =  /[ahqstv]/ig,
                command = R._pathToAbsolute;
            Str(path).match(total) && (command = R._path2curve);
            total = /[clmz]/g;
            if (command == R._pathToAbsolute && !Str(path).match(total)) {
                var res = Str(path).replace(bites, function (all, command, args) {
                    var vals = [],
                        isMove = command.toLowerCase() == "m",
                        res = map[command];
                    args.replace(val, function (value) {
                        if (isMove && vals.length == 2) {
                            res += vals + map[command == "m" ? "l" : "L"];
                            vals = [];
                        }
                        vals.push(round(value * zoom));
                    });
                    return res + vals;
                });
                return res;
            }
            var pa = command(path), p, r;
            res = [];
            for (var i = 0, ii = pa.length; i < ii; i++) {
                p = pa[i];
                r = pa[i][0].toLowerCase();
                r == "z" && (r = "x");
                for (var j = 1, jj = p.length; j < jj; j++) {
                    r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                }
                res.push(r);
            }
            return res.join(S);
        },
        compensation = function (deg, dx, dy) {
            var m = R.matrix();
            m.rotate(-deg, .5, .5);
            return {
                dx: m.x(dx, dy),
                dy: m.y(dx, dy)
            };
        },
        setCoords = function (p, sx, sy, dx, dy, deg) {
            var _ = p._,
                m = p.matrix,
                fillpos = _.fillpos,
                o = p.node,
                s = o.style,
                y = 1,
                flip = "",
                dxdy,
                kx = zoom / sx,
                ky = zoom / sy;
            s.visibility = "hidden";
            if (!sx || !sy) {
                return;
            }
            o.coordsize = abs(kx) + S + abs(ky);
            s.rotation = deg * (sx * sy < 0 ? -1 : 1);
            if (deg) {
                var c = compensation(deg, dx, dy);
                dx = c.dx;
                dy = c.dy;
            }
            sx < 0 && (flip += "x");
            sy < 0 && (flip += " y") && (y = -1);
            s.flip = flip;
            o.coordorigin = (dx * -kx) + S + (dy * -ky);
            if (fillpos || _.fillsize) {
                var fill = o.getElementsByTagName(fillString);
                fill = fill && fill[0];
                o.removeChild(fill);
                if (fillpos) {
                    c = compensation(deg, m.x(fillpos[0], fillpos[1]), m.y(fillpos[0], fillpos[1]));
                    fill.position = c.dx * y + S + c.dy * y;
                }
                if (_.fillsize) {
                    fill.size = _.fillsize[0] * abs(sx) + S + _.fillsize[1] * abs(sy);
                }
                o.appendChild(fill);
            }
            s.visibility = "visible";
        };
    R.toString = function () {
        return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
    };
    var addArrow = function (o, value, isEnd) {
        var values = Str(value).toLowerCase().split("-"),
            se = isEnd ? "end" : "start",
            i = values.length,
            type = "classic",
            w = "medium",
            h = "medium";
        while (i--) {
            switch (values[i]) {
                case "block":
                case "classic":
                case "oval":
                case "diamond":
                case "open":
                case "none":
                    type = values[i];
                    break;
                case "wide":
                case "narrow": h = values[i]; break;
                case "long":
                case "short": w = values[i]; break;
            }
        }
        var stroke = o.node.getElementsByTagName("stroke")[0];
        stroke[se + "arrow"] = type;
        stroke[se + "arrowlength"] = w;
        stroke[se + "arrowwidth"] = h;
    },
    setFillAndStroke = function (o, params) {
        // o.paper.canvas.style.display = "none";
        o.attrs = o.attrs || {};
        var node = o.node,
            a = o.attrs,
            s = node.style,
            xy,
            newpath = pathTypes[o.type] && (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.cx != a.cx || params.cy != a.cy || params.rx != a.rx || params.ry != a.ry || params.r != a.r),
            isOval = ovalTypes[o.type] && (a.cx != params.cx || a.cy != params.cy || a.r != params.r || a.rx != params.rx || a.ry != params.ry),
            res = o;


        for (var par in params) if (params[has](par)) {
            a[par] = params[par];
        }
        if (newpath) {
            a.path = R._getPath[o.type](o);
            o._.dirty = 1;
        }
        params.href && (node.href = params.href);
        params.title && (node.title = params.title);
        params.target && (node.target = params.target);
        params.cursor && (s.cursor = params.cursor);
        "blur" in params && o.blur(params.blur);
        if (params.path && o.type == "path" || newpath) {
            node.path = path2vml(~Str(a.path).toLowerCase().indexOf("r") ? R._pathToAbsolute(a.path) : a.path);
            if (o.type == "image") {
                o._.fillpos = [a.x, a.y];
                o._.fillsize = [a.width, a.height];
                setCoords(o, 1, 1, 0, 0, 0);
            }
        }
        "transform" in params && o.transform(params.transform);
        if (isOval) {
            var cx = +a.cx,
                cy = +a.cy,
                rx = +a.rx || +a.r || 0,
                ry = +a.ry || +a.r || 0;
            node.path = R.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", round((cx - rx) * zoom), round((cy - ry) * zoom), round((cx + rx) * zoom), round((cy + ry) * zoom), round(cx * zoom));
            o._.dirty = 1;
        }
        if ("clip-rect" in params) {
            var rect = Str(params["clip-rect"]).split(separator);
            if (rect.length == 4) {
                rect[2] = +rect[2] + (+rect[0]);
                rect[3] = +rect[3] + (+rect[1]);
                var div = node.clipRect || R._g.doc.createElement("div"),
                    dstyle = div.style;
                dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                if (!node.clipRect) {
                    dstyle.position = "absolute";
                    dstyle.top = 0;
                    dstyle.left = 0;
                    dstyle.width = o.paper.width + "px";
                    dstyle.height = o.paper.height + "px";
                    node.parentNode.insertBefore(div, node);
                    div.appendChild(node);
                    node.clipRect = div;
                }
            }
            if (!params["clip-rect"]) {
                node.clipRect && (node.clipRect.style.clip = "auto");
            }
        }
        if (o.textpath) {
            var textpathStyle = o.textpath.style;
            params.font && (textpathStyle.font = params.font);
            params["font-family"] && (textpathStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (textpathStyle.fontSize = params["font-size"]);
            params["font-weight"] && (textpathStyle.fontWeight = params["font-weight"]);
            params["font-style"] && (textpathStyle.fontStyle = params["font-style"]);
        }
        if ("arrow-start" in params) {
            addArrow(res, params["arrow-start"]);
        }
        if ("arrow-end" in params) {
            addArrow(res, params["arrow-end"], 1);
        }
        if (params.opacity != null || 
            params["stroke-width"] != null ||
            params.fill != null ||
            params.src != null ||
            params.stroke != null ||
            params["stroke-width"] != null ||
            params["stroke-opacity"] != null ||
            params["fill-opacity"] != null ||
            params["stroke-dasharray"] != null ||
            params["stroke-miterlimit"] != null ||
            params["stroke-linejoin"] != null ||
            params["stroke-linecap"] != null) {
            var fill = node.getElementsByTagName(fillString),
                newfill = false;
            fill = fill && fill[0];
            !fill && (newfill = fill = createNode(fillString));
            if (o.type == "image" && params.src) {
                fill.src = params.src;
            }
            params.fill && (fill.on = true);
            if (fill.on == null || params.fill == "none" || params.fill === null) {
                fill.on = false;
            }
            if (fill.on && params.fill) {
                var isURL = Str(params.fill).match(R._ISURL);
                if (isURL) {
                    fill.parentNode == node && node.removeChild(fill);
                    fill.rotate = true;
                    fill.src = isURL[1];
                    fill.type = "tile";
                    var bbox = o.getBBox(1);
                    fill.position = bbox.x + S + bbox.y;
                    o._.fillpos = [bbox.x, bbox.y];

                    R._preload(isURL[1], function () {
                        o._.fillsize = [this.offsetWidth, this.offsetHeight];
                    });
                } else {
                    fill.color = R.getRGB(params.fill).hex;
                    fill.src = E;
                    fill.type = "solid";
                    if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill, fill)) {
                        a.fill = "none";
                        a.gradient = params.fill;
                        fill.rotate = false;
                    }
                }
            }
            if ("fill-opacity" in params || "opacity" in params) {
                var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                opacity = mmin(mmax(opacity, 0), 1);
                fill.opacity = opacity;
                if (fill.src) {
                    fill.color = "none";
                }
            }
            node.appendChild(fill);
            var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
            newstroke = false;
            !stroke && (newstroke = stroke = createNode("stroke"));
            if ((params.stroke && params.stroke != "none") ||
                params["stroke-width"] ||
                params["stroke-opacity"] != null ||
                params["stroke-dasharray"] ||
                params["stroke-miterlimit"] ||
                params["stroke-linejoin"] ||
                params["stroke-linecap"]) {
                stroke.on = true;
            }
            (params.stroke == "none" || params.stroke === null || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
            var strokeColor = R.getRGB(params.stroke);
            stroke.on && params.stroke && (stroke.color = strokeColor.hex);
            opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
            var width = (toFloat(params["stroke-width"]) || 1) * .75;
            opacity = mmin(mmax(opacity, 0), 1);
            params["stroke-width"] == null && (width = a["stroke-width"]);
            params["stroke-width"] && (stroke.weight = width);
            width && width < 1 && (opacity *= width) && (stroke.weight = 1);
            stroke.opacity = opacity;
        
            params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
            stroke.miterlimit = params["stroke-miterlimit"] || 8;
            params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
            if (params["stroke-dasharray"]) {
                var dasharray = {
                    "-": "shortdash",
                    ".": "shortdot",
                    "-.": "shortdashdot",
                    "-..": "shortdashdotdot",
                    ". ": "dot",
                    "- ": "dash",
                    "--": "longdash",
                    "- .": "dashdot",
                    "--.": "longdashdot",
                    "--..": "longdashdotdot"
                };
                stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
            }
            newstroke && node.appendChild(stroke);
        }
        if (res.type == "text") {
            res.paper.canvas.style.display = E;
            var span = res.paper.span,
                m = 100,
                fontSize = a.font && a.font.match(/\d+(?:\.\d*)?(?=px)/);
            s = span.style;
            a.font && (s.font = a.font);
            a["font-family"] && (s.fontFamily = a["font-family"]);
            a["font-weight"] && (s.fontWeight = a["font-weight"]);
            a["font-style"] && (s.fontStyle = a["font-style"]);
            fontSize = toFloat(a["font-size"] || fontSize && fontSize[0]) || 10;
            s.fontSize = fontSize * m + "px";
            res.textpath.string && (span.innerHTML = Str(res.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
            var brect = span.getBoundingClientRect();
            res.W = a.w = (brect.right - brect.left) / m;
            res.H = a.h = (brect.bottom - brect.top) / m;
            // res.paper.canvas.style.display = "none";
            res.X = a.x;
            res.Y = a.y + res.H / 2;

            ("x" in params || "y" in params) && (res.path.v = R.format("m{0},{1}l{2},{1}", round(a.x * zoom), round(a.y * zoom), round(a.x * zoom) + 1));
            var dirtyattrs = ["x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size"];
            for (var d = 0, dd = dirtyattrs.length; d < dd; d++) if (dirtyattrs[d] in params) {
                res._.dirty = 1;
                break;
            }
        
            // text-anchor emulation
            switch (a["text-anchor"]) {
                case "start":
                    res.textpath.style["v-text-align"] = "left";
                    res.bbx = res.W / 2;
                break;
                case "end":
                    res.textpath.style["v-text-align"] = "right";
                    res.bbx = -res.W / 2;
                break;
                default:
                    res.textpath.style["v-text-align"] = "center";
                    res.bbx = 0;
                break;
            }
            res.textpath.style["v-text-kern"] = true;
        }
        // res.paper.canvas.style.display = E;
    },
    addGradientFill = function (o, gradient, fill) {
        o.attrs = o.attrs || {};
        var attrs = o.attrs,
            pow = Math.pow,
            opacity,
            oindex,
            type = "linear",
            fxfy = ".5 .5";
        o.attrs.gradient = gradient;
        gradient = Str(gradient).replace(R._radial_gradient, function (all, fx, fy) {
            type = "radial";
            if (fx && fy) {
                fx = toFloat(fx);
                fy = toFloat(fy);
                pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                fxfy = fx + S + fy;
            }
            return E;
        });
        gradient = gradient.split(/\s*\-\s*/);
        if (type == "linear") {
            var angle = gradient.shift();
            angle = -toFloat(angle);
            if (isNaN(angle)) {
                return null;
            }
        }
        var dots = R._parseDots(gradient);
        if (!dots) {
            return null;
        }
        o = o.shape || o.node;
        if (dots.length) {
            o.removeChild(fill);
            fill.on = true;
            fill.method = "none";
            fill.color = dots[0].color;
            fill.color2 = dots[dots.length - 1].color;
            var clrs = [];
            for (var i = 0, ii = dots.length; i < ii; i++) {
                dots[i].offset && clrs.push(dots[i].offset + S + dots[i].color);
            }
            fill.colors = clrs.length ? clrs.join() : "0% " + fill.color;
            if (type == "radial") {
                fill.type = "gradientTitle";
                fill.focus = "100%";
                fill.focussize = "0 0";
                fill.focusposition = fxfy;
                fill.angle = 0;
            } else {
                // fill.rotate= true;
                fill.type = "gradient";
                fill.angle = (270 - angle) % 360;
            }
            o.appendChild(fill);
        }
        return 1;
    },
    Element = function (node, vml) {
        this[0] = this.node = node;
        node.raphael = true;
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.X = 0;
        this.Y = 0;
        this.attrs = {};
        this.paper = vml;
        this.matrix = R.matrix();
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            dx: 0,
            dy: 0,
            deg: 0,
            dirty: 1,
            dirtyT: 1
        };
        !vml.bottom && (vml.bottom = this);
        this.prev = vml.top;
        vml.top && (vml.top.next = this);
        vml.top = this;
        this.next = null;
    };
    var elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;
    elproto.transform = function (tstr) {
        if (tstr == null) {
            return this._.transform;
        }
        var vbs = this.paper._viewBoxShift,
            vbt = vbs ? "s" + [vbs.scale, vbs.scale] + "-1-1t" + [vbs.dx, vbs.dy] : E,
            oldt;
        if (vbs) {
            oldt = tstr = Str(tstr).replace(/\.{3}|\u2026/g, this._.transform || E);
        }
        R._extractTransform(this, vbt + tstr);
        var matrix = this.matrix.clone(),
            skew = this.skew,
            o = this.node,
            split,
            isGrad = ~Str(this.attrs.fill).indexOf("-"),
            isPatt = !Str(this.attrs.fill).indexOf("url(");
        matrix.translate(-.5, -.5);
        if (isPatt || isGrad || this.type == "image") {
            skew.matrix = "1 0 0 1";
            skew.offset = "0 0";
            split = matrix.split();
            if ((isGrad && split.noRotation) || !split.isSimple) {
                o.style.filter = matrix.toFilter();
                var bb = this.getBBox(),
                    bbt = this.getBBox(1),
                    dx = bb.x - bbt.x,
                    dy = bb.y - bbt.y;
                o.coordorigin = (dx * -zoom) + S + (dy * -zoom);
                setCoords(this, 1, 1, dx, dy, 0);
            } else {
                o.style.filter = E;
                setCoords(this, split.scalex, split.scaley, split.dx, split.dy, split.rotate);
            }
        } else {
            o.style.filter = E;
            skew.matrix = Str(matrix);
            skew.offset = matrix.offset();
        }
        oldt && (this._.transform = oldt);
        return this;
    };
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (deg == null) {
            return;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this._.dirtyT = 1;
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        if (this._.bbox) {
            this._.bbox.x += dx;
            this._.bbox.y += dy;
        }
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
            isNaN(cx) && (cx = null);
            isNaN(cy) && (cy = null);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
    
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        this._.dirtyT = 1;
        return this;
    };
    elproto.hide = function () {
        !this.removed && (this.node.style.display = "none");
        return this;
    };
    elproto.show = function () {
        !this.removed && (this.node.style.display = E);
        return this;
    };
    elproto._getBBox = function () {
        if (this.removed) {
            return {};
        }
        return {
            x: this.X + (this.bbx || 0) - this.W / 2,
            y: this.Y - this.H,
            width: this.W,
            height: this.H
        };
    };
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        this.paper.__set__ && this.paper.__set__.exclude(this);
        R.eve.unbind("raphael.*.*." + this.id);
        R._tear(this, this.paper);
        this.node.parentNode.removeChild(this.node);
        this.shape && this.shape.parentNode.removeChild(this.shape);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (this.attrs && value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        var params;
        if (value != null) {
            params = {};
            params[name] = value;
        }
        value == null && R.is(name, "object") && (params = name);
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        if (params) {
            for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            // this.paper.canvas.style.display = "none";
            if (params.text && this.type == "text") {
                this.textpath.string = params.text;
            }
            setFillAndStroke(this, params);
            // this.paper.canvas.style.display = E;
        }
        return this;
    };
    elproto.toFront = function () {
        !this.removed && this.node.parentNode.appendChild(this.node);
        this.paper && this.paper.top != this && R._tofront(this, this.paper);
        return this;
    };
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.firstChild != this.node) {
            this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
            R._toback(this, this.paper);
        }
        return this;
    };
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        if (element.constructor == R.st.constructor) {
            element = element[element.length - 1];
        }
        if (element.node.nextSibling) {
            element.node.parentNode.insertBefore(this.node, element.node.nextSibling);
        } else {
            element.node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        if (element.constructor == R.st.constructor) {
            element = element[0];
        }
        element.node.parentNode.insertBefore(this.node, element.node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        var s = this.node.runtimeStyle,
            f = s.filter;
        f = f.replace(blurregexp, E);
        if (+size !== 0) {
            this.attrs.blur = size;
            s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
            s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
        } else {
            s.filter = f;
            s.margin = 0;
            delete this.attrs.blur;
        }
        return this;
    };

    R._engine.path = function (pathString, vml) {
        var el = createNode("shape");
        el.style.cssText = cssDot;
        el.coordsize = zoom + S + zoom;
        el.coordorigin = vml.coordorigin;
        var p = new Element(el, vml),
            attr = {fill: "none", stroke: "#000"};
        pathString && (attr.path = pathString);
        p.type = "path";
        p.path = [];
        p.Path = E;
        setFillAndStroke(p, attr);
        vml.canvas.appendChild(el);
        var skew = createNode("skew");
        skew.on = true;
        el.appendChild(skew);
        p.skew = skew;
        p.transform(E);
        return p;
    };
    R._engine.rect = function (vml, x, y, w, h, r) {
        var path = R._rectPath(x, y, w, h, r),
            res = vml.path(path),
            a = res.attrs;
        res.X = a.x = x;
        res.Y = a.y = y;
        res.W = a.width = w;
        res.H = a.height = h;
        a.r = r;
        a.path = path;
        res.type = "rect";
        return res;
    };
    R._engine.ellipse = function (vml, x, y, rx, ry) {
        var res = vml.path(),
            a = res.attrs;
        res.X = x - rx;
        res.Y = y - ry;
        res.W = rx * 2;
        res.H = ry * 2;
        res.type = "ellipse";
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            rx: rx,
            ry: ry
        });
        return res;
    };
    R._engine.circle = function (vml, x, y, r) {
        var res = vml.path(),
            a = res.attrs;
        res.X = x - r;
        res.Y = y - r;
        res.W = res.H = r * 2;
        res.type = "circle";
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            r: r
        });
        return res;
    };
    R._engine.image = function (vml, src, x, y, w, h) {
        var path = R._rectPath(x, y, w, h),
            res = vml.path(path).attr({stroke: "none"}),
            a = res.attrs,
            node = res.node,
            fill = node.getElementsByTagName(fillString)[0];
        a.src = src;
        res.X = a.x = x;
        res.Y = a.y = y;
        res.W = a.width = w;
        res.H = a.height = h;
        a.path = path;
        res.type = "image";
        fill.parentNode == node && node.removeChild(fill);
        fill.rotate = true;
        fill.src = src;
        fill.type = "tile";
        res._.fillpos = [x, y];
        res._.fillsize = [w, h];
        node.appendChild(fill);
        setCoords(res, 1, 1, 0, 0, 0);
        return res;
    };
    R._engine.text = function (vml, x, y, text) {
        var el = createNode("shape"),
            path = createNode("path"),
            o = createNode("textpath");
        x = x || 0;
        y = y || 0;
        text = text || "";
        path.v = R.format("m{0},{1}l{2},{1}", round(x * zoom), round(y * zoom), round(x * zoom) + 1);
        path.textpathok = true;
        o.string = Str(text);
        o.on = true;
        el.style.cssText = cssDot;
        el.coordsize = zoom + S + zoom;
        el.coordorigin = "0 0";
        var p = new Element(el, vml),
            attr = {
                fill: "#000",
                stroke: "none",
                font: R._availableAttrs.font,
                text: text
            };
        p.shape = el;
        p.path = path;
        p.textpath = o;
        p.type = "text";
        p.attrs.text = Str(text);
        p.attrs.x = x;
        p.attrs.y = y;
        p.attrs.w = 1;
        p.attrs.h = 1;
        setFillAndStroke(p, attr);
        el.appendChild(o);
        el.appendChild(path);
        vml.canvas.appendChild(el);
        var skew = createNode("skew");
        skew.on = true;
        el.appendChild(skew);
        p.skew = skew;
        p.transform(E);
        return p;
    };
    R._engine.setSize = function (width, height) {
        var cs = this.canvas.style;
        this.width = width;
        this.height = height;
        width == +width && (width += "px");
        height == +height && (height += "px");
        cs.width = width;
        cs.height = height;
        cs.clip = "rect(0 " + width + " " + height + " 0)";
        if (this._viewBox) {
            R._engine.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        R.eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var width = this.width,
            height = this.height,
            size = 1 / mmax(w / width, h / height),
            H, W;
        if (fit) {
            H = height / h;
            W = width / w;
            if (w * H < width) {
                x -= (width - w * H) / 2 / H;
            }
            if (h * W < height) {
                y -= (height - h * W) / 2 / W;
            }
        }
        this._viewBox = [x, y, w, h, !!fit];
        this._viewBoxShift = {
            dx: -x,
            dy: -y,
            scale: size
        };
        this.forEach(function (el) {
            el.transform("...");
        });
        return this;
    };
    var createNode;
    R._engine.initWin = function (win) {
            var doc = win.document;
            doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
            try {
                !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                createNode = function (tagName) {
                    return doc.createElement('<rvml:' + tagName + ' class="rvml">');
                };
            } catch (e) {
                createNode = function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
                };
            }
        };
    R._engine.initWin(R._g.win);
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con.container,
            height = con.height,
            s,
            width = con.width,
            x = con.x,
            y = con.y;
        if (!container) {
            throw new Error("VML container not found.");
        }
        var res = new R._Paper,
            c = res.canvas = R._g.doc.createElement("div"),
            cs = c.style;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        res.width = width;
        res.height = height;
        width == +width && (width += "px");
        height == +height && (height += "px");
        res.coordsize = zoom * 1e3 + S + zoom * 1e3;
        res.coordorigin = "0 0";
        res.span = R._g.doc.createElement("span");
        res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;";
        c.appendChild(res.span);
        cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
        if (container == 1) {
            R._g.doc.body.appendChild(c);
            cs.left = x + "px";
            cs.top = y + "px";
            cs.position = "absolute";
        } else {
            if (container.firstChild) {
                container.insertBefore(c, container.firstChild);
            } else {
                container.appendChild(c);
            }
        }
        res.renderfix = function () {};
        return res;
    };
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        this.canvas.innerHTML = E;
        this.span = R._g.doc.createElement("span");
        this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
        this.canvas.appendChild(this.span);
        this.bottom = this.top = null;
    };
    R.prototype.remove = function () {
        R.eve("raphael.remove", this);
        this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        return true;
    };

    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
})();

    // EXPOSE
    // SVG and VML are appended just before the EXPOSE line
    // Even with AMD, Raphael should be defined globally
    oldRaphael.was ? (g.win.Raphael = R) : (Raphael = R);

    return R;
}));




// moment.js
// version : 2.0.0
// author : Tim Wood
// license : MIT
// momentjs.com

(function (undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "2.0.0",
        round = Math.round, i,
        // internal storage for language config files
        languages = {},

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing tokens
        parseMultipleFormatChunker = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenWord = /[0-9]*[a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF]+\s*?[\u0600-\u06FF]+/i, // any word (or two) characters or numbers including two word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO seperator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

        // preliminary iso regex
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
        isoRegex = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.S', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        // format function strings
        formatFunctions = {},

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.lang().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.lang().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return ~~(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(~~(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(a / 60), 2) + ":" + leftZeroFill(~~a % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(10 * a / 6), 4);
            },
            X    : function () {
                return this.unix();
            }
        };

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func) {
        return function (a) {
            return this.lang().ordinal(func.call(this, a));
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i]);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Language() {

    }

    // Moment prototype object
    function Moment(config) {
        extend(this, config);
    }

    // Duration Constructor
    function Duration(duration) {
        var data = this._data = {},
            years = duration.years || duration.year || duration.y || 0,
            months = duration.months || duration.month || duration.M || 0,
            weeks = duration.weeks || duration.week || duration.w || 0,
            days = duration.days || duration.day || duration.d || 0,
            hours = duration.hours || duration.hour || duration.h || 0,
            minutes = duration.minutes || duration.minute || duration.m || 0,
            seconds = duration.seconds || duration.second || duration.s || 0,
            milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;

        // representation for dateAddRemove
        this._milliseconds = milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = months +
            years * 12;

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;
        seconds += absRound(milliseconds / 1000);

        data.seconds = seconds % 60;
        minutes += absRound(seconds / 60);

        data.minutes = minutes % 60;
        hours += absRound(minutes / 60);

        data.hours = hours % 24;
        days += absRound(hours / 24);

        days += weeks * 7;
        data.days = days % 30;

        months += absRound(days / 30);

        data.months = months % 12;
        years += absRound(months / 12);

        data.years = years;
    }


    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }
        return a;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding) {
        var ms = duration._milliseconds,
            d = duration._days,
            M = duration._months,
            currentDate;

        if (ms) {
            mom._d.setTime(+mom + ms * isAdding);
        }
        if (d) {
            mom.date(mom.date() + d * isAdding);
        }
        if (M) {
            currentDate = mom.date();
            mom.date(1)
                .month(mom.month() + M * isAdding)
                .date(Math.min(currentDate, mom.daysInMonth()));
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (~~array1[i] !== ~~array2[i]) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }


    /************************************
        Languages
    ************************************/


    Language.prototype = {
        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex, output;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        _longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },
        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal : "%d",

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy);
        },
        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        }
    };

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.
    function getLangDefinition(key) {
        if (!key) {
            return moment.fn._lang;
        }
        if (!languages[key] && hasModule) {
            require('./lang/' + key);
        }
        return languages[key];
    }


    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[.*\]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += typeof array[i].call === 'function' ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return m.lang().longDateFormat(input) || input;
        }

        while (i-- && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        }

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token) {
        switch (token) {
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
            return parseTokenFourDigits;
        case 'YYYYY':
            return parseTokenSixDigits;
        case 'S':
        case 'SS':
        case 'SSS':
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
        case 'a':
        case 'A':
            return parseTokenWord;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
            return parseTokenOneOrTwoDigits;
        default :
            return new RegExp(token.replace('\\', ''));
        }
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, b,
            datePartArray = config._a;

        switch (token) {
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            datePartArray[1] = (input == null) ? 0 : ~~input - 1;
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = getLangDefinition(config._l).monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[1] = a;
            } else {
                config._isValid = false;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DDDD
        case 'DD' : // fall through to DDDD
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                datePartArray[2] = ~~input;
            }
            break;
        // YEAR
        case 'YY' :
            datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);
            break;
        case 'YYYY' :
        case 'YYYYY' :
            datePartArray[0] = ~~input;
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = ((input + '').toLowerCase() === 'pm');
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[3] = ~~input;
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[4] = ~~input;
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[5] = ~~input;
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
            datePartArray[6] = ~~ (('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            a = (input + '').match(parseTimezoneChunker);
            if (a && a[1]) {
                config._tzh = ~~a[1];
            }
            if (a && a[2]) {
                config._tzm = ~~a[2];
            }
            // reverse offsets
            if (a && a[0] === '+') {
                config._tzh = -config._tzh;
                config._tzm = -config._tzm;
            }
            break;
        }

        // if the input is null, the date is not valid
        if (input == null) {
            config._isValid = false;
        }
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromArray(config) {
        var i, date, input = [];

        if (config._d) {
            return;
        }

        for (i = 0; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid
        input[3] += config._tzh || 0;
        input[4] += config._tzm || 0;

        date = new Date(0);

        if (config._useUTC) {
            date.setUTCFullYear(input[0], input[1], input[2]);
            date.setUTCHours(input[3], input[4], input[5], input[6]);
        } else {
            date.setFullYear(input[0], input[1], input[2]);
            date.setHours(input[3], input[4], input[5], input[6]);
        }

        config._d = date;
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var tokens = config._f.match(formattingTokens),
            string = config._i,
            i, parsedInput;

        config._a = [];

        for (i = 0; i < tokens.length; i++) {
            parsedInput = (getParseRegexForToken(tokens[i]).exec(string) || [])[0];
            if (parsedInput) {
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            }
            // don't parse if its not a known token
            if (formatTokenFunctions[tokens[i]]) {
                addTimeToArrayFromToken(tokens[i], parsedInput, config);
            }
        }
        // handle am pm
        if (config._isPm && config._a[3] < 12) {
            config._a[3] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[3] === 12) {
            config._a[3] = 0;
        }
        // return
        dateFromArray(config);
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            tempMoment,
            bestMoment,

            scoreToBeat = 99,
            i,
            currentDate,
            currentScore;

        while (config._f.length) {
            tempConfig = extend({}, config);
            tempConfig._f = config._f.pop();
            makeDateFromStringAndFormat(tempConfig);
            tempMoment = new Moment(tempConfig);

            if (tempMoment.isValid()) {
                bestMoment = tempMoment;
                break;
            }

            currentScore = compareArrays(tempConfig._a, tempMoment.toArray());

            if (currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempMoment;
            }
        }

        extend(config, bestMoment);
    }

    // date from iso format
    function makeDateFromString(config) {
        var i,
            string = config._i;
        if (isoRegex.exec(string)) {
            config._f = 'YYYY-MM-DDT';
            for (i = 0; i < 4; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (parseTokenTimezone.exec(string)) {
                config._f += " Z";
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._d = new Date(string);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);

        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromArray(config);
        } else {
            config._d = input instanceof Date ? new Date(+input) : new Date(input);
        }
    }


    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        return Math.ceil(moment(mom).add('d', daysToDayOfWeek).dayOfYear() / 7);
    }


    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        if (input === null || input === '') {
            return null;
        }

        if (typeof input === 'string') {
            config._i = input = getLangDefinition().preparse(input);
        }

        if (moment.isMoment(input)) {
            config = extend({}, input);
            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, lang) {
        return makeMoment({
            _i : input,
            _f : format,
            _l : lang,
            _isUTC : false
        });
    };

    // creating with utc
    moment.utc = function (input, format, lang) {
        return makeMoment({
            _useUTC : true,
            _isUTC : true,
            _l : lang,
            _i : input,
            _f : format
        });
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var isDuration = moment.isDuration(input),
            isNumber = (typeof input === 'number'),
            duration = (isDuration ? input._data : (isNumber ? {} : input)),
            ret;

        if (isNumber) {
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        }

        ret = new Duration(duration);

        if (isDuration && input.hasOwnProperty('_lang')) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var i;

        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(key, values);
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
    };

    // returns language data
    moment.langData = function (key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment;
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };


    /************************************
        Moment Prototype
    ************************************/


    moment.fn = Moment.prototype = {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d;
        },

        unix : function () {
            return Math.floor(+this._d / 1000);
        },

        toString : function () {
            return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate : function () {
            return this._d;
        },

        toJSON : function () {
            return moment.utc(this).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            if (this._isValid == null) {
                if (this._a) {
                    this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());
                } else {
                    this._isValid = !isNaN(this._d.getTime());
                }
            }
            return !!this._isValid;
        },

        utc : function () {
            this._isUTC = true;
            return this;
        },

        local : function () {
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },

        add : function (input, val) {
            var dur;
            // switch args to support add('s', 1) and add(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur;
            // switch args to support subtract('s', 1) and subtract(1, 's')
            if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, units, asFloat) {
            var that = this._isUTC ? moment(input).utc() : moment(input).local(),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            if (units) {
                // standardize on singular form
                units = units.replace(/s$/, '');
            }

            if (units === 'year' || units === 'month') {
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                output += ((this - moment(this).startOf('month')) - (that - moment(that).startOf('month'))) / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that) - zoneDiff;
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                    units === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            var diff = this.diff(moment().startOf('day'), 'days', true),
                format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.lang().calendar(format, this));
        },

        isLeapYear : function () {
            var year = this.year();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        isDST : function () {
            return (this.zone() < moment([this.year()]).zone() ||
                this.zone() < moment([this.year(), 5]).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            return input == null ? day :
                this.add({ d : input - day });
        },

        startOf: function (units) {
            units = units.replace(/s$/, '');
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.day(0);
            }

            return this;
        },

        endOf: function (units) {
            return this.startOf(units).add(units.replace(/s?$/, 's'), 1).subtract('ms', 1);
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) === +moment(input).startOf(units);
        },

        zone : function () {
            return this._isUTC ? 0 : this._d.getTimezoneOffset();
        },

        daysInMonth : function () {
            return moment.utc([this.year(), this.month() + 1, 0]).date();
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        week : function (input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    };

    // helper for adding shortcuts
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = moment.fn[name + 's'] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;

    /************************************
        Duration Prototype
    ************************************/


    moment.duration.fn = Duration.prototype = {
        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              this._months * 2592e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }

            return this.lang().postformat(output);
        },

        lang : moment.fn.lang
    };

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);


    /************************************
        Default Lang
    ************************************/


    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });


    /************************************
        Exposing Moment
    ************************************/


    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    }
    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['moment'] = moment;
    }
    /*global define:false */
    if (typeof define === "function" && define.amd) {
        define("moment", [], function () {
            return moment;
        });
    }
}).call(this);




/*
 * Polychart.js
 * Copyright (c) Polychart Inc
 * All Rights Reserved
 */
window.polyjs = (function(polyjs) {
  if (!polyjs) {
    var poly = {};

// Generated by CoffeeScript 1.6.2
/*
Group an array of data items by the value of certain columns.

Input:
- `data`: an array of data items
- `group`: an array of column keys, to group by
Output:
- an associate array of key: array of data, with the appropriate grouping
  the `key` is a string of format "columnKey:value;colunmKey2:value2;..."
*/


(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  poly.groupBy = function(data, group) {
    return _.groupBy(data, poly.stringify(group));
  };

  poly.stringify = function(group) {
    return function(item) {
      var concat;

      concat = function(memo, g) {
        return "" + memo + g + ":" + item[g] + ";";
      };
      return _.reduce(group, concat, "");
    };
  };

  poly.cross = function(keyVals, ignore) {
    var arrs, i, item, items, next, todo, val, _i, _j, _len, _len1, _ref;

    if (ignore == null) {
      ignore = [];
    }
    todo = _.difference(_.keys(keyVals), ignore);
    if (todo.length === 0) {
      return [{}];
    }
    arrs = [];
    next = todo[0];
    items = poly.cross(keyVals, ignore.concat(next));
    _ref = keyVals[next];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      val = _ref[_i];
      for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
        item = items[_j];
        i = _.clone(item);
        i[next] = val;
        arrs.push(i);
      }
    }
    return arrs;
  };

  poly.filter = function(statData, key, val) {
    var item, newData, _i, _len;

    newData = [];
    for (_i = 0, _len = statData.length; _i < _len; _i++) {
      item = statData[_i];
      if (item[key] === val) {
        newData.push(item);
      }
    }
    return newData;
  };

  /*
  Intersets values when filter key is common to both objects, add all values otherwise.
  
    TODO: handle the case when no intersection exist from a given common key
  */


  poly.intersect = function(filter1, filter2) {
    var intersectIneq, intersectList, key, newFilter, val;

    intersectList = function(key) {
      var elem, newList, _i, _len, _ref;

      newList = [];
      _ref = filter1[key]["in"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        if (__indexOf.call(filter2[key]["in"], elem) >= 0) {
          newList.push(elem);
        }
      }
      return {
        "in": newList
      };
    };
    intersectIneq = function(key) {
      var addbound, getLowerBound, getUpperBound, lowers, newIneq, type, uppers, val, _ref, _ref1;

      getUpperBound = function(filter) {
        if (filter[key].lt) {
          return {
            type: "lt",
            val: filter[key].lt
          };
        } else if (filter[key].le) {
          return {
            type: "le",
            val: filter[key].le
          };
        } else {
          return {
            type: null,
            val: null
          };
        }
      };
      getLowerBound = function(filter) {
        if (filter[key].gt) {
          return {
            type: "gt",
            val: filter[key].gt
          };
        } else if (filter[key].ge) {
          return {
            type: "ge",
            val: filter[key].ge
          };
        } else {
          return {
            type: null,
            val: null
          };
        }
      };
      addbound = function(bound) {
        return newIneq[bound.type] = bound.val;
      };
      lowers = [getLowerBound(filter1), getLowerBound(filter2)];
      uppers = [getUpperBound(filter1), getUpperBound(filter2)];
      lowers.sort(function(a, b) {
        return b.val - a.val;
      });
      uppers.sort(function(a, b) {
        return a.val - b.val;
      });
      newIneq = {};
      if (lowers[0].type && lowers[0].val) {
        _ref = lowers[0], type = _ref.type, val = _ref.val;
        if (lowers[0].val === lowers[1].val && lowers[0].type !== lowers[1].type) {
          type = "lt";
        }
        newIneq[type] = val;
      }
      if (uppers[0].type && uppers[0].val) {
        _ref1 = uppers[0], type = _ref1.type, val = _ref1.val;
        if (uppers[0].val === uppers[1].val && uppers[0].type !== uppers[1].type) {
          type = "lt";
        }
        newIneq[type] = val;
      }
      if (lowers[0].type && uppers[0].type) {
        if (lowers[0].val > uppers[0].val || (lowers[0].val === uppers[0].val && (lowers[0].key === "lt" || uppers[0].key === "gt"))) {
          throw "No intersection found!";
        }
      }
      return newIneq;
    };
    newFilter = {};
    for (key in filter1) {
      val = filter1[key];
      if (key in filter2) {
        if ("in" in filter1[key]) {
          newFilter[key] = intersectList(key);
        } else {
          newFilter[key] = intersectIneq(key);
        }
      } else {
        newFilter[key] = val;
      }
    }
    for (key in filter2) {
      val = filter2[key];
      if (!(key in newFilter)) {
        newFilter[key] = val;
      }
    }
    return newFilter;
  };

  /*
  Produces a linear function that passes through two points.
  Input:
  - `x1`: x coordinate of the first point
  - `y1`: y coordinate of the first point
  - `x2`: x coordinate of the second point
  - `y2`: y coordinate of the second point
  Output:
  - A function that, given the x-coord, returns the y-coord
  */


  poly.linear = function(x1, y1, x2, y2) {
    if (_.isFinite(x1) && _.isFinite(y1) && _.isFinite(x2) && _.isFinite(y2)) {
      return function(x) {
        return (y2 - y1) / (x2 - x1) * (x - x1) + y1;
      };
    } else {
      throw poly.error.input("Attempting to create linear function from infinity");
    }
  };

  /*
  given a sorted list and a midpoint calculate the median
  */


  poly.median = function(values, sorted) {
    var mid;

    if (sorted == null) {
      sorted = false;
    }
    if (!sorted) {
      values = _.sortBy(values, function(x) {
        return x;
      });
    }
    mid = values.length / 2;
    if (mid % 1 !== 0) {
      return values[Math.floor(mid)];
    }
    return (values[mid - 1] + values[mid]) / 2;
  };

  /*
  Produces a function that counts how many times it has been called
  */


  poly.counter = function() {
    var i;

    i = 0;
    return function() {
      return i++;
    };
  };

  /*
  Sample an associate array (object)
  */


  poly.sample = function(assoc, num) {
    return _.pick(assoc, _.shuffle(_.keys(assoc)).splice(0, num));
  };

  /*
  Given an OLD array and NEW array, split the points in (OLD union NEW) into
  three sets:
    - deleted
    - kept
    - added
  */


  poly.compare = function(oldarr, newarr) {
    var added, deleted, kept, newElem, newIndex, oldElem, oldIndex, sortedNewarr, sortedOldarr;

    sortedOldarr = _.sortBy(oldarr, function(x) {
      return x;
    });
    sortedNewarr = _.sortBy(newarr, function(x) {
      return x;
    });
    deleted = [];
    kept = [];
    added = [];
    oldIndex = newIndex = 0;
    while (oldIndex < sortedOldarr.length || newIndex < sortedNewarr.length) {
      oldElem = sortedOldarr[oldIndex];
      newElem = sortedNewarr[newIndex];
      if (oldIndex >= sortedOldarr.length) {
        added.push(newElem);
        newIndex += 1;
      } else if (newIndex >= sortedNewarr.length) {
        deleted.push(oldElem);
        oldIndex += 1;
      } else if (oldElem < newElem) {
        deleted.push(oldElem);
        oldIndex += 1;
      } else if (oldElem > newElem) {
        added.push(newElem);
        newIndex += 1;
      } else if (oldElem === newElem) {
        kept.push(oldElem);
        oldIndex += 1;
        newIndex += 1;
      } else {
        throw DataError("Unknown data encounted");
      }
    }
    return {
      deleted: deleted,
      kept: kept,
      added: added
    };
  };

  /*
  Given an aesthetic mapping in the "geom" object, flatten it and extract only
  the values from it. This is so that even if a compound object is encoded in an
  aestehtic, we have the correct set of values to calculate the min/max.
  */


  poly.flatten = function(values) {
    var flat, k, v, _i, _len;

    flat = [];
    if (values != null) {
      if (_.isObject(values)) {
        if (values.t === 'scalefn') {
          if (values.f !== 'novalue') {
            flat.push(values.v);
          }
        } else {
          for (k in values) {
            v = values[k];
            flat = flat.concat(poly.flatten(v));
          }
        }
      } else if (_.isArray(values)) {
        for (_i = 0, _len = values.length; _i < _len; _i++) {
          v = values[_i];
          flat = flat.concat(poly.flatten(v));
        }
      } else {
        flat.push(values);
      }
    }
    return flat;
  };

  /*
  GET LABEL
  TODO: move somewhere else and allow overwrite by user
  */


  poly.getLabel = function(layers, aes) {
    return _.chain(layers).map(function(l) {
      return l.mapping[aes];
    }).without(null, void 0).uniq().value().join(' | ');
  };

  /*
  Estimate the number of pixels rendering this string would take...?
  */


  poly.strSize = function(str) {
    var len;

    len = (str + "").length;
    if (len < 10) {
      return len * 6;
    } else {
      return (len - 10) * 5 + 60;
    }
  };

  /*
  Sort Arrays: given a sorting function and some number of arrays, sort all the
  arrays by the function applied to the first array. This is used for sorting
  points for a line chart, i.e. poly.sortArrays(sortFn, [xs, ys])
  
  This way, all the points are sorted by (sortFn(x) for x in xs)
  */


  poly.sortArrays = function(fn, arrays) {
    var zipped;

    zipped = _.zip.apply(_, arrays);
    zipped.sort(function(a, b) {
      return fn(a[0], b[0]);
    });
    return _.zip.apply(_, zipped);
  };

  /*
  Determine if a value is not null and not undefined.
  */


  poly.isDefined = function(x) {
    if (_.isObject(x)) {
      if (x.t === 'scalefn' && x.f !== 'novalue') {
        return poly.isDefined(x.v);
      } else {
        return true;
      }
    } else {
      return x !== void 0 && x !== null && !(_.isNumber(x) && _.isNaN(x));
    }
  };

  /*
  Determine if a String is a valid URI
  http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
  */


  poly.isURI = function(str) {
    var pattern;

    if (!_.isString(str)) {
      return false;
    } else {
      pattern = new RegExp('^(https?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + '(\\?[;&a-z\\d%_.~+=-]*)?' + '(\\#[-a-z\\d_]*)?$', 'i');
      return pattern.test(str);
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
CONSTANTS
---------
These are constants that are referred to throughout the coebase
*/


(function() {
  poly["const"] = {
    aes: ['x', 'y', 'color', 'size', 'opacity', 'shape', 'id', 'text'],
    noDomain: ['id', 'text', 'tooltip'],
    noLegend: ['x', 'y', 'id', 'text', 'tooltip'],
    trans: {
      'bin': ['key', 'binwidth'],
      'lag': ['key', 'lag']
    },
    stat: {
      'count': ['key'],
      'unique': ['key'],
      'sum': ['key'],
      'mean': ['key'],
      'box': ['key'],
      'median': ['key']
    },
    timerange: ['second', 'minute', 'hour', 'day', 'week', 'month', 'twomonth', 'quarter', 'sixmonth', 'year', 'twoyear', 'fiveyear', 'decade'],
    metas: {
      sort: null,
      stat: null,
      limit: null,
      asc: false
    },
    scaleFns: {
      novalue: function() {
        return {
          v: null,
          f: 'novalue',
          t: 'scalefn'
        };
      },
      max: function(v) {
        return {
          v: v,
          f: 'max',
          t: 'scalefn'
        };
      },
      min: function(v) {
        return {
          v: v,
          f: 'min',
          t: 'scalefn'
        };
      },
      upper: function(v, n, m) {
        return {
          v: v,
          n: n,
          m: m,
          f: 'upper',
          t: 'scalefn'
        };
      },
      lower: function(v, n, m) {
        return {
          v: v,
          n: n,
          m: m,
          f: 'lower',
          t: 'scalefn'
        };
      },
      middle: function(v) {
        return {
          v: v,
          f: 'middle',
          t: 'scalefn'
        };
      },
      jitter: function(v) {
        return {
          v: v,
          f: 'jitter',
          t: 'scalefn'
        };
      },
      identity: function(v) {
        return {
          v: v,
          f: 'identity',
          t: 'scalefn'
        };
      }
    },
    epsilon: Math.pow(10, -7),
    defaults: {
      'x': {
        v: null,
        f: 'novalue',
        t: 'scalefn'
      },
      'y': {
        v: null,
        f: 'novalue',
        t: 'scalefn'
      },
      'color': 'steelblue',
      'size': 2,
      'opacity': 0.7
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
(function() {
  var DataError, DefinitionError, DependencyError, MissingData, ModeError, NotImplemented, ScaleError, Type, UnknownInput,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DefinitionError = (function(_super) {
    __extends(DefinitionError, _super);

    function DefinitionError(message) {
      this.message = message;
      this.name = "DefinitionError";
    }

    return DefinitionError;

  })(Error);

  DependencyError = (function(_super) {
    __extends(DependencyError, _super);

    function DependencyError(message) {
      this.message = message;
      this.name = "DependencyError";
    }

    return DependencyError;

  })(Error);

  ModeError = (function(_super) {
    __extends(ModeError, _super);

    function ModeError(message) {
      this.message = message;
      this.name = "ModeError";
    }

    return ModeError;

  })(Error);

  DataError = (function(_super) {
    __extends(DataError, _super);

    function DataError(message) {
      this.message = message;
      this.name = "DataError";
    }

    return DataError;

  })(Error);

  UnknownInput = (function(_super) {
    __extends(UnknownInput, _super);

    function UnknownInput(message) {
      this.message = message;
      this.name = "UnknownInput";
    }

    return UnknownInput;

  })(Error);

  NotImplemented = (function(_super) {
    __extends(NotImplemented, _super);

    function NotImplemented(message) {
      this.message = message;
      this.name = "ModeError";
    }

    return NotImplemented;

  })(Error);

  ScaleError = (function(_super) {
    __extends(ScaleError, _super);

    function ScaleError(message) {
      this.message = message;
      this.name = "ScaleError";
    }

    return ScaleError;

  })(Error);

  MissingData = (function(_super) {
    __extends(MissingData, _super);

    function MissingData(message) {
      this.message = message;
      this.name = "MissingData";
    }

    return MissingData;

  })(Error);

  Type = (function(_super) {
    __extends(Type, _super);

    function Type(message) {
      this.message = message;
      this.name = "Type";
    }

    return Type;

  })(Error);

  poly.error = function(msg) {
    return new Error(msg);
  };

  poly.error.data = function(msg) {
    return new DataError(msg);
  };

  poly.error.depn = function(msg) {
    return new DependencyError(msg);
  };

  poly.error.defn = function(msg) {
    return new DefinitionError(msg);
  };

  poly.error.mode = function(msg) {
    return new ModeError(msg);
  };

  poly.error.impl = function(msg) {
    return new NotImplemented(msg);
  };

  poly.error.input = function(msg) {
    return new UnknownInput(msg);
  };

  poly.error.scale = function(msg) {
    return new ScaleError(msg);
  };

  poly.error.missing = function(msg) {
    return new MissingData(msg);
  };

  poly.error.type = function(msg) {
    return new Type(msg);
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Abstract Classes
---------
Abstract classes, almost used like interfaces throughout the codebase
*/


(function() {
  var Geometry, Guide, GuideSet, Renderable, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Renderable = (function() {
    function Renderable() {}

    Renderable.prototype.render = function() {
      return poly.error.impl();
    };

    Renderable.prototype.dispose = function() {
      return poly.error.impl();
    };

    return Renderable;

  })();

  Guide = (function(_super) {
    __extends(Guide, _super);

    function Guide() {
      _ref = Guide.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Guide.prototype.getDimension = function() {
      throw poly.error.impl();
    };

    return Guide;

  })(Renderable);

  GuideSet = (function(_super) {
    __extends(GuideSet, _super);

    function GuideSet() {
      _ref1 = GuideSet.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    GuideSet.prototype.getDimension = function() {
      throw poly.error.impl();
    };

    GuideSet.prototype.make = function() {
      throw poly.error.impl();
    };

    return GuideSet;

  })(Renderable);

  /*
  This should probably be in its own class folder, and should technically
  be named "Renderable", but whatever. It manages what is currently on the
  screen, and what needs to be rendered.
    @geoms : a key-value pair of an identifier to a group of objects to be
             rendered. It should be of the following form:
              @geoms = {
                'id' : {
                  marks: {
                    # an assoc array of renderable "marks", acceptable by 
                    # poly.render() function
                  },
                  evtData: {
                    # data bound to a click/mouseover/mouseout event
                    # on the marks plotted
                  },
                  tooltip: # tooltip text to show on mouseover
                }
              }
    @pts   : a key-value pair of identfier to a group of objects rendered.
             the group of objects is also a key-value pair, corresponding
             to the key-value pair provided by `marks` as above.
  */


  Geometry = (function(_super) {
    __extends(Geometry, _super);

    function Geometry(type) {
      this.type = type != null ? type : null;
      this.dispose = __bind(this.dispose, this);
      this.geoms = {};
      this.pts = {};
    }

    Geometry.prototype.set = function(geoms) {
      return this.geoms = geoms;
    };

    Geometry.prototype.render = function(renderer) {
      var added, deleted, id, kept, newpts, _i, _j, _k, _len, _len1, _len2, _ref2;

      newpts = {};
      _ref2 = poly.compare(_.keys(this.pts), _.keys(this.geoms)), deleted = _ref2.deleted, kept = _ref2.kept, added = _ref2.added;
      for (_i = 0, _len = deleted.length; _i < _len; _i++) {
        id = deleted[_i];
        this._delete(renderer, this.pts[id]);
      }
      for (_j = 0, _len1 = added.length; _j < _len1; _j++) {
        id = added[_j];
        newpts[id] = this._add(renderer, this.geoms[id]);
      }
      for (_k = 0, _len2 = kept.length; _k < _len2; _k++) {
        id = kept[_k];
        newpts[id] = this._modify(renderer, this.pts[id], this.geoms[id]);
      }
      return this.pts = newpts;
    };

    Geometry.prototype._delete = function(renderer, points) {
      var id2, pt, _results;

      _results = [];
      for (id2 in points) {
        pt = points[id2];
        _results.push(renderer.remove(pt));
      }
      return _results;
    };

    Geometry.prototype._modify = function(renderer, points, geom) {
      var error, id2, mark, objs, _ref2;

      objs = {};
      _ref2 = geom.marks;
      for (id2 in _ref2) {
        mark = _ref2[id2];
        try {
          objs[id2] = points[id2] ? points[id2].data('m').type === mark.type ? renderer.animate(points[id2], mark, geom.evtData, geom.tooltip) : (renderer.remove(points[id2]), renderer.add(mark, geom.evtData, geom.tooltip, this.type)) : renderer.add(mark, geom.evtData, geom.tooltip, this.type);
        } catch (_error) {
          error = _error;
          if (error.name === 'MissingData') {
            console.log(error.message);
          } else {
            throw error;
          }
        }
      }
      return objs;
    };

    Geometry.prototype._add = function(renderer, geom) {
      var error, id2, mark, objs, _ref2;

      objs = {};
      _ref2 = geom.marks;
      for (id2 in _ref2) {
        mark = _ref2[id2];
        try {
          objs[id2] = renderer.add(mark, geom.evtData, geom.tooltip, this.type);
        } catch (_error) {
          error = _error;
          if (error.name === 'MissingData') {
            console.log(error.message);
          } else {
            throw error;
          }
        }
      }
      return objs;
    };

    Geometry.prototype.dispose = function(renderer) {
      var id, pt, _ref2;

      _ref2 = this.pts;
      for (id in _ref2) {
        pt = _ref2[id];
        this._delete(renderer, pt);
      }
      return this.pts = {};
    };

    return Geometry;

  })(Renderable);

  poly.Renderable = Renderable;

  poly.Guide = Guide;

  poly.GuideSet = GuideSet;

  poly.Geometry = Geometry;

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Get the offset of the element
*/


(function() {
  var touchInfo, _oldAlert,
    _this = this;

  poly.offset = function(elem) {
    var box, doc, docElem, win;

    box = {
      top: 0,
      left: 0
    };
    doc = elem && elem.ownerDocument;
    if (!doc) {
      return;
    }
    docElem = doc.documentElement;
    if (typeof elem.getBoundingClientRect !== "undefined") {
      box = elem.getBoundingClientRect();
    }
    win = doc !== null && doc === doc.window ? doc : doc.nodeType === 9 && doc.defaultView;
    return {
      top: box.top + win.pageYOffset - docElem.clientTop,
      left: box.left + win.pageXOffset - docElem.clientLeft
    };
  };

  /*
  Get the raphael (x,y) position of a mouse event
  */


  poly.getXY = function(offset, e) {
    var scrollX, scrollY, touch, x, y;

    if (e.type.indexOf('mouse') !== -1) {
      x = e.clientX;
      y = e.clientY;
    } else if (e.type.indexOf('touch') !== -1) {
      touch = e.changedTouches[0];
      x = touch.clientX;
      y = touch.clientY;
    }
    scrollY = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    scrollX = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
    return {
      x: x + scrollX - offset.left,
      y: y + scrollY - offset.top
    };
  };

  /*
  Transforms a TouchEvent to MouseEvent
  */


  poly.touchToMouse = function(type, touchInfo, delay) {
    var event, evt, first;

    if (delay == null) {
      delay = false;
    }
    event = touchInfo.lastEvent;
    first = (event.touches.length > 0 && event.touches[0]) || (event.changedTouches.length > 0 && event.changedTouches[0]);
    evt = document.createEvent('MouseEvent');
    evt.initMouseEvent(type, event.bubbles, event.cancelable, event.view, event.detail, first.screenX, first.screenY, first.clientX, first.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 1, event.target);
    if (delay) {
      window.clearTimeout(touchInfo.pressTimer);
      return touchInfo.pressTimer = window.setTimeout((function() {
        return event.target.dispatchEvent(evt);
      }), delay);
    } else {
      return event.target.dispatchEvent(evt);
    }
  };

  /*
  Touch Event Handling
  */


  touchInfo = {
    lastStart: 0,
    lastTouch: 0,
    lastEvent: null,
    pressTimer: 0
  };

  _oldAlert = window.alert;

  poly.touch = function(type, obj, event, graph) {
    var elem, offset, touchPos;

    obj.tooltip = obj.data('t');
    obj.evtData = obj.data('e');
    touchInfo.lastEvent = event;
    event.preventDefault();
    if (type === 'touchstart') {
      touchInfo.lastStart = event.timeStamp;
      poly.touchToMouse('mousedown', touchInfo);
      touchInfo.pressTimer = window.setTimeout((function() {
        return poly.touchToMouse('mouseover', touchInfo);
      }), 800);
      return window.alert = function() {
        var args;

        window.clearTimeout(touchInfo.pressTimer);
        args = arguments;
        return window.setTimeout((function() {
          _oldAlert.apply(window, args);
          return window.alert = _oldAlert;
        }), 100);
      };
    } else if (type === 'touchmove') {
      elem = graph.paper.getById(event.target.raphaelid);
      offset = poly.offset(graph.dom);
      touchPos = poly.getXY(offset, event);
      if (event.timeStamp - touchInfo.lastStart > 600 && elem.isPointInside(touchPos.x, touchPos.y)) {
        return poly.touchToMouse('mouseover', touchInfo);
      } else {
        window.clearTimeout(touchInfo.pressTimer);
        return poly.touchToMouse('mouseout', touchInfo);
      }
    } else if (type === 'touchend') {
      window.clearTimeout(touchInfo.pressTimer);
      poly.touchToMouse('mouseup', touchInfo);
      poly.touchToMouse('mouseout', touchInfo, 400);
      if (event.timeStamp - touchInfo.lastStart < 800) {
        return poly.touchToMouse('click', touchInfo);
      }
    } else if (type === 'touchcancel') {
      window.clearTimeout(touchInfo.pressTimer);
      poly.touchToMouse('mouseout', touchInfo);
      return poly.touchToMouse('mouseup', touchInfo, 300);
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
(function() {
  var POSTFIXES, formatNumber, postfix;

  poly.format = function(type, step) {
    switch (type) {
      case 'cat':
        return poly.format.identity;
      case 'num':
        return poly.format.number(step);
      case 'date':
        return poly.format.date(step);
      case 'none':
        return poly.format.identity;
    }
  };

  poly.format.identity = function(x) {
    return x;
  };

  POSTFIXES = {
    0: '',
    3: 'k',
    6: 'm',
    9: 'b',
    12: 't'
  };

  postfix = function(num, pow) {
    if (!_.isUndefined(POSTFIXES[pow])) {
      return num + POSTFIXES[pow];
    } else {
      return num + 'e' + (pow > 0 ? '+' : '-') + Math.abs(pow);
    }
  };

  formatNumber = function(n) {
    var abs, i, s, v;

    if (!isFinite(n)) {
      return n;
    }
    s = "" + n;
    abs = Math.abs(n);
    if (abs >= 10000) {
      v = ("" + abs).split(/\./);
      i = v[0].length % 3 || 3;
      v[0] = s.slice(0, i + (n < 0)) + v[0].slice(i).replace(/(\d{3})/g, ',$1');
      s = v.join('.');
    }
    return s;
  };

  poly.format.number = function(exp_original) {
    return function(num) {
      var exp, exp_fixed, exp_precision, rounded;

      exp_fixed = 0;
      exp_precision = 0;
      exp = exp_original != null ? exp_original : Math.floor(Math.log(Math.abs(num === 0 ? 1 : num)) / Math.LN10);
      if ((exp_original != null) && (exp === 2 || exp === 5 || exp === 8 || exp === 11)) {
        exp_fixed = exp + 1;
        exp_precision = 1;
      } else if (exp === -1) {
        exp_fixed = 0;
        exp_precision = exp_original != null ? 1 : 2;
      } else if (exp === -2) {
        exp_fixed = 0;
        exp_precision = exp_original != null ? 2 : 3;
      } else if (exp === 1 || exp === 2) {
        exp_fixed = 0;
      } else if (exp > 3 && exp < 6) {
        exp_fixed = 3;
      } else if (exp > 6 && exp < 9) {
        exp_fixed = 6;
      } else if (exp > 9 && exp < 12) {
        exp_fixed = 9;
      } else if (exp > 12 && exp < 15) {
        exp_fixed = 12;
      } else {
        exp_fixed = exp;
        exp_precision = exp_original != null ? 0 : 1;
      }
      rounded = Math.round(num / Math.pow(10, exp_fixed - exp_precision));
      rounded /= Math.pow(10, exp_precision);
      rounded = rounded.toFixed(exp_precision);
      return postfix(formatNumber(rounded), exp_fixed);
    };
  };

  poly.format.date = function(format) {
    var level;

    if (_.indexOf(poly["const"].timerange, format) !== -1) {
      level = format;
      if (level === 'second') {
        return function(date) {
          return moment.unix(date).format('h:mm:ss a');
        };
      } else if (level === 'minute') {
        return function(date) {
          return moment.unix(date).format('h:mm a');
        };
      } else if (level === 'hour') {
        return function(date) {
          return moment.unix(date).format('MMM D h a');
        };
      } else if (level === 'day' || level === 'week') {
        return function(date) {
          return moment.unix(date).format('MMM D');
        };
      } else if (level === 'month' || level === 'twomonth' || level === 'quarter' || level === 'sixmonth') {
        return function(date) {
          return moment.unix(date).format('YYYY/MM');
        };
      } else if (level === 'year' || level === 'twoyear' || level === 'fiveyear' || level === 'decade') {
        return function(date) {
          return moment.unix(date).format('YYYY');
        };
      } else {
        return function(date) {
          return moment.unix(date).format('YYYY');
        };
      }
    } else {
      return function(date) {
        return moment.unix(date).format(format);
      };
    }
  };

  poly.format._number_instance = poly.format.number();

  poly.format.value = function(v) {
    if (_.isNumber(v)) {
      return poly.format._number_instance(v);
    } else {
      return v;
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Impute types from values
*/


(function() {
  var THRESHOLD, compareCat, compareNum;

  THRESHOLD = 0.95;

  poly.type = {};

  poly.type.impute = function(values) {
    var date, length, m, num, value, _i, _len;

    date = 0;
    num = 0;
    length = 0;
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      value = values[_i];
      if ((value == null) || value === void 0 || value === null) {
        continue;
      }
      length++;
      if (!isNaN(value) || !isNaN(value.replace(/\$|\,/g, ''))) {
        num++;
      }
      m = moment(value);
      if ((m != null) && m.isValid()) {
        date++;
      }
    }
    if (num > THRESHOLD * length) {
      return 'num';
    }
    if (date > THRESHOLD * length) {
      return 'date';
    }
    return 'cat';
  };

  /*
  Parse values into correct types
  */


  poly.type.coerce = function(value, meta) {
    if (_.isUndefined(value) || _.isNull(value)) {
      return value;
    } else if (meta.type === 'cat') {
      return value;
    } else if (meta.type === 'num') {
      if (!isNaN(value)) {
        return +value;
      } else {
        return +(("" + value).replace(/\$|\,/g, ''));
      }
    } else if (meta.type === 'date') {
      if (meta.format) {
        if (meta.format === 'unix') {
          return moment.unix(value).unix();
        } else {
          return moment(value, meta.format).unix();
        }
      } else {
        return moment(value).unix();
      }
    } else {
      return void 0;
    }
  };

  poly.type.compare = function(type) {
    switch (type) {
      case 'cat':
        return compareCat;
      default:
        return compareNum;
    }
  };

  compareCat = function(a, b) {
    var al, bl;

    if (a === b) {
      return 0;
    }
    if (!_.isString(a)) {
      a = "" + a;
    }
    if (!_.isString(b)) {
      b = "" + b;
    }
    al = a.toLowerCase();
    bl = b.toLowerCase();
    if (al === bl) {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (al < bl) {
        return -1;
      } else if (al > bl) {
        return 1;
      } else {
        return 0;
      }
    }
  };

  compareNum = function(a, b) {
    if (a === b) {
      return 0;
    } else if (a === null) {
      return 1;
    } else if (b === null) {
      return -1;
    } else if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Turns a 'non-strict' spec to a strict one.
See the spec definition for more information.
*/


(function() {
  poly.spec = {};

  poly.spec.toStrictMode = function(spec) {
    var aes, facetvar, i, layer, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;

    spec = _.clone(spec);
    if ((spec.layers == null) && spec.layer) {
      spec.layers = [spec.layer];
    }
    if ((spec.guides == null) && spec.guide) {
      spec.guides = spec.guide;
    }
    if (spec.guides == null) {
      spec.guides = {};
    }
    if (spec.layers) {
      _ref = spec.layers;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        layer = _ref[i];
        _ref1 = poly["const"].aes;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          aes = _ref1[_j];
          if (layer[aes] && _.isString(layer[aes])) {
            layer[aes] = {
              "var": layer[aes]
            };
          }
        }
        if (layer.sample == null) {
          layer.sample = 500;
        }
      }
    }
    if (spec.facet) {
      _ref2 = ['var', 'x', 'y'];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        v = _ref2[_k];
        facetvar = spec.facet[v];
        if (facetvar && _.isString(facetvar)) {
          spec.facet[v] = {
            "var": facetvar
          };
        }
      }
    } else {
      spec.facet = {
        type: 'none'
      };
    }
    if (!spec.coord) {
      spec.coord = {
        type: 'cartesian',
        flip: false
      };
    }
    if (_.isString(spec.dom)) {
      spec.dom = document.getElementById(spec.dom);
    }
    return spec;
  };

  poly.spec.check = function(spec) {
    var id, layer, _i, _len, _ref;

    if ((spec.layers == null) || spec.layers.length === 0) {
      throw poly.error.defn("No layers are defined in the specification.");
    }
    _ref = spec.layers;
    for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
      layer = _ref[id];
      if (layer.data == null) {
        throw poly.error.defn("Layer " + (id + 1) + " does not have data to plot!");
      }
      if (!layer.data.isData) {
        throw poly.error.defn("Data must be a Polychart Data object.");
      }
    }
    if (!((spec.render != null) && spec.render === false) && !spec.dom) {
      throw poly.error.defn("No DOM element specified. Where to make plot?");
    }
    return spec;
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
(function() {
  poly.xhr = function(url, mime, callback) {
    var req;

    req = new XMLHttpRequest;
    if (arguments.length < 3) {
      callback = mime;
      mime = null;
    } else if (mime && req.overrideMimeType) {
      req.overrideMimeType(mime);
    }
    req.open("GET", url, true);
    if (mime) {
      req.setRequestHeader("Accept", mime);
    }
    req.onreadystatechange = function() {
      var arg, s;

      if (req.readyState === 4) {
        s = req.status;
        arg = !s && req.response || s >= 200 && s < 300 || s === 304 ? req : null;
        return callback(arg);
      }
    };
    return req.send(null);
  };

  poly.text = function(url, mime, callback) {
    var ready;

    ready = function(req) {
      return callback(req && req.responseText);
    };
    if (arguments.length < 3) {
      callback = mime;
      mime = null;
    }
    return poly.xhr(url, mime, ready);
  };

  poly.json = function(url, callback) {
    return poly.text(url, "application/json", function(text) {
      return callback(text ? JSON.parse(text) : null);
    });
  };

  poly.dsv = function(delimiter, mimeType) {
    var delimiterCode, dsv, formatRow, formatValue, header, reFormat, reParse;

    reParse = new RegExp("\r\n|[" + delimiter + "\r\n]", "g");
    reFormat = new RegExp("[\"" + delimiter + "\n]");
    delimiterCode = delimiter.charCodeAt(0);
    formatRow = function(row) {
      return row.map(formatValue).join(delimiter);
    };
    formatValue = function(text) {
      var _ref;

      return (_ref = reFormat.test(text)) != null ? _ref : "\"" + text.replace(/\"/g, "\"\"") + {
        "\"": text
      };
    };
    header = null;
    dsv = function(url, callback) {
      return poly.text(url, mimeType, function(text) {
        return callback(text && dsv.parse(text));
      });
    };
    dsv.parse = function(text) {
      return dsv.parseRows(text, function(row, i) {
        var item, j, m, o;

        if (i) {
          o = {};
          j = -1;
          m = header.length;
          while (++j < m) {
            item = row[j];
            o[header[j]] = row[j];
          }
          return o;
        } else {
          header = row;
          return null;
        }
      });
    };
    dsv.parseRows = function(text, f) {
      var EOF, EOL, a, eol, n, rows, t, token;

      EOL = {};
      EOF = {};
      rows = [];
      n = 0;
      t = null;
      eol = null;
      reParse.lastIndex = 0;
      token = function() {
        var c, i, j, m;

        if (reParse.lastIndex >= text.length) {
          return EOF;
        }
        if (eol) {
          eol = false;
          return EOL;
        }
        j = reParse.lastIndex;
        if (text.charCodeAt(j) === 34) {
          i = j;
          while (i++ < text.length) {
            if (text.charCodeAt(i) === 34) {
              if (text.charCodeAt(i + 1) !== 34) {
                break;
              }
              i++;
            }
          }
          reParse.lastIndex = i + 2;
          c = text.charCodeAt(i + 1);
          if (c === 13) {
            eol = true;
            if (text.charCodeAt(i + 2) === 10) {
              reParse.lastIndex++;
            }
          } else if (c === 10) {
            eol = true;
          }
          return text.substring(j + 1, i).replace(/""/g, "\"");
        }
        m = reParse.exec(text);
        if (m) {
          eol = m[0].charCodeAt(0) !== delimiterCode;
          return text.substring(j, m.index);
        }
        reParse.lastIndex = text.length;
        return text.substring(j);
      };
      while ((t = token()) !== EOF) {
        a = [];
        while (t !== EOL && t !== EOF) {
          a.push(t);
          t = token();
        }
        if (f && !(a = f(a, n++))) {
          continue;
        }
        rows.push(a);
      }
      return rows;
    };
    dsv.format = function(rows) {
      return rows.map(formatRow).join("\n");
    };
    return dsv;
  };

  poly.csv = poly.dsv(",", "text/csv");

}).call(this);
// Generated by CoffeeScript 1.6.2
(function() {
  var Call, Comma, Const, Expr, Ident, LParen, Literal, RParen, Stream, Symbol, Token, assocsToObj, dedup, dedupOnKey, dictGet, dictGets, expect, extractOps, layerToDataSpec, matchToken, mergeObjLists, parse, parseCall, parseCallArgs, parseConst, parseExpr, parseFail, parseSymbolic, showCall, showList, tag, tokenize, tokenizers, unquote, zip, zipWith, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  unquote = function(str, quote) {
    var n, _i, _len, _ref;

    n = str.length;
    _ref = ['"', "'"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      quote = _ref[_i];
      if (str[0] === quote && str[n - 1] === quote) {
        return str.slice(1, +(n - 2) + 1 || 9e9);
      }
    }
    return str;
  };

  zipWith = function(op) {
    return function(xs, ys) {
      var ix, xval, _i, _len, _results;

      _results = [];
      for (ix = _i = 0, _len = xs.length; _i < _len; ix = ++_i) {
        xval = xs[ix];
        _results.push(op(xval, ys[ix]));
      }
      return _results;
    };
  };

  zip = zipWith(function(xval, yval) {
    return [xval, yval];
  });

  assocsToObj = function(assocs) {
    var key, obj, val, _i, _len, _ref;

    obj = {};
    for (_i = 0, _len = assocs.length; _i < _len; _i++) {
      _ref = assocs[_i], key = _ref[0], val = _ref[1];
      obj[key] = val;
    }
    return obj;
  };

  dictGet = function(dict, key, defval) {
    if (defval == null) {
      defval = null;
    }
    return (key in dict && dict[key]) || defval;
  };

  dictGets = function(dict, keyVals) {
    var defval, fin, key, val;

    fin = {};
    for (key in keyVals) {
      defval = keyVals[key];
      val = dictGet(dict, key, defval);
      if (val !== null) {
        fin[key] = val;
      }
    }
    return fin;
  };

  mergeObjLists = function(dicts) {
    var dict, fin, key, _i, _len;

    fin = {};
    for (_i = 0, _len = dicts.length; _i < _len; _i++) {
      dict = dicts[_i];
      for (key in dict) {
        fin[key] = dict[key].concat(dictGet(fin, key, []));
      }
    }
    return fin;
  };

  dedup = function(vals, trans) {
    var unique, val, _, _i, _len, _results;

    if (trans == null) {
      trans = function(x) {
        return x;
      };
    }
    unique = {};
    for (_i = 0, _len = vals.length; _i < _len; _i++) {
      val = vals[_i];
      unique[trans(val)] = val;
    }
    _results = [];
    for (_ in unique) {
      val = unique[_];
      _results.push(val);
    }
    return _results;
  };

  dedupOnKey = function(key) {
    return function(vals) {
      return dedup(vals, function(val) {
        return val[key];
      });
    };
  };

  showCall = function(fname, args) {
    return "" + fname + "(" + args + ")";
  };

  showList = function(xs) {
    return "[" + xs + "]";
  };

  Stream = (function() {
    function Stream(src) {
      var val;

      this.buffer = ((function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = src.length; _i < _len; _i++) {
          val = src[_i];
          _results.push(val);
        }
        return _results;
      })()).reverse();
    }

    Stream.prototype.empty = function() {
      return this.buffer.length === 0;
    };

    Stream.prototype.peek = function() {
      if (this.empty()) {
        return null;
      } else {
        return this.buffer[this.buffer.length - 1];
      }
    };

    Stream.prototype.get = function() {
      if (this.empty()) {
        return null;
      } else {
        return this.buffer.pop();
      }
    };

    Stream.prototype.toString = function() {
      return showCall('Stream', showList(__slice.call(this.buffer).reverse()));
    };

    return Stream;

  })();

  Token = (function() {
    Token.Tag = {
      symbol: 'symbol',
      literal: 'literal',
      lparen: '(',
      rparen: ')',
      comma: ','
    };

    function Token(tag) {
      this.tag = tag;
    }

    Token.prototype.toString = function() {
      return "<" + (this.contents().toString()) + ">";
    };

    Token.prototype.contents = function() {
      return [this.tag];
    };

    return Token;

  })();

  Symbol = (function(_super) {
    __extends(Symbol, _super);

    function Symbol(name) {
      this.name = name;
      this.name = unquote(this.name);
      Symbol.__super__.constructor.call(this, Token.Tag.symbol);
    }

    Symbol.prototype.contents = function() {
      return Symbol.__super__.contents.call(this).concat([this.name]);
    };

    return Symbol;

  })(Token);

  Literal = (function(_super) {
    __extends(Literal, _super);

    function Literal(val) {
      this.val = val;
      this.val = unquote(this.val);
      Literal.__super__.constructor.call(this, Token.Tag.literal);
    }

    Literal.prototype.contents = function() {
      return Literal.__super__.contents.call(this).concat([this.val]);
    };

    return Literal;

  })(Token);

  _ref = (function() {
    var _i, _len, _ref, _results;

    _ref = [Token.Tag.lparen, Token.Tag.rparen, Token.Tag.comma];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tag = _ref[_i];
      _results.push(new Token(tag));
    }
    return _results;
  })(), LParen = _ref[0], RParen = _ref[1], Comma = _ref[2];

  tokenizers = [
    [
      /^\(/, function() {
        return LParen;
      }
    ], [
      /^\)/, function() {
        return RParen;
      }
    ], [
      /^,/, function() {
        return Comma;
      }
    ], [
      /^[+-]?(0x[0-9a-fA-F]+|0?\.\d+|[1-9]\d*(\.\d+)?|0)([eE][+-]?\d+)?/, function(val) {
        return new Literal(val);
      }
    ], [
      /^(\w|[^\u0000-\u0080])+|'((\\.)|[^\\'])+'|"((\\.)|[^\\"])+"/, function(name) {
        return new Symbol(name);
      }
    ]
  ];

  matchToken = function(str) {
    var match, op, pat, substr, _i, _len, _ref1;

    for (_i = 0, _len = tokenizers.length; _i < _len; _i++) {
      _ref1 = tokenizers[_i], pat = _ref1[0], op = _ref1[1];
      match = pat.exec(str);
      if (match) {
        substr = match[0];
        return [str.slice(substr.length), op(substr)];
      }
    }
    throw poly.error.defn("There is an error in your specification at " + str);
  };

  tokenize = function(str) {
    var tok, _ref1, _results;

    _results = [];
    while (true) {
      str = str.replace(/^\s+/, '');
      if (!str) {
        break;
      }
      _ref1 = matchToken(str), str = _ref1[0], tok = _ref1[1];
      _results.push(tok);
    }
    return _results;
  };

  Expr = (function() {
    function Expr() {}

    Expr.prototype.toString = function() {
      return showCall(this.constructor.name, this.contents());
    };

    return Expr;

  })();

  Ident = (function(_super) {
    __extends(Ident, _super);

    function Ident(name) {
      this.name = name;
    }

    Ident.prototype.contents = function() {
      return [this.name];
    };

    Ident.prototype.pretty = function() {
      return this.name;
    };

    Ident.prototype.visit = function(visitor) {
      return visitor.ident(this, this.name);
    };

    return Ident;

  })(Expr);

  Const = (function(_super) {
    __extends(Const, _super);

    function Const(val) {
      this.val = val;
    }

    Const.prototype.contents = function() {
      return [this.val];
    };

    Const.prototype.pretty = function() {
      return this.val;
    };

    Const.prototype.visit = function(visitor) {
      return visitor["const"](this, this.val);
    };

    return Const;

  })(Expr);

  Call = (function(_super) {
    __extends(Call, _super);

    function Call(fname, args) {
      this.fname = fname;
      this.args = args;
    }

    Call.prototype.contents = function() {
      return [this.fname, showList(this.args)];
    };

    Call.prototype.pretty = function() {
      var arg;

      return showCall(this.fname, (function() {
        var _i, _len, _ref1, _results;

        _ref1 = this.args;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          arg = _ref1[_i];
          _results.push(arg.pretty());
        }
        return _results;
      }).call(this));
    };

    Call.prototype.visit = function(visitor) {
      var arg;

      return visitor.call(this, this.fname, (function() {
        var _i, _len, _ref1, _results;

        _ref1 = this.args;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          arg = _ref1[_i];
          _results.push(arg.visit(visitor));
        }
        return _results;
      }).call(this));
    };

    return Call;

  })(Expr);

  expect = function(stream, fail, alts) {
    var express, token, _i, _len, _ref1;

    token = stream.peek();
    if (token !== null) {
      for (_i = 0, _len = alts.length; _i < _len; _i++) {
        _ref1 = alts[_i], tag = _ref1[0], express = _ref1[1];
        if (token.tag === tag) {
          return express(stream);
        }
      }
    }
    return fail(stream);
  };

  parseFail = function(stream) {
    throw poly.error.defn("There is an error in your specification at " + (stream.toString()));
  };

  parse = function(str) {
    var expr, stream;

    stream = new Stream(tokenize(str));
    expr = parseExpr(stream);
    if (stream.peek() !== null) {
      throw poly.error.defn("There is an error in your specification at " + (stream.toString()));
    }
    return expr;
  };

  parseExpr = function(stream) {
    return expect(stream, parseFail, [[Token.Tag.literal, parseConst], [Token.Tag.symbol, parseSymbolic]]);
  };

  parseConst = function(stream) {
    return new Const((stream.get().val));
  };

  parseSymbolic = function(stream) {
    var name;

    name = stream.get().name;
    return expect(stream, (function() {
      return new Ident(name);
    }), [[Token.Tag.lparen, parseCall(name)]]);
  };

  parseCall = function(name) {
    return function(stream) {
      var args;

      stream.get();
      args = expect(stream, parseCallArgs([]), [
        [
          Token.Tag.rparen, function(ts) {
            ts.get();
            return [];
          }
        ]
      ]);
      return new Call(name, args);
    };
  };

  parseCallArgs = function(acc) {
    return function(stream) {
      var arg, args;

      arg = parseExpr(stream);
      args = acc.concat([arg]);
      return expect(stream, parseFail, [
        [
          Token.Tag.rparen, function(ts) {
            ts.get();
            return args;
          }
        ], [
          Token.Tag.comma, function(ts) {
            ts.get();
            return (parseCallArgs(args))(ts);
          }
        ]
      ]);
    };
  };

  extractOps = function(expr) {
    var extractor, results;

    results = {
      trans: [],
      stat: []
    };
    extractor = {
      ident: function(expr, name) {
        return name;
      },
      "const": function(expr, val) {
        return val;
      },
      call: function(expr, fname, args) {
        var opargs, optype, result;

        optype = fname in poly["const"].trans ? 'trans' : fname in poly["const"].stat ? 'stat' : 'none';
        if (optype !== 'none') {
          opargs = poly["const"][optype][fname];
          result = assocsToObj(zip(opargs, args));
          result.name = expr.pretty();
          result[optype] = fname;
          results[optype].push(result);
          return result.name;
        } else {
          throw poly.error.defn("The operation " + fname + " is not recognized. Please check your specifications.");
        }
      }
    };
    expr.visit(extractor);
    return results;
  };

  layerToDataSpec = function(lspec, grouping) {
    var aesthetics, dedupByName, desc, expr, filters, groups, grpvar, key, metas, result, sdesc, select, sexpr, stats, transstat, transstats, ts, val, _i, _len, _ref1, _ref2;

    if (grouping == null) {
      grouping = [];
    }
    filters = {};
    _ref2 = (_ref1 = lspec.filter) != null ? _ref1 : {};
    for (key in _ref2) {
      val = _ref2[key];
      filters[(parse(key)).pretty()] = val;
    }
    grouping = (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = grouping.length; _i < _len; _i++) {
        key = grouping[_i];
        _results.push((parse(key["var"])).pretty());
      }
      return _results;
    })();
    aesthetics = _.pick(lspec, poly["const"].aes);
    for (key in aesthetics) {
      if (!('var' in aesthetics[key])) {
        delete aesthetics[key];
      }
    }
    transstat = [];
    select = [];
    groups = [];
    metas = {};
    for (key in aesthetics) {
      desc = aesthetics[key];
      if (desc["var"] === 'count(*)') {
        select.push(desc["var"]);
      } else {
        expr = parse(desc["var"]);
        desc["var"] = expr.pretty();
        ts = extractOps(expr);
        transstat.push(ts);
        select.push(desc["var"]);
        if (ts.stat.length === 0) {
          groups.push(desc["var"]);
        }
        if ('sort' in desc) {
          sdesc = dictGets(desc, poly["const"].metas);
          sexpr = parse(sdesc.sort);
          sdesc.sort = sexpr.pretty();
          result = extractOps(sexpr);
          if (result.stat.length !== 0) {
            sdesc.stat = result.stat[0];
          }
          metas[desc["var"]] = sdesc;
        }
      }
    }
    for (_i = 0, _len = grouping.length; _i < _len; _i++) {
      grpvar = grouping[_i];
      expr = parse(grpvar);
      grpvar = expr.pretty();
      ts = extractOps(expr);
      transstat.push(ts);
      select.push(grpvar);
      if (ts.stat.length === 0) {
        groups.push(grpvar);
      } else {
        throw poly.error.defn("Facet variable should not contain statistics!");
      }
    }
    transstats = mergeObjLists(transstat);
    dedupByName = dedupOnKey('name');
    stats = {
      stats: dedupByName(transstats.stat),
      groups: dedup(groups)
    };
    return {
      trans: dedupByName(transstats.trans),
      stats: stats,
      meta: metas,
      select: dedup(select),
      filter: filters
    };
  };

  poly.parser = {
    tokenize: tokenize,
    parse: parse,
    layerToData: layerToDataSpec
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Coordinates
-----------
Defines what coordinate system is used to plot the graph.
*/


(function() {
  var Cartesian, Coordinate, Polar, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    _this = this;

  Coordinate = (function() {
    function Coordinate(spec) {
      var _ref, _ref1, _ref2;

      this.spec = spec;
      if ((_ref = this.spec) == null) {
        this.spec = {};
      }
      this.flip = (_ref1 = this.spec.flip) != null ? _ref1 : false;
      this.scales = null;
      _ref2 = this.flip ? ['y', 'x'] : ['x', 'y'], this.x = _ref2[0], this.y = _ref2[1];
    }

    Coordinate.prototype.make = function(dims) {
      return this.dims = dims;
    };

    Coordinate.prototype.setScales = function(scales) {
      return this.scales = {
        x: scales.x.f,
        y: scales.y.f
      };
    };

    Coordinate.prototype.clipping = function(offset) {
      return [offset.x, offset.y, this.dims.eachWidth, this.dims.eachHeight];
    };

    Coordinate.prototype.getScale = function(aes) {};

    Coordinate.prototype.ranges = function() {};

    return Coordinate;

  })();

  Cartesian = (function(_super) {
    __extends(Cartesian, _super);

    function Cartesian() {
      _ref = Cartesian.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Cartesian.prototype.type = 'cartesian';

    Cartesian.prototype.getScale = function(aes) {
      if (aes === 'x' || aes === 'y') {
        return this.scales[this[aes]];
      } else {
        throw poly.error.input("Coordinates only keep x & y scales");
      }
    };

    Cartesian.prototype.ranges = function() {
      var ranges;

      ranges = {};
      ranges[this.x] = {
        min: 0,
        max: this.dims.eachWidth
      };
      ranges[this.y] = {
        min: this.dims.eachHeight,
        max: 0
      };
      return ranges;
    };

    Cartesian.prototype.axisType = function(aes) {
      return this[aes];
    };

    Cartesian.prototype.getXY = function(mayflip, mark) {
      var point, scalex, scaley;

      if (mayflip) {
        point = {
          x: _.isArray(mark.x) ? _.map(mark.x, this.scales.x) : this.scales.x(mark.x),
          y: _.isArray(mark.y) ? _.map(mark.y, this.scales.y) : this.scales.y(mark.y)
        };
        return {
          x: point[this.x],
          y: point[this.y]
        };
      } else {
        scalex = this.scales[this.x];
        scaley = this.scales[this.y];
        return {
          x: _.isArray(mark.x) ? _.map(mark.x, scalex) : scalex(mark.x),
          y: _.isArray(mark.y) ? _.map(mark.y, scaley) : scaley(mark.y)
        };
      }
    };

    Cartesian.prototype.getAes = function(pixel1, pixel2, reverse) {
      return {
        x: reverse.x(pixel1[this.x], pixel2[this.x]),
        y: reverse.y(pixel1[this.y], pixel2[this.y])
      };
    };

    return Cartesian;

  })(Coordinate);

  Polar = (function(_super) {
    __extends(Polar, _super);

    function Polar() {
      this.getXY = __bind(this.getXY, this);      _ref1 = Polar.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Polar.prototype.type = 'polar';

    Polar.prototype.make = function(dims) {
      this.dims = dims;
      this.cx = this.dims.eachWidth / 2;
      return this.cy = this.dims.eachHeight / 2;
    };

    Polar.prototype.getScale = function(aes) {
      if (aes === 'r') {
        return this.scales[this.x];
      } else if (aes === 't') {
        return this.scales[this.y];
      } else {
        throw poly.error.input("Coordinates only keep r & t scales");
      }
    };

    Polar.prototype.ranges = function() {
      var r, ranges, t, _ref2;

      _ref2 = [this.x, this.y], r = _ref2[0], t = _ref2[1];
      ranges = {};
      ranges[t] = {
        min: 0,
        max: 2 * Math.PI
      };
      ranges[r] = {
        min: 0,
        max: Math.min(this.dims.eachWidth, this.dims.eachHeight) / 2 - 10
      };
      return ranges;
    };

    Polar.prototype.axisType = function(aes) {
      if (this[aes] === 'x') {
        return 'r';
      } else {
        return 't';
      }
    };

    Polar.prototype.getXY = function(mayflip, mark) {
      var getpos, i, ident, points, r, radius, t, theta, x, xpos, y, ypos, _getx, _gety, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5,
        _this = this;

      _getx = function(radius, theta) {
        return _this.cx + radius * Math.cos(theta - Math.PI / 2);
      };
      _gety = function(radius, theta) {
        return _this.cy + radius * Math.sin(theta - Math.PI / 2);
      };
      _ref2 = [this.x, this.y], r = _ref2[0], t = _ref2[1];
      if (mayflip) {
        if (_.isArray(mark[r])) {
          points = {
            x: [],
            y: [],
            r: [],
            t: []
          };
          _ref3 = mark[r];
          for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
            radius = _ref3[i];
            radius = this.scales[r](radius);
            theta = this.scales[t](mark[t][i]);
            points.x.push(_getx(radius, theta));
            points.y.push(_gety(radius, theta));
            points.r.push(radius);
            points.t.push(theta);
          }
          return points;
        }
        radius = this.scales[r](mark[r]);
        theta = this.scales[t](mark[t]);
        return {
          x: _getx(radius, theta),
          y: _gety(radius, theta),
          r: radius,
          t: theta
        };
      }
      ident = function(obj) {
        return _.isObject(obj) && obj.t === 'scalefn' && obj.f === 'identity';
      };
      getpos = function(x, y) {
        var identx, identy;

        identx = ident(x);
        identy = ident(y);
        if (identx && !identy) {
          return {
            x: x.v,
            y: _gety(_this.scales[r](y), 0)
          };
        } else if (identx && identy) {
          return {
            x: x.v,
            y: y.v
          };
        } else if (!identx && identy) {
          return {
            y: y.v,
            x: _gety(_this.scales[t](x), 0)
          };
        } else {
          radius = _this.scales[r](y);
          theta = _this.scales[t](x);
          return {
            x: _getx(radius, theta),
            y: _gety(radius, theta)
          };
        }
      };
      if (_.isArray(mark.x)) {
        points = {
          x: [],
          y: []
        };
        _ref4 = mark.x;
        for (i = _j = 0, _len1 = _ref4.length; _j < _len1; i = ++_j) {
          xpos = _ref4[i];
          ypos = mark.y[i];
          _ref5 = getpos(xpos, ypos), x = _ref5.x, y = _ref5.y;
          points.x.push(x);
          points.y.push(y);
        }
        return points;
      }
      return getpos(mark.x, mark.y);
    };

    return Polar;

  })(Coordinate);

  poly.coord = {
    cartesian: function(spec) {
      return new Cartesian(spec);
    },
    polar: function(spec) {
      return new Polar(spec);
    }
  };

  poly.coord.make = function(spec) {
    if ((spec == null) || (spec.type == null)) {
      return poly.coord.cartesian();
    }
    switch (spec.type) {
      case 'cartesian':
        return poly.coord.cartesian(spec);
      case 'polar':
        return poly.coord.polar(spec);
      default:
        throw poly.error.defn("No such coordinate type " + spec.type + ".");
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
# CONSTANTS
*/


(function() {
  var CategoricalDomain, DateDomain, NumericDomain, aesthetics, domainMerge, flattenGeoms, makeDomain, makeDomainSet, mergeDomains,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  aesthetics = poly["const"].aes;

  /*
  # GLOBALS
  */


  poly.domain = {};

  /*
  Produce a domain set for each layer based on both the information in each
  layer and the specification of the guides, then merge them into one domain
  set.
  */


  poly.domain.make = function(geoms, metas, guideSpec, strictmode) {
    var domainSets, g, i;

    domainSets = [];
    for (i in geoms) {
      g = geoms[i];
      domainSets.push(makeDomainSet(g.geoms, metas[i], guideSpec, strictmode));
    }
    return poly.domain.merge(domainSets);
  };

  poly.domain.compare = function(domain) {
    if (domain) {
      if (domain.type === 'cat') {
        return function(a, b) {
          a = _.indexOf(domain.levels, a);
          b = _.indexOf(domain.levels, b);
          if (a === -1) {
            return 1;
          } else if (b === -1) {
            return -1;
          } else if (a < b) {
            return -1;
          } else if (a > b) {
            return 1;
          } else {
            return 0;
          }
        };
      } else {
        return poly.type.compare(domain.type);
      }
    } else {
      return function(x) {
        return x;
      };
    }
  };

  /*
  # CLASSES & HELPER
  */


  /*
  Domain classes
  */


  NumericDomain = (function() {
    function NumericDomain(params) {
      this.type = params.type, this.min = params.min, this.max = params.max, this.bw = params.bw;
    }

    return NumericDomain;

  })();

  DateDomain = (function() {
    function DateDomain(params) {
      this.type = params.type, this.min = params.min, this.max = params.max, this.bw = params.bw;
    }

    return DateDomain;

  })();

  CategoricalDomain = (function() {
    function CategoricalDomain(params) {
      this.type = params.type, this.levels = params.levels, this.sorted = params.sorted;
    }

    return CategoricalDomain;

  })();

  /*
  Public-ish interface for making different domain types
  */


  makeDomain = function(params) {
    if (params.type !== 'cat' && params.max === params.min) {
      if (params.bw) {
        params.max += params.bw;
        params.min -= params.bw;
      } else {
        params.max *= 1.1;
        params.min /= 1.1;
      }
    }
    switch (params.type) {
      case 'num':
        return new NumericDomain(params);
      case 'date':
        return new DateDomain(params);
      case 'cat':
        return new CategoricalDomain(params);
    }
  };

  /*
  Make a domain set. A domain set is an associate array of domains, with the
  keys being aesthetics
  */


  makeDomainSet = function(geoms, metas, guideSpec, strictmode) {
    var aes, bw, domain, fromspec, max, meta, min, values, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;

    domain = {};
    for (aes in metas) {
      meta = metas[aes];
      if (__indexOf.call(poly["const"].noDomain, aes) >= 0) {
        continue;
      }
      if (strictmode) {
        domain[aes] = makeDomain(guideSpec[aes]);
      } else {
        values = flattenGeoms(geoms, aes);
        if (values.length === 0) {
          throw poly.error.input("Dataset is none?");
        }
        fromspec = function(item) {
          if (guideSpec[aes] != null) {
            return guideSpec[aes][item];
          } else {
            return null;
          }
        };
        switch (meta.type) {
          case 'num':
            bw = (_ref = fromspec('bw')) != null ? _ref : meta.bw;
            if (values.length > 1) {
              min = (_ref1 = fromspec('min')) != null ? _ref1 : _.min(values);
              max = (_ref2 = fromspec('max')) != null ? _ref2 : _.max(values) + (bw != null ? bw : 0);
            } else if (values.length === 1) {
              debugger;
              if (bw) {
                min = (_ref3 = fromspec('min')) != null ? _ref3 : values[0];
                max = (_ref4 = fromspec('max')) != null ? _ref4 : values[0] + bw;
              } else {
                min = (_ref5 = fromspec('min')) != null ? _ref5 : values[0] - 1;
                max = (_ref6 = fromspec('max')) != null ? _ref6 : values[0] + 1;
              }
            } else {
              min = (_ref7 = fromspec('min')) != null ? _ref7 : 0;
              max = (_ref8 = (_ref9 = fromspec('max')) != null ? _ref9 : bw) != null ? _ref8 : 1;
            }
            domain[aes] = makeDomain({
              type: 'num',
              min: min,
              max: max,
              bw: bw
            });
            break;
          case 'date':
            bw = (_ref10 = fromspec('bw')) != null ? _ref10 : meta.bw;
            min = (_ref11 = fromspec('min')) != null ? _ref11 : _.min(values);
            max = fromspec('max');
            if (max == null) {
              max = _.max(values);
              max = (function() {
                switch (bw) {
                  case 'week':
                    return moment.unix(max).add('days', 7).unix();
                  case 'twomonth':
                    return moment.unix(max).add('months', 2).unix();
                  case 'quarter':
                    return moment.unix(max).add('months', 4).unix();
                  case 'sixmonth':
                    return moment.unix(max).add('months', 6).unix();
                  case 'twoyear':
                    return moment.unix(max).add('years', 2).unix();
                  case 'fiveyear':
                    return moment.unix(max).add('years', 5).unix();
                  case 'decade':
                    return moment.unix(max).add('years', 10).unix();
                  default:
                    return moment.unix(max).add(bw + 's', 1).unix();
                }
              })();
            }
            domain[aes] = makeDomain({
              type: 'date',
              min: min,
              max: max,
              bw: bw
            });
            break;
          case 'cat':
            domain[aes] = makeDomain({
              type: 'cat',
              levels: (_ref12 = (_ref13 = fromspec('levels')) != null ? _ref13 : meta.levels) != null ? _ref12 : _.uniq(values),
              sorted: (_ref14 = (_ref15 = fromspec('levels')) != null ? _ref15 : meta.sorted) != null ? _ref14 : false
            });
        }
      }
    }
    return domain;
  };

  /*
  VERY preliminary flatten function. Need to optimize
  */


  flattenGeoms = function(geoms, aes) {
    var geom, k, l, mark, v, values, _i, _len, _ref, _results;

    values = [];
    for (k in geoms) {
      geom = geoms[k];
      _ref = geom.marks;
      for (l in _ref) {
        mark = _ref[l];
        values = values.concat(poly.flatten(mark[aes]));
      }
    }
    _results = [];
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      v = values[_i];
      if (poly.isDefined(v)) {
        _results.push(v);
      }
    }
    return _results;
  };

  /*
  Merge an array of domain sets: i.e. merge all the domains that shares the
  same aesthetics.
  */


  poly.domain.merge = function(domainSets) {
    var aes, domains, merged, _i, _len;

    merged = {};
    for (_i = 0, _len = aesthetics.length; _i < _len; _i++) {
      aes = aesthetics[_i];
      domains = _.without(_.pluck(domainSets, aes), void 0);
      if (domains.length > 0) {
        merged[aes] = mergeDomains(domains);
      }
    }
    return merged;
  };

  /*
  Helper for merging domains of the same type. Two domains of the same type
  can be merged if they share the same properties:
   - For numeric/date variables all domains must have the same binwidth parameter
   - For categorial variables, sorted domains must have any categories in common
  */


  domainMerge = {
    'num': function(domains) {
      var bw, max, min, _ref;

      bw = _.compact(_.uniq(_.map(domains, function(d) {
        return d.bw;
      })));
      if (bw.length > 1) {
        throw poly.error.data("Not all layers have the same binwidth.");
      }
      bw = (_ref = bw[0]) != null ? _ref : void 0;
      min = _.min(_.map(domains, function(d) {
        return d.min;
      }));
      max = _.max(_.map(domains, function(d) {
        return d.max;
      }));
      return makeDomain({
        type: 'num',
        min: min,
        max: max,
        bw: bw
      });
    },
    'date': function(domains) {
      var bw, max, min, _ref;

      bw = _.compact(_.uniq(_.map(domains, function(d) {
        return d.bw;
      })));
      if (bw.length > 1) {
        throw poly.error.data("Not all layers have the same binwidth.");
      }
      bw = (_ref = bw[0]) != null ? _ref : void 0;
      min = _.min(_.map(domains, function(d) {
        return d.min;
      }));
      max = _.max(_.map(domains, function(d) {
        return d.max;
      }));
      return makeDomain({
        type: 'date',
        min: min,
        max: max,
        bw: bw
      });
    },
    'cat': function(domains) {
      var add, d, l, levels, sortedLevels, unsortedLevels, _i, _j, _len, _len1;

      sortedLevels = [];
      for (_i = 0, _len = domains.length; _i < _len; _i++) {
        d = domains[_i];
        if (d.sorted) {
          add = true;
          for (_j = 0, _len1 = sortedLevels.length; _j < _len1; _j++) {
            l = sortedLevels[_j];
            if (_.isEqual(l, d.levels)) {
              add = false;
            }
          }
          if (add) {
            sortedLevels.push(d.levels);
          }
        }
      }
      unsortedLevels = _.chain(domains).filter(function(d) {
        return !d.sorted;
      }).map(function(d) {
        return d.levels;
      }).value();
      if (sortedLevels.length > 1 && _.intersection.apply(this, sortedLevels)) {
        throw poly.error.data("You are trying to combine incompatible sorted domains in the same axis.");
      }
      sortedLevels = [_.flatten(sortedLevels, true)];
      levels = _.union.apply(this, sortedLevels.concat(unsortedLevels));
      if (sortedLevels[0].length === 0) {
        levels = levels.sort();
      }
      return makeDomain({
        type: 'cat',
        levels: levels,
        sorted: sortedLevels[0].length !== 0
      });
    }
  };

  /*
  Merge an array of domains: Two domains can be merged if they are of the
  same type, and they share certain properties.
  */


  mergeDomains = function(domains) {
    var types;

    types = _.uniq(_.map(domains, function(d) {
      return d.type;
    }));
    if (types.length > 1) {
      throw poly.error.data("You are trying to merge data of different types in the same axis or legend.");
    }
    return domainMerge[types[0]](domains);
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Tick Generation
---------------
Helper functions to legends & axes for generating ticks
*/


(function() {
  var Tick, getStep, tickFactory, tickValues;

  poly.tick = {};

  /*
  Produce an associate array of aesthetics to tick objects.
  */


  poly.tick.make = function(domain, guideSpec, type) {
    var formatter, i, next, numticks, prev, step, t, tickfn, tickobjs, ticks, tmpTick, _i, _ref, _ref1, _ref2,
      _this = this;

    step = null;
    formatter = function(x) {
      return x;
    };
    if (guideSpec.ticks != null) {
      if (type === 'num') {
        ticks = _.filter(guideSpec.ticks, function(t) {
          return t >= domain.min && t <= domain.max;
        });
      } else {
        ticks = guideSpec.ticks;
      }
    } else {
      numticks = (_ref = guideSpec.numticks) != null ? _ref : 5;
      _ref1 = tickValues[type](domain, numticks), ticks = _ref1.ticks, step = _ref1.step;
    }
    if (guideSpec.labels) {
      formatter = function(x) {
        var _ref2;

        return (_ref2 = guideSpec.labels[x]) != null ? _ref2 : x;
      };
    } else if (guideSpec.formatter) {
      formatter = guideSpec.formatter;
    } else {
      formatter = poly.format(type.split('-')[0], step);
    }
    tickobjs = {};
    tickfn = tickFactory(type, formatter);
    if (ticks) {
      for (i = _i = 0, _ref2 = ticks.length - 1; 0 <= _ref2 ? _i <= _ref2 : _i >= _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
        prev = i === 0 ? null : ticks[i - 1];
        next = i === ticks.length - 1 ? null : ticks[i + 1];
        t = ticks[i];
        tmpTick = tickfn(t, prev, next);
        tickobjs[tmpTick.value] = tmpTick;
      }
    }
    return {
      ticks: tickobjs,
      ticksFormatter: formatter
    };
  };

  /*
  # CLASSES & HELPERS
  */


  /*
  Tick Object.
  */


  Tick = (function() {
    function Tick(params) {
      this.location = params.location, this.value = params.value, this.index = params.index, this.evtData = params.evtData;
    }

    return Tick;

  })();

  /*
  Helper function for creating a function that creates ticks
  */


  tickFactory = function(type, formatter) {
    var i;

    i = 0;
    return function(value, prev, next) {
      var evtData;

      if (type === 'cat') {
        evtData = {
          "in": [value]
        };
      } else {
        evtData = {};
        if (prev != null) {
          evtData.ge = prev;
        }
        if (next != null) {
          evtData.le = next;
        }
      }
      return new Tick({
        location: value,
        value: formatter(value),
        index: i++,
        evtData: evtData
      });
    };
  };

  /*
  Helper function for determining the size of each "step" (distance between
  ticks) for numeric scales
  */


  getStep = function(span, numticks) {
    var error, step;

    step = Math.pow(10, Math.floor(Math.log(span / numticks) / Math.LN10));
    error = numticks / span * step;
    if (error < 0.15) {
      step *= 10;
    } else if (error <= 0.35) {
      step *= 5;
    } else if (error <= 0.75) {
      step *= 2;
    }
    return step;
  };

  /*
  Function for calculating the location of ticks.
  */


  tickValues = {
    'none': function() {
      return {};
    },
    'cat': function(domain, numticks) {
      var i, item, len, step, ticks, _i, _len, _ref;

      len = domain.levels.length;
      step = Math.max(1, Math.round(len / numticks));
      ticks = [];
      _ref = domain.levels;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        item = _ref[i];
        if (i % step === 0) {
          ticks.push(item);
        }
      }
      return {
        ticks: ticks
      };
    },
    'num': function(domain, numticks) {
      var max, min, step, ticks, tmp;

      min = domain.min, max = domain.max;
      step = getStep(max - min, numticks);
      tmp = Math.ceil(min / step) * step;
      ticks = [];
      while (tmp < max) {
        ticks.push(tmp);
        tmp += step;
      }
      return {
        ticks: ticks,
        step: Math.floor(Math.log(step) / Math.LN10)
      };
    },
    'num-log': function(domain, numticks) {
      var exp, lg, lgmax, lgmin, max, min, num, step, ticks, tmp;

      ticks = [];
      min = domain.min, max = domain.max;
      lg = function(v) {
        return Math.log(v) / Math.LN10;
      };
      exp = function(v) {
        return Math.exp(v * Math.LN10);
      };
      lgmin = Math.max(lg(min), 0);
      lgmax = lg(max);
      step = getStep(lgmax - lgmin, numticks);
      tmp = Math.ceil(lgmin / step) * step;
      while (tmp < (lgmax + poly["const"].epsilon)) {
        if (tmp % 1 !== 0 && tmp % 1 <= 0.1) {
          tmp += step;
          continue;
        } else if (tmp % 1 > poly["const"].epsilon) {
          num = Math.floor(tmp) + lg(10 * (tmp % 1));
          if (num % 1 === 0) {
            tmp += step;
            continue;
          }
        } else {
          num = tmp;
        }
        num = exp(num);
        if (num < min || num > max) {
          tmp += step;
          continue;
        }
        ticks.push(num);
        tmp += step;
      }
      return {
        ticks: ticks
      };
    },
    'date': function(domain, numticks) {
      var current, max, min, momentjsStep, step, ticks;

      min = domain.min, max = domain.max;
      step = (max - min) / numticks;
      step = step < 1.4 * 1 ? 'second' : step < 1.4 * 60 ? 'minute' : step < 1.4 * 60 * 60 ? 'hour' : step < 1.4 * 24 * 60 * 60 ? 'day' : step < 1.4 * 7 * 24 * 60 * 60 ? 'week' : step < 1.4 * 30 * 24 * 60 * 60 ? 'month' : step < 1.4 * 30 * 24 * 60 * 60 * 2 ? 'twomonth' : step < 1.4 * 30 * 24 * 60 * 60 * 4 ? 'quarter' : step < 1.4 * 30 * 24 * 60 * 60 * 6 ? 'sixmonth' : step < 1.4 * 24 * 60 * 60 * 365 ? 'year' : step < 1.4 * 24 * 60 * 60 * 365 * 2 ? 'twoyear' : step < 1.4 * 24 * 60 * 60 * 365 * 5 ? 'fiveyear' : 'decade';
      ticks = [];
      current = moment.unix(min).startOf(step);
      momentjsStep = (function() {
        switch (step) {
          case 'twomonth':
            return ['months', 2];
          case 'quarter':
            return ['months', 4];
          case 'sixmonth':
            return ['months', 6];
          case 'twoyear':
            return ['years', 2];
          case 'fiveyear':
            return ['years', 5];
          case 'decade':
            return ['years', 10];
          default:
            return [step + 's', 1];
        }
      })();
      if (current.unix() < min) {
        current.add(momentjsStep[0], momentjsStep[1]);
      }
      while (current.unix() < max) {
        ticks.push(current.unix());
        current.add(momentjsStep[0], momentjsStep[1]);
      }
      return {
        ticks: ticks,
        step: step
      };
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Title (Guide)
---------
Classes related to the generation and management of titles.

Titles are guides that is a single text: i.e. main titles and
axis & facet labels.

TODO: This is still the OLD version of Title that does not make
use of Geometry/Renderable. This is okay for now since titles are
so simple, but not scalable.
*/


(function() {
  var Title, TitleFacet, TitleH, TitleMain, TitleV, sf, _ref, _ref1, _ref2, _ref3, _ref4,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  sf = poly["const"].scaleFns;

  Title = (function(_super) {
    __extends(Title, _super);

    function Title() {
      this.render = __bind(this.render, this);
      this.make = __bind(this.make, this);      this.position = 'none';
      this.titletext = null;
      this.title = null;
    }

    Title.prototype.make = function(params) {
      var guideSpec, option, position, title, _ref,
        _this = this;

      guideSpec = params.guideSpec, title = params.title, position = params.position, this.size = params.size, this.color = params.color;
      option = function(item, def) {
        var _ref;

        return (_ref = guideSpec[item]) != null ? _ref : def;
      };
      this.titletext = option('title', title);
      this.position = (_ref = option('position', position)) != null ? _ref : this.defaultPosition;
      if (this.position === 'out') {
        return this.position = 'bottom';
      }
    };

    Title.prototype.render = function(renderer, dim, offset) {
      if (this.position !== 'none') {
        if (this.title != null) {
          renderer.remove(this.title);
        }
        return this.title = renderer.add(this._makeTitle(dim, offset), null, null, 'guide');
      } else if (this.title != null) {
        return renderer.remove(this.title);
      }
    };

    Title.prototype.dispose = function(renderer) {
      renderer.remove(this.title);
      return this.title = null;
    };

    Title.prototype._makeTitle = function() {
      throw poly.error.impl();
    };

    Title.prototype.getDimension = function() {
      var offset;

      offset = {};
      if (this.position !== 'none') {
        offset[this.position] = 10;
      }
      return offset;
    };

    return Title;

  })(poly.Guide);

  TitleH = (function(_super) {
    __extends(TitleH, _super);

    function TitleH() {
      _ref = TitleH.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TitleH.prototype.defaultPosition = 'bottom';

    TitleH.prototype._makeTitle = function(dim, offset) {
      var x, y, _ref1, _ref2, _ref3, _ref4;

      y = this.position === 'top' ? dim.paddingTop + dim.guideTop - ((_ref1 = offset.top) != null ? _ref1 : 0) - 2 : dim.height - dim.paddingBottom - dim.guideBottom + ((_ref2 = offset.bottom) != null ? _ref2 : 0);
      x = dim.paddingLeft + dim.guideLeft + (dim.width - dim.paddingLeft - dim.guideLeft - dim.paddingRight - dim.guideRight) / 2;
      return {
        type: 'text',
        x: sf.identity(x),
        y: sf.identity(y),
        color: sf.identity((_ref3 = this.color) != null ? _ref3 : 'black'),
        size: sf.identity((_ref4 = this.size) != null ? _ref4 : 12),
        text: this.titletext,
        'text-anchor': 'middle'
      };
    };

    return TitleH;

  })(Title);

  TitleV = (function(_super) {
    __extends(TitleV, _super);

    function TitleV() {
      _ref1 = TitleV.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    TitleV.prototype.defaultPosition = 'left';

    TitleV.prototype._makeTitle = function(dim, offset) {
      var x, y, _ref2, _ref3, _ref4, _ref5;

      x = this.position === 'left' ? dim.paddingLeft + dim.guideLeft - ((_ref2 = offset.left) != null ? _ref2 : 0) - 7 : dim.width - dim.paddingRight - dim.guideRight + ((_ref3 = offset.right) != null ? _ref3 : 0);
      y = dim.paddingTop + dim.guideTop + (dim.height - dim.paddingTop - dim.guideTop - dim.paddingBottom - dim.guideBottom) / 2;
      return {
        type: 'text',
        x: sf.identity(x),
        y: sf.identity(y),
        color: sf.identity((_ref4 = this.color) != null ? _ref4 : 'black'),
        size: sf.identity((_ref5 = this.size) != null ? _ref5 : 12),
        text: this.titletext,
        'text-anchor': 'middle',
        transform: 'r270'
      };
    };

    return TitleV;

  })(Title);

  TitleMain = (function(_super) {
    __extends(TitleMain, _super);

    function TitleMain() {
      _ref2 = TitleMain.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    TitleMain.prototype._makeTitle = function(dim, offset) {
      var x, y, _ref3, _ref4;

      x = dim.width / 2;
      y = 20;
      return {
        type: 'text',
        x: sf.identity(x),
        y: sf.identity(y),
        color: sf.identity((_ref3 = this.color) != null ? _ref3 : 'black'),
        size: sf.identity((_ref4 = this.size) != null ? _ref4 : 12),
        text: this.titletext,
        'font-size': '13px',
        'font-weight': 'bold',
        'text-anchor': 'middle'
      };
    };

    return TitleMain;

  })(Title);

  TitleFacet = (function(_super) {
    __extends(TitleFacet, _super);

    function TitleFacet() {
      this.render = __bind(this.render, this);
      this.make = __bind(this.make, this);      _ref3 = TitleFacet.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    TitleFacet.prototype.make = function(params) {
      var title;

      title = params.title, this.size = params.size, this.color = params.color;
      return this.titletext = title;
    };

    TitleFacet.prototype.render = function(renderer, dim, offset) {
      if (this.title != null) {
        return this.title = renderer.animate(this.title, this._makeTitle(dim, offset));
      } else {
        return this.title = renderer.add(this._makeTitle(dim, offset), null, null, 'guide');
      }
    };

    TitleFacet.prototype._makeTitle = function(dim, offset) {
      var _ref4, _ref5;

      return {
        type: 'text',
        x: sf.identity(offset.x + dim.eachWidth / 2),
        y: sf.identity(offset.y - 7),
        color: sf.identity((_ref4 = this.color) != null ? _ref4 : 'black'),
        size: sf.identity((_ref5 = this.size) != null ? _ref5 : 12),
        text: this.titletext,
        'text-anchor': 'middle'
      };
    };

    return TitleFacet;

  })(Title);

  if ((_ref4 = poly.guide) == null) {
    poly.guide = {};
  }

  poly.guide.title = function(type) {
    if (type === 'y' || type === 'r') {
      return new TitleV();
    } else if (type === 'main') {
      return new TitleMain();
    } else if (type === 'facet') {
      return new TitleFacet();
    } else {
      return new TitleH();
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Axis (Guide)
---------
Classes related to the generation and management of axes.

Like layers, Axis class (and classes that extends Guide) takes in required
input about the data domain, scales, etc and produces abstract geometrical
objects that can later be rendered using Geometry class.
*/


(function() {
  var Axes, Axis, RAxis, TAxis, XAxis, YAxis, axisColorMajor, axisColorMinor, sf, _ref, _ref1, _ref2, _ref3, _ref4,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  sf = poly["const"].scaleFns;

  axisColorMajor = '#666';

  axisColorMinor = '#EFEFEF';

  /*
  Renders and manages multiple axes, plot over multiple facets.
  */


  Axes = (function(_super) {
    __extends(Axes, _super);

    function Axes() {
      this.axesGeoms = {};
    }

    Axes.prototype.make = function(params) {
      var _ref, _ref1, _ref2, _ref3;

      this.domains = params.domains, this.coord = params.coord, this.scales = params.scales, this.specs = params.specs, this.labels = params.labels;
      return this.axes = {
        x: poly.guide.axis(this.coord.axisType('x'), {
          domain: this.domains.x,
          type: this.scales.x.tickType(),
          guideSpec: (_ref = this.specs.x) != null ? _ref : {},
          key: (_ref1 = this.labels.x) != null ? _ref1 : 'x'
        }),
        y: poly.guide.axis(this.coord.axisType('y'), {
          domain: this.domains.y,
          type: this.scales.y.tickType(),
          guideSpec: (_ref2 = this.specs.y) != null ? _ref2 : {},
          key: (_ref3 = this.labels.y) != null ? _ref3 : 'y'
        })
      };
    };

    Axes.prototype.getDimension = function(dims) {
      var axis, d, key, offset, _ref;

      offset = {};
      _ref = this.axes;
      for (key in _ref) {
        axis = _ref[key];
        d = axis.getDimension();
        if (d.position === 'left') {
          offset.left = d.width;
        } else if (d.position === 'right') {
          offset.right = d.width;
        } else if (d.position === 'bottom') {
          offset.bottom = d.height;
        } else if (d.position === 'top') {
          offset.top = d.height;
        }
      }
      return offset;
    };

    Axes.prototype.render = function(dims, renderer, facet) {
      var added, aes, axis, axisDim, deleted, drawx, drawy, indices, k, kept, key, offset, override, pts, r, type, xoverride, yoverride, _base, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;

      indices = _.keys(facet.indices);
      _ref = poly.compare(_.keys(this.axesGeoms), indices), deleted = _ref.deleted, kept = _ref.kept, added = _ref.added;
      for (_i = 0, _len = deleted.length; _i < _len; _i++) {
        key = deleted[_i];
        _ref1 = this.axesGeoms[key];
        for (type in _ref1) {
          axis = _ref1[type];
          axis.dispose(renderer());
        }
      }
      axisDim = {
        top: 0,
        left: 0,
        right: dims.eachWidth,
        bottom: dims.eachHeight,
        width: dims.eachWidth,
        height: dims.eachHeight
      };
      drawx = facet.edge(this.axes.x.position);
      drawy = facet.edge(this.axes.y.position);
      xoverride = {
        renderLabel: false,
        renderTick: false
      };
      yoverride = {
        renderLabel: false,
        renderTick: false
      };
      if (this.axes.x.type === 'r') {
        xoverride.renderLine = false;
      }
      if (this.axes.y.type === 'r') {
        yoverride.renderLine = false;
      }
      _results = [];
      for (_j = 0, _len1 = indices.length; _j < _len1; _j++) {
        key = indices[_j];
        offset = facet.getOffset(dims, key);
        if ((_ref2 = (_base = this.axesGeoms)[key]) == null) {
          _base[key] = {
            x: new poly.Geometry('guide'),
            y: new poly.Geometry('guide')
          };
        }
        r = renderer(offset, false, false);
        override = drawx(key) ? {} : xoverride;
        this.axesGeoms[key].x.set(this.axes.x.calculate(axisDim, this.coord, override));
        this.axesGeoms[key].x.render(r);
        override = drawy(key) ? {} : yoverride;
        this.axesGeoms[key].y.set(this.axes.y.calculate(axisDim, this.coord, override));
        this.axesGeoms[key].y.render(r);
        _results.push((function() {
          var _k, _len2, _ref3, _results1;

          _ref3 = ['x', 'y'];
          _results1 = [];
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
            aes = _ref3[_k];
            _results1.push((function() {
              var _ref4, _results2;

              _ref4 = this.axesGeoms[key][aes].pts;
              _results2 = [];
              for (k in _ref4) {
                pts = _ref4[k];
                if (pts.grid) {
                  _results2.push(pts.grid.toBack());
                } else {
                  _results2.push(void 0);
                }
              }
              return _results2;
            }).call(this));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Axes.prototype.dispose = function(renderer) {
      var axes, key, _ref;

      _ref = this.axesGeoms;
      for (key in _ref) {
        axes = _ref[key];
        axes.x.dispose(renderer);
        axes.y.dispose(renderer);
      }
      return this.axesGeoms = {};
    };

    return Axes;

  })(poly.GuideSet);

  /*
  Abstract class for a single axis.
  */


  Axis = (function(_super) {
    __extends(Axis, _super);

    Axis.prototype.renderTickDefault = true;

    Axis.prototype.renderGridDefault = true;

    Axis.prototype.renderLabelDefault = true;

    Axis.prototype.renderLineDefault = true;

    function Axis(params) {
      this.calculate = __bind(this.calculate, this);
      var domain, guideSpec, key, option, type, _ref, _ref1,
        _this = this;

      domain = params.domain, type = params.type, guideSpec = params.guideSpec, key = params.key;
      option = function(item, def) {
        var _ref;

        return (_ref = guideSpec[item]) != null ? _ref : def;
      };
      this.position = option('position', this.defaultPosition);
      if (_ref = this.position, __indexOf.call(this.validPositions, _ref) < 0) {
        throw poly.error.defn("X-axis position can't be " + this.position + ".");
      }
      this.titletext = option('title', key);
      this.renderTick = option('renderTick', this.renderTickDefault);
      this.renderGrid = option('renderGrid', this.renderGridDefault);
      this.renderLabel = option('renderLabel', this.renderLabelDefault);
      this.renderLine = option('renderLine', this.renderLineDefault);
      this.gridColor = option('gridColor', this.gridColor);
      _ref1 = poly.tick.make(domain, guideSpec, type), this.ticks = _ref1.ticks, this.ticksFormatter = _ref1.ticksFormatter;
      this.maxwidth = _.max(_.map(this.ticks, function(t) {
        return poly.strSize(t.value);
      }));
      this.maxwidth = Math.max(this.maxwidth, 0);
    }

    Axis.prototype.calculate = function(axisDim, coord, override) {
      var geoms, key, marks, tick, _ref, _ref1, _ref2, _ref3;

      this.coord = coord;
      if (this.position === "none") {
        return {};
      }
      if (override == null) {
        override = {};
      }
      axisDim.centerx = axisDim.left + axisDim.width / 2;
      axisDim.centery = axisDim.top + axisDim.height / 2;
      axisDim.radius = Math.min(axisDim.width, axisDim.height) / 2 - 10;
      geoms = {};
      if (this.renderLine) {
        geoms['line'] = {
          marks: {
            0: this._renderline(axisDim)
          }
        };
      }
      _ref = this.ticks;
      for (key in _ref) {
        tick = _ref[key];
        marks = {};
        if (this.renderTick && ((_ref1 = override.renderTick) != null ? _ref1 : true)) {
          marks.tick = this._makeTick(axisDim, tick);
        }
        if (this.renderLabel && ((_ref2 = override.renderLabel) != null ? _ref2 : true)) {
          marks.text = this._makeLabel(axisDim, tick);
        }
        if (this.renderGrid && ((_ref3 = override.renderGrid) != null ? _ref3 : true)) {
          marks.grid = this._makeGrid(axisDim, tick);
        }
        geoms[key] = {
          marks: marks
        };
      }
      return geoms;
    };

    Axis.prototype._makeTick = function(obj) {
      if (!obj) {
        throw poly.error.impl();
      }
      obj.type = 'path';
      obj.stroke = sf.identity(axisColorMajor);
      obj.color = sf.identity(axisColorMajor);
      return obj;
    };

    Axis.prototype._makeLabel = function(obj) {
      if (!obj) {
        throw poly.error.impl();
      }
      obj.type = 'text';
      obj.stroke = sf.identity(axisColorMajor);
      obj.color = sf.identity(axisColorMajor);
      return obj;
    };

    Axis.prototype._makeGrid = function(obj) {
      if (!obj) {
        throw poly.error.impl();
      }
      obj.stroke = this.gridColor != null ? this.gridColor : axisColorMinor;
      return obj;
    };

    return Axis;

  })(poly.Guide);

  XAxis = (function(_super) {
    __extends(XAxis, _super);

    function XAxis() {
      _ref = XAxis.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    XAxis.prototype.type = 'x';

    XAxis.prototype.renderGridDefault = false;

    XAxis.prototype.defaultPosition = 'bottom';

    XAxis.prototype.validPositions = ['top', 'bottom', 'none'];

    XAxis.prototype._renderline = function(axisDim) {
      var x1, x2, y;

      if (this.position === 'top') {
        y = sf.identity(axisDim.top);
      } else {
        y = sf.identity(axisDim.bottom);
      }
      x1 = sf.identity(axisDim.left);
      x2 = sf.identity(axisDim.left + axisDim.width);
      return {
        type: 'path',
        y: [y, y],
        x: [x1, x2],
        stroke: sf.identity(axisColorMajor)
      };
    };

    XAxis.prototype._makeTick = function(axisDim, tick) {
      var y1, y2;

      if (this.position === 'top') {
        y1 = sf.identity(axisDim.top);
        y2 = sf.identity(axisDim.top - 5);
      } else {
        y1 = sf.identity(axisDim.bottom);
        y2 = sf.identity(axisDim.bottom + 5);
      }
      return XAxis.__super__._makeTick.call(this, {
        x: [tick.location, tick.location],
        y: [y1, y2]
      });
    };

    XAxis.prototype._makeLabel = function(axisDim, tick) {
      var y;

      if (this.position === 'top') {
        y = sf.identity(axisDim.top - 15);
      } else {
        y = sf.identity(axisDim.bottom + 15);
      }
      return XAxis.__super__._makeLabel.call(this, {
        x: tick.location,
        y: y,
        text: tick.value,
        'text-anchor': 'middle'
      });
    };

    XAxis.prototype._makeGrid = function(axisDim, tick) {
      var y1, y2;

      y1 = sf.identity(axisDim.top);
      y2 = sf.identity(axisDim.bottom);
      return XAxis.__super__._makeGrid.call(this, {
        type: 'path',
        x: [tick.location, tick.location],
        y: [y1, y2]
      });
    };

    XAxis.prototype.getDimension = function() {
      var _ref1;

      return {
        position: (_ref1 = this.position) != null ? _ref1 : 'bottom',
        height: 30,
        width: 'all'
      };
    };

    return XAxis;

  })(Axis);

  YAxis = (function(_super) {
    __extends(YAxis, _super);

    function YAxis() {
      _ref1 = YAxis.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    YAxis.prototype.type = 'y';

    YAxis.prototype.renderLineDefault = false;

    YAxis.prototype.renderTickDefault = false;

    YAxis.prototype.defaultPosition = 'left';

    YAxis.prototype.validPositions = ['left', 'right', 'none'];

    YAxis.prototype._renderline = function(axisDim) {
      var x, y1, y2;

      if (this.position === 'left') {
        x = sf.identity(axisDim.left);
      } else {
        x = sf.identity(axisDim.right);
      }
      y1 = sf.identity(axisDim.top);
      y2 = sf.identity(axisDim.top + axisDim.height);
      return {
        type: 'path',
        x: [x, x],
        y: [y1, y2],
        stroke: sf.identity(axisColorMajor)
      };
    };

    YAxis.prototype._makeTick = function(axisDim, tick) {
      var x1, x2;

      if (this.position === 'left') {
        x1 = sf.identity(axisDim.left);
        x2 = sf.identity(axisDim.left - 5);
      } else {
        x1 = sf.identity(axisDim.right);
        x2 = sf.identity(axisDim.right + 5);
      }
      return YAxis.__super__._makeTick.call(this, {
        x: [x1, x2],
        y: [tick.location, tick.location]
      });
    };

    YAxis.prototype._makeLabel = function(axisDim, tick) {
      var x;

      if (this.position === 'left') {
        x = sf.identity(axisDim.left - 7);
      } else {
        x = sf.identity(axisDim.right + 7);
      }
      return YAxis.__super__._makeLabel.call(this, {
        x: x,
        y: tick.location,
        text: tick.value,
        'text-anchor': this.position === 'left' ? 'end' : 'start'
      });
    };

    YAxis.prototype._makeGrid = function(axisDim, tick) {
      var x1, x2;

      x1 = sf.identity(axisDim.left);
      x2 = sf.identity(axisDim.right);
      return YAxis.__super__._makeGrid.call(this, {
        type: 'path',
        y: [tick.location, tick.location],
        x: [x1, x2]
      });
    };

    YAxis.prototype.getDimension = function() {
      var _ref2;

      return {
        position: (_ref2 = this.position) != null ? _ref2 : 'right',
        height: 'all',
        width: 5 + this.maxwidth
      };
    };

    return YAxis;

  })(Axis);

  RAxis = (function(_super) {
    __extends(RAxis, _super);

    function RAxis() {
      _ref2 = RAxis.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    RAxis.prototype.type = 'r';

    RAxis.prototype.defaultPosition = 'left';

    RAxis.prototype.validPositions = ['left', 'right', 'none'];

    RAxis.prototype._renderline = function(axisDim) {
      var x, y1, y2;

      x = sf.identity(axisDim.left);
      y1 = sf.identity(axisDim.top);
      y2 = sf.identity(axisDim.top + axisDim.height / 2);
      return {
        type: 'path',
        x: [x, x],
        y: [y1, y2],
        stroke: sf.identity(axisColorMajor)
      };
    };

    RAxis.prototype._makeTick = function(axisDim, tick) {
      return RAxis.__super__._makeTick.call(this, {
        x: [sf.identity(axisDim.left), sf.identity(axisDim.left - 5)],
        y: [tick.location, tick.location]
      });
    };

    RAxis.prototype._makeLabel = function(axisDim, tick) {
      return RAxis.__super__._makeLabel.call(this, {
        x: sf.identity(axisDim.left - 7),
        y: tick.location,
        text: tick.value,
        'text-anchor': 'end'
      });
    };

    RAxis.prototype._makeGrid = function(axisDim, tick) {
      return RAxis.__super__._makeGrid.call(this, {
        type: 'circle',
        x: sf.identity(axisDim.centerx),
        y: sf.identity(axisDim.centery),
        size: sf.identity(this.coord.getScale('r')(tick.location)),
        color: sf.identity('none'),
        'fill-opacity': 0,
        'stroke-width': 1
      });
    };

    RAxis.prototype.getDimension = function() {
      return {
        position: 'left',
        height: 'all',
        width: 5 + this.maxwidth
      };
    };

    return RAxis;

  })(Axis);

  TAxis = (function(_super) {
    __extends(TAxis, _super);

    function TAxis() {
      _ref3 = TAxis.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    TAxis.prototype.type = 't';

    TAxis.prototype.defaultPosition = 'out';

    TAxis.prototype.validPositions = ['out', 'none'];

    TAxis.prototype._renderline = function(axisDim) {
      return {
        type: 'circle',
        x: sf.identity(axisDim.centerx),
        y: sf.identity(axisDim.centery),
        size: sf.identity(axisDim.radius),
        color: sf.identity('none'),
        stroke: sf.identity(axisColorMajor),
        'stroke-width': 1
      };
    };

    TAxis.prototype._makeTick = function(axisDim, tick) {
      return TAxis.__super__._makeTick.call(this, {
        x: [tick.location, tick.location],
        y: [sf.max(0), sf.max(3)]
      });
    };

    TAxis.prototype._makeLabel = function(axisDim, tick) {
      return TAxis.__super__._makeLabel.call(this, {
        x: tick.location,
        y: sf.max(12),
        text: tick.value,
        'text-anchor': 'middle'
      });
    };

    TAxis.prototype._makeGrid = function(axisDim, tick) {
      var theta, x1, x2, y1, y2;

      x1 = sf.identity(axisDim.centerx);
      y1 = sf.identity(axisDim.centery);
      theta = this.coord.getScale('t')(tick.location) - Math.PI / 2;
      x2 = sf.identity(axisDim.centerx + axisDim.radius * Math.cos(theta));
      y2 = sf.identity(axisDim.centery + axisDim.radius * Math.sin(theta));
      return TAxis.__super__._makeGrid.call(this, {
        type: 'path',
        y: [y1, y2],
        x: [x1, x2]
      });
    };

    TAxis.prototype.getDimension = function() {
      return {};
    };

    return TAxis;

  })(Axis);

  if ((_ref4 = poly.guide) == null) {
    poly.guide = {};
  }

  poly.guide.axis = function(type, params) {
    if (type === 'x') {
      return new XAxis(params);
    } else if (type === 'y') {
      return new YAxis(params);
    } else if (type === 'r') {
      return new RAxis(params);
    } else if (type === 't') {
      return new TAxis(params);
    }
  };

  poly.guide.axes = function(params) {
    return new Axes(params);
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Legends (Guide)
---------
Classes related to the generation and management of legends.

Legend object takes in required input and produces abstract geometrical
objects that can be rendered using the Geometry class. Legends are less
disposable compared to axes and layers, because legends themselves may be
added, removed, or modified.

Each legend assumes that it will render at coordinate (0,0). It is up to the
Legends (GuideSet) object to determine the correct position of a legend.
*/


(function() {
  var HorizontalLegend, Legend, Legends, VerticalLegend, sf, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  sf = poly["const"].scaleFns;

  poly.guide.legends = function() {
    return new Legends();
  };

  poly.guide.legend = function(aes, position) {
    if (position === 'left' || position === 'right') {
      return new VerticalLegend(aes);
    } else {
      return new HorizontalLegend(aes);
    }
  };

  Legends = (function(_super) {
    __extends(Legends, _super);

    function Legends() {
      this.legends = [];
      this.deletedLegends = [];
    }

    Legends.prototype.make = function(params) {
      var aes, aesGroups, dims, domains, guideSpec, i, idx, layerMapping, layers, legend, legenddeleted, scales, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;

      domains = params.domains, layers = params.layers, guideSpec = params.guideSpec, scales = params.scales, layerMapping = params.layerMapping, this.position = params.position, dims = params.dims;
      if ((_ref = this.postion) == null) {
        this.postion = 'right';
      }
      if (this.position === 'none') {
        return;
      }
      aesGroups = this._mergeAes(domains, layers);
      idx = 0;
      while (idx < this.legends.length) {
        legend = this.legends[idx];
        legenddeleted = true;
        i = 0;
        while (i < aesGroups.length) {
          aes = aesGroups[i];
          if (_.isEqual(aes, legend.aes)) {
            aesGroups.splice(i, 1);
            legenddeleted = false;
            break;
          }
          i++;
        }
        if (legenddeleted) {
          this.deletedLegends.push(legend);
          this.legends.splice(idx, 1);
        } else {
          idx++;
        }
      }
      for (_i = 0, _len = aesGroups.length; _i < _len; _i++) {
        aes = aesGroups[_i];
        this.legends.push(poly.guide.legend(aes, this.position));
      }
      _ref1 = this.legends;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        legend = _ref1[_j];
        aes = legend.aes[0];
        _results.push(legend.make({
          domain: domains[aes],
          position: this.position,
          guideSpec: (_ref2 = guideSpec[aes]) != null ? _ref2 : {},
          type: scales[aes].tickType(),
          mapping: layerMapping,
          keys: poly.getLabel(layers, aes),
          dims: dims
        }));
      }
      return _results;
    };

    Legends.prototype._mergeAes = function(domains, layers) {
      var aes, m, mapped, merged, merging, _i, _len;

      merging = [];
      for (aes in domains) {
        if (__indexOf.call(poly["const"].noLegend, aes) >= 0) {
          continue;
        }
        mapped = _.map(layers, function(layer) {
          return layer.mapping[aes];
        });
        if (!_.all(mapped, _.isUndefined)) {
          merged = false;
          for (_i = 0, _len = merging.length; _i < _len; _i++) {
            m = merging[_i];
            if (_.isEqual(m.mapped, mapped)) {
              m.aes.push(aes);
              merged = true;
              break;
            }
          }
          if (!merged) {
            merging.push({
              aes: [aes],
              mapped: mapped
            });
          }
        }
      }
      return _.pluck(merging, 'aes');
    };

    Legends.prototype.getDimension = function(dims) {
      var retobj, _ref, _ref1;

      retobj = {};
      if ((_ref = this.position) === 'left' || _ref === 'right') {
        retobj[this.position] = this._leftrightWidth(dims);
      } else if ((_ref1 = this.position) === 'top' || _ref1 === 'bottom') {
        retobj[this.position] = this._topbottomHeight(dims);
      }
      return retobj;
    };

    Legends.prototype._leftrightWidth = function(dims) {
      var d, legend, maxheight, maxwidth, offset, _i, _len, _ref;

      maxheight = dims.chartHeight;
      maxwidth = 0;
      offset = {
        x: 10,
        y: 0
      };
      _ref = this.legends;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        legend = _ref[_i];
        d = legend.getDimension(dims);
        if (d.height + offset.y > maxheight) {
          offset.x += maxwidth + 5;
          offset.y = 0;
          maxwidth = 0;
        }
        if (d.width > maxwidth) {
          maxwidth = d.width;
        }
        offset.y += d.height;
      }
      return offset.x + maxwidth;
    };

    Legends.prototype._topbottomHeight = function(dims) {
      var d, height, legend, maxwidth, _i, _len, _ref;

      maxwidth = dims.chartWidth;
      height = 10;
      _ref = this.legends;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        legend = _ref[_i];
        d = legend.getDimension(dims);
        height += d.height + 10;
      }
      return height;
    };

    Legends.prototype.render = function(dims, renderer, offset) {
      var legend, r, _i, _len, _ref;

      r = renderer();
      _ref = this.deletedLegends;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        legend = _ref[_i];
        legend.dispose(r);
      }
      this.deletedLegends = [];
      if (this.position === 'left' || this.position === 'right') {
        return this._renderV(dims, renderer, offset);
      } else if (this.position === 'top' || this.position === 'bottom') {
        return this._renderH(dims, renderer, offset);
      }
    };

    Legends.prototype._renderV = function(dims, renderer, offset) {
      var legend, legendDim, maxheight, maxwidth, newdim, offsetX, offsetY, realoffset, _i, _len, _ref, _results;

      legendDim = {
        top: dims.paddingTop + dims.guideTop,
        left: this.position === 'left' ? dims.paddingLeft : dims.width - dims.guideRight - dims.paddingRight
      };
      maxwidth = 0;
      maxheight = dims.height - dims.guideTop - dims.paddingTop;
      offsetY = 10;
      offsetX = this.position === 'right' ? offset.right : 0;
      _ref = this.legends;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        legend = _ref[_i];
        newdim = legend.getDimension(dims);
        if (newdim.height + offset.y > maxheight) {
          offsetX += maxwidth + 5;
          offsetY = 0;
          maxwidth = 0;
        }
        if (newdim.width > maxwidth) {
          maxwidth = newdim.width;
        }
        realoffset = {
          x: offsetX + legendDim.left,
          y: offsetY + legendDim.top
        };
        legend.render(renderer(realoffset, false, false), maxwidth);
        _results.push(offsetY += newdim.height);
      }
      return _results;
    };

    Legends.prototype._renderH = function(dims, renderer, offset) {
      var legend, legendDim, newdim, realoffset, _i, _len, _ref, _results;

      legendDim = {
        left: dims.paddingLeft,
        top: this.position === 'top' ? dims.paddingTop : dims.height - dims.guideBottom - dims.paddingBottom
      };
      realoffset = {
        x: legendDim.left,
        y: this.position === 'top' ? offset.top + legendDim.top : offset.bottom + legendDim.top + 10
      };
      _ref = this.legends;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        legend = _ref[_i];
        newdim = legend.getDimension(dims);
        legend.render(renderer(realoffset, false, false));
        _results.push(realoffset.y += newdim.height + 10);
      }
      return _results;
    };

    Legends.prototype.dispose = function(renderer) {
      var legend, _i, _len, _ref, _results;

      _ref = this.legends;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        legend = _ref[_i];
        _results.push(legend.dispose(renderer));
      }
      return _results;
    };

    return Legends;

  })(poly.GuideSet);

  Legend = (function(_super) {
    __extends(Legend, _super);

    Legend.prototype.TITLEHEIGHT = 15;

    Legend.prototype.TICKHEIGHT = 12;

    Legend.prototype.SPACING = 10;

    function Legend(aes) {
      this.aes = aes;
      this._makeEvtData = __bind(this._makeEvtData, this);
      this._makeTick = __bind(this._makeTick, this);
      this.geometry = new poly.Geometry('guide');
    }

    Legend.prototype.make = function(params) {
      var domain, guideSpec, keys, type, _, _ref, _ref1;

      domain = params.domain, type = params.type, guideSpec = params.guideSpec, this.mapping = params.mapping, this.position = params.position, keys = params.keys;
      this.titletext = (_ref = guideSpec.title) != null ? _ref : keys;
      return _ref1 = poly.tick.make(domain, guideSpec, type), this.ticks = _ref1.ticks, _ = _ref1._, _ref1;
    };

    Legend.prototype.calculate = function() {
      var evtData, geoms, key, marks, tick, _ref;

      geoms = {};
      geoms['title'] = {
        marks: {
          0: this._makeTitle(this.titletext)
        }
      };
      _ref = this.ticks;
      for (key in _ref) {
        tick = _ref[key];
        marks = {};
        marks.tick = this._makeTick(tick);
        marks.text = this._makeLabel(tick);
        evtData = this._makeEvtData(tick);
        geoms[key] = {
          marks: marks,
          evtData: evtData
        };
      }
      return geoms;
    };

    Legend.prototype.render = function(renderer) {
      this.geometry.set(this.calculate());
      return this.geometry.render(renderer);
    };

    Legend.prototype.dispose = function(renderer) {
      return this.geometry.dispose(renderer);
    };

    Legend.prototype._makeTitle = function(text, offset) {
      if (offset == null) {
        offset = {
          x: 0,
          y: 0
        };
      }
      return {
        type: 'text',
        x: sf.identity(offset.x + 5),
        y: sf.identity(offset.y),
        color: sf.identity('black'),
        text: text,
        'text-anchor': 'start'
      };
    };

    Legend.prototype._makeLabel = function(tick, offset) {
      if (!offset) {
        offset = {
          x: 0,
          y: 15 + tick.index * 12
        };
      }
      return {
        type: 'text',
        x: sf.identity(offset.x + 20),
        y: sf.identity(offset.y + 1),
        color: sf.identity('black'),
        text: tick.value,
        'text-anchor': 'start'
      };
    };

    Legend.prototype._makeTick = function(tick, offset) {
      var aes, obj, value, _ref;

      if (!offset) {
        offset = {
          x: 0,
          y: 15 + tick.index * 12
        };
      }
      obj = {
        type: 'circle',
        x: sf.identity(offset.x + 10),
        y: sf.identity(offset.y),
        color: sf.identity('steelblue')
      };
      _ref = this.mapping;
      for (aes in _ref) {
        value = _ref[aes];
        if (__indexOf.call(poly["const"].noLegend, aes) >= 0) {
          continue;
        }
        value = value[0];
        if (__indexOf.call(this.aes, aes) >= 0) {
          obj[aes] = tick.location;
        } else if ((value.type != null) && value.type === 'const') {
          obj[aes] = sf.identity(value.value);
        } else if (!_.isObject(value)) {
          obj[aes] = sf.identity(value);
        } else {
          obj[aes] = sf.identity(poly["const"].defaults[aes]);
        }
      }
      if (_.isObject(obj.size)) {
        obj.size = sf.identity(5);
      }
      return obj;
    };

    Legend.prototype._makeEvtData = function(tick) {
      var aes, evtData, v, value, _i, _len, _ref;

      evtData = {};
      _ref = this.mapping;
      for (aes in _ref) {
        value = _ref[aes];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          v = value[_i];
          if (__indexOf.call(this.aes, aes) >= 0 && v.type === 'map') {
            evtData[v.value] = tick.evtData;
          }
        }
      }
      return evtData;
    };

    return Legend;

  })(poly.Guide);

  VerticalLegend = (function(_super) {
    __extends(VerticalLegend, _super);

    function VerticalLegend() {
      _ref = VerticalLegend.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    VerticalLegend.prototype.make = function(params) {
      var tickWidth, titleWidth;

      VerticalLegend.__super__.make.call(this, params);
      this.height = this.TITLEHEIGHT + this.SPACING + this.TICKHEIGHT * _.size(this.ticks);
      titleWidth = poly.strSize(this.titletext);
      tickWidth = _.max(_.map(this.ticks, function(t) {
        return poly.strSize(t.value);
      }));
      return this.maxwidth = Math.max(titleWidth, tickWidth);
    };

    VerticalLegend.prototype.getDimension = function() {
      return {
        position: this.position,
        height: this.height,
        width: 15 + this.maxwidth
      };
    };

    return VerticalLegend;

  })(Legend);

  HorizontalLegend = (function(_super) {
    __extends(HorizontalLegend, _super);

    function HorizontalLegend() {
      _ref1 = HorizontalLegend.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    HorizontalLegend.prototype.TICKSPACING = 25;

    HorizontalLegend.prototype.make = function(params) {
      var currWidth, t, width, _i, _len, _ref2;

      HorizontalLegend.__super__.make.call(this, params);
      this.maxwidth = params.dims.width;
      this.height = this.TITLEHEIGHT + this.SPACING;
      width = 0;
      this.height += this.TICKHEIGHT;
      _ref2 = this.ticks;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        t = _ref2[_i];
        currWidth = poly.strSize(t.value) + this.TICKSPACING;
        if ((width + currWidth) < this.maxwidth) {
          width += currWidth;
        } else {
          this.height += this.TICKHEIGHT;
          width = currWidth;
        }
      }
      return null;
    };

    HorizontalLegend.prototype.calculate = function() {
      var currWidth, evtData, geoms, key, marks, offset, tick, _ref2;

      geoms = {};
      geoms['title'] = {
        marks: {
          0: this._makeTitle(this.titletext)
        }
      };
      offset = {
        x: 0,
        y: this.TITLEHEIGHT
      };
      _ref2 = this.ticks;
      for (key in _ref2) {
        tick = _ref2[key];
        marks = {};
        marks.tick = this._makeTick(tick, offset);
        marks.text = this._makeLabel(tick, offset);
        evtData = this._makeEvtData(tick, offset);
        geoms[key] = {
          marks: marks,
          evtData: evtData
        };
        currWidth = poly.strSize(tick.value) + this.TICKSPACING;
        if ((offset.x + currWidth) < this.maxwidth) {
          offset.x += currWidth;
        } else {
          offset.x = 0;
          offset.y += this.TICKHEIGHT;
        }
      }
      return geoms;
    };

    HorizontalLegend.prototype.getDimension = function() {
      return {
        position: this.position,
        height: this.height,
        width: 'all'
      };
    };

    return HorizontalLegend;

  })(Legend);

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Scales
------
Scales are objects that can construct functions that takes a value from
the data, and returns another value that is suitable for rendering an
attribute of that value.
*/


(function() {
  var Area, CustomScale, Gradient, Gradient2, Identity, Linear, Log, Opacity, Palette, PositionScale, Scale, Shape, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Scale = (function() {
    function Scale(params) {
      this.f = null;
    }

    Scale.prototype.make = function(domain) {
      this.domain = domain;
      this.compare = poly.domain.compare(domain);
      if (!domain) {
        return this._makeNone();
      }
      switch (domain.type) {
        case 'num':
          return this._makeNum();
        case 'date':
          return this._makeDate();
        case 'cat':
          return this._makeCat();
      }
    };

    Scale.prototype._makeNone = function() {
      throw poly.error.impl("You are using a scale that does not support null values");
    };

    Scale.prototype._makeNum = function() {
      throw poly.error.impl("You are using a scale that does not support numbers");
    };

    Scale.prototype._makeDate = function() {
      throw poly.error.impl("You are using a scale that does not support dates");
    };

    Scale.prototype._makeCat = function() {
      throw poly.error.impl("You are using a scale that does not support categories");
    };

    Scale.prototype.tickType = function() {
      if (!this.domain) {
        return this._tickNone();
      }
      switch (this.domain.type) {
        case 'num':
          return this._tickNum();
        case 'date':
          return this._tickDate();
        case 'cat':
          return this._tickCat();
      }
    };

    Scale.prototype._tickNone = function() {
      return 'none';
    };

    Scale.prototype._tickNum = function() {
      return 'num';
    };

    Scale.prototype._tickDate = function() {
      return 'date';
    };

    Scale.prototype._tickCat = function() {
      return 'cat';
    };

    Scale.prototype._identityWrapper = function(y) {
      return function(x) {
        if (_.isObject(x) && x.t === 'scalefn') {
          if (x.f === 'identity') {
            return x.v;
          }
        }
        return y(x);
      };
    };

    return Scale;

  })();

  /*
  Position Scales for the x- and y-axes
  */


  PositionScale = (function(_super) {
    __extends(PositionScale, _super);

    function PositionScale(params) {
      this._catWrapper = __bind(this._catWrapper, this);
      this._dateWrapper = __bind(this._dateWrapper, this);
      this._numWrapper = __bind(this._numWrapper, this);      this.f = null;
      this.finv = null;
    }

    PositionScale.prototype.make = function(domain, range, space) {
      this.range = range;
      this.space = space;
      if (!_.isNumber(this.space)) {
        this.space = 0.05;
      }
      return PositionScale.__super__.make.call(this, domain);
    };

    PositionScale.prototype._makeNone = function() {
      var space,
        _this = this;

      space = (this.range.max - this.range.min) * this.space;
      this.f = this._NaNCheckWrap(function(value) {
        var width;

        if (_.isObject(value)) {
          if (value.f === 'identity') {
            return value.v;
          }
          if (value.f === 'middle') {
            return _this.range.max / 2 + _this.range.min / 2;
          }
          if (value.f === 'max') {
            return _this.range.max;
          }
          if (value.f === 'min') {
            return _this.range.min;
          }
          if (value.f === 'upper' && !value.m) {
            return _this.range.max - space;
          }
          if (value.f === 'lower' && !value.m) {
            return _this.range.min + space;
          }
          width = (_this.range.max - _this.range.min - 2 * space) / value.m;
          if (value.f === 'upper') {
            return (_this.range.min + space) + (value.n + 1) * width;
          }
          if (value.f === 'lower') {
            return (_this.range.min + space) + value.n * width;
          }
        }
        return _this.range.max / 2 + _this.range.min / 2;
      });
      return this.finv = function() {
        return {};
      };
    };

    PositionScale.prototype._NaNCheckWrap = function(fn) {
      return function(value) {
        var out;

        if (!poly.isDefined(value)) {
          return void 0;
        } else {
          out = fn(value);
          if (isNaN(out) || out === Infinity || out === -Infinity) {
            throw poly.error.scale("Scale outputed a value that is not finite.");
          }
          return out;
        }
      };
    };

    PositionScale.prototype._numWrapper = function(domain, y) {
      var _this = this;

      return this._NaNCheckWrap(function(value) {
        var lower, space, upper, width, _ref;

        if (_.isObject(value)) {
          if (value.t === 'scalefn') {
            if (value.f === 'identity') {
              return value.v;
            }
            if (value.f === 'middle') {
              return y(value.v + domain.bw / 2);
            }
            if (value.f === 'max') {
              return _this.range.max + value.v;
            }
            if (value.f === 'min') {
              return _this.range.min + value.v;
            }
            if ((_ref = value.f) === 'upper' || _ref === 'lower') {
              upper = y(value.v + domain.bw);
              lower = y(value.v);
              space = (upper - lower) * _this.space;
              if (value.f === 'upper' && !value.m) {
                return upper - space;
              }
              if (value.f === 'lower' && !value.m) {
                return lower + space;
              }
              width = (upper - lower - 2 * space) / value.m;
              if (value.f === 'upper') {
                return (lower + space) + (value.n + 1) * width;
              }
              if (value.f === 'lower') {
                return (lower + space) + value.n * width;
              }
            }
          }
          throw poly.error.input("Unknown object " + value + " is passed to a scale");
        }
        return y(value);
      });
    };

    PositionScale.prototype._dateWrapper = function(domain, y) {
      var _this = this;

      return this._NaNCheckWrap(function(value) {
        var lower, space, upper, width, _ref, _timeConversion;

        if (_.isObject(value)) {
          if (value.t === 'scalefn') {
            if (value.f === 'identity') {
              return value.v;
            }
            if (value.f === 'max') {
              return _this.range.max + value.v;
            }
            if (value.f === 'min') {
              return _this.range.min + value.v;
            }
            if ((_ref = value.f) === 'upper' || _ref === 'middle' || _ref === 'lower') {
              _timeConversion = function(n, timerange, lower) {
                var m;

                if (lower == null) {
                  lower = 0;
                }
                m = moment.unix(value.v).startOf(timerange);
                m[timerange](n * Math.floor(m[timerange]() / n) + n * lower);
                return m.unix();
              };
              upper = (function() {
                switch (domain.bw) {
                  case 'week':
                    return moment.unix(value.v).day(7).unix();
                  case 'twomonth':
                    return _timeConversion(2, 'month');
                  case 'quarter':
                    return _timeConversion(4, 'month');
                  case 'sixmonth':
                    return _timeConversion(6, 'month');
                  case 'twoyear':
                    return _timeConversion(2, 'year');
                  case 'fiveyear':
                    return _timeConversion(5, 'year');
                  case 'decade':
                    return _timeConversion(10, 'year');
                  default:
                    return moment.unix(value.v).endOf(domain.bw).unix();
                }
              })();
              upper = y(upper);
              lower = (function() {
                switch (domain.bw) {
                  case 'week':
                    return moment.unix(value.v).day(0).unix();
                  case 'twomonth':
                    return _timeConversion(2, 'month', 1);
                  case 'quarter':
                    return _timeConversion(4, 'month', 1);
                  case 'sixmonth':
                    return _timeConversion(6, 'month', 1);
                  case 'twoyear':
                    return _timeConversion(2, 'year', 1);
                  case 'fiveyear':
                    return _timeConversion(5, 'year', 1);
                  case 'decade':
                    return _timeConversion(10, 'year', 1);
                  default:
                    return moment.unix(value.v).startOf(domain.bw).unix();
                }
              })();
              lower = y(lower);
              space = (upper - lower) * _this.space;
              if (value.f === 'middle') {
                return upper / 2 + lower / 2;
              }
              if (value.f === 'upper' && !value.m) {
                return upper - space;
              }
              if (value.f === 'lower' && !value.m) {
                return lower + space;
              }
              width = (upper - lower - 2 * space) / value.m;
              if (value.f === 'upper') {
                return (lower + space) + (value.n + 1) * width;
              }
              if (value.f === 'lower') {
                return (lower + space) + value.n * width;
              }
            }
          }
          throw poly.error.input("Unknown object " + value + " is passed to a scale");
        }
        return y(value);
      });
    };

    PositionScale.prototype._catWrapper = function(step, y) {
      var _this = this;

      return this._NaNCheckWrap(function(value) {
        var lower, space, upper, width, _ref;

        space = step * _this.space;
        if (_.isObject(value)) {
          if (value.t === 'scalefn') {
            if (value.f === 'identity') {
              return value.v;
            }
            if (value.f === 'max') {
              return _this.range.max + value.v;
            }
            if (value.f === 'min') {
              return _this.range.min + value.v;
            }
            if ((_ref = value.f) === 'upper' || _ref === 'middle' || _ref === 'lower') {
              upper = y(value.v) + step;
              lower = y(value.v);
              if (value.f === 'middle') {
                return upper / 2 + lower / 2;
              }
              if (value.f === 'upper' && !value.m) {
                return upper - space;
              }
              if (value.f === 'lower' && !value.m) {
                return lower + space;
              }
              width = (upper - lower - 2 * space) / value.m;
              if (value.f === 'upper') {
                return (lower + space) + (value.n + 1) * width;
              }
              if (value.f === 'lower') {
                return (lower + space) + value.n * width;
              }
            }
          }
          throw poly.error.input("Unknown object " + value + " is passed to a scale");
        }
        return y(value) + step / 2;
      });
    };

    return PositionScale;

  })(Scale);

  Linear = (function(_super) {
    __extends(Linear, _super);

    function Linear() {
      _ref = Linear.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Linear.prototype._makeNum = function() {
      var x, y;

      y = poly.linear(this.domain.min, this.range.min, this.domain.max, this.range.max);
      x = poly.linear(this.range.min, this.domain.min, this.range.max, this.domain.max);
      this.f = this._numWrapper(this.domain, y);
      return this.finv = function(y1, y2) {
        var xs;

        xs = [x(y1), x(y2)];
        return {
          ge: _.min(xs),
          le: _.max(xs)
        };
      };
    };

    Linear.prototype._makeDate = function() {
      var x, y;

      y = poly.linear(this.domain.min, this.range.min, this.domain.max, this.range.max);
      x = poly.linear(this.range.min, this.domain.min, this.range.max, this.domain.max);
      this.f = this._dateWrapper(this.domain, y);
      return this.finv = function(y1, y2) {
        var xs;

        xs = [x(y1), x(y2)];
        return {
          ge: _.min(xs),
          le: _.max(xs)
        };
      };
    };

    Linear.prototype._makeCat = function() {
      var step, x, y,
        _this = this;

      step = (this.range.max - this.range.min) / this.domain.levels.length;
      y = function(x) {
        var i;

        i = _.indexOf(_this.domain.levels, x);
        if (i === -1) {
          return null;
        } else {
          return _this.range.min + i * step;
        }
      };
      x = function(y1, y2) {
        var i1, i2, _ref1;

        if (y2 < y1) {
          _ref1 = [y2, y1], y1 = _ref1[0], y2 = _ref1[1];
        }
        i1 = Math.floor(y1 / step);
        i2 = Math.floor(y2 / step);
        return {
          "in": _this.domain.levels.slice(i1, +i2 + 1 || 9e9)
        };
      };
      this.f = this._catWrapper(step, y);
      return this.finv = x;
    };

    return Linear;

  })(PositionScale);

  Log = (function(_super) {
    __extends(Log, _super);

    function Log() {
      _ref1 = Log.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Log.prototype._makeNum = function() {
      var lg, x, ylin, ylininv;

      if (this.domain.min < 0) {
        throw poly.error.input("Log scale cannot handle zero or negative input.");
      }
      lg = Math.log;
      ylin = poly.linear(lg(this.domain.min), this.range.min, lg(this.domain.max), this.range.max);
      this.f = this._numWrapper(this.domain, function(x) {
        return ylin(lg(x));
      });
      ylininv = poly.linear(this.range.min, lg(this.domain.min), this.range.max, lg(this.domain.max));
      x = function(y) {
        return Math.exp(ylininv(y));
      };
      return this.finv = function(y1, y2) {
        var xs;

        xs = [x(y1), x(y2)];
        return {
          ge: _.min(xs),
          le: _.max(xs)
        };
      };
    };

    Log.prototype._tickNum = function() {
      return 'num-log';
    };

    return Log;

  })(PositionScale);

  /*
  Other, legend-type scales for the x- and y-axes
  */


  Area = (function(_super) {
    __extends(Area, _super);

    function Area() {
      this._makeDate = __bind(this._makeDate, this);
      this._makeNum = __bind(this._makeNum, this);      _ref2 = Area.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Area.prototype._makeNum = function() {
      var min, sq, ylin;

      min = this.domain.min === 0 ? 0 : 1;
      sq = Math.sqrt;
      ylin = poly.linear(sq(this.domain.min), min, sq(this.domain.max), 10);
      return this.f = this._identityWrapper(function(x) {
        return ylin(sq(x));
      });
    };

    Area.prototype._makeDate = function() {
      return this._makeNum();
    };

    return Area;

  })(Scale);

  Opacity = (function(_super) {
    __extends(Opacity, _super);

    function Opacity() {
      this._makeDate = __bind(this._makeDate, this);
      this._makeNum = __bind(this._makeNum, this);      _ref3 = Opacity.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Opacity.prototype._makeNum = function() {
      var max, min;

      min = this.domain.min === 0 ? 0 : 0.1;
      max = 1;
      return this.f = this._identityWrapper(poly.linear(this.domain.min, min, this.domain.max, max));
    };

    Opacity.prototype._makeDate = function() {
      return this._makeNum();
    };

    return Opacity;

  })(Scale);

  Palette = (function(_super) {
    __extends(Palette, _super);

    function Palette() {
      this._makeCat = __bind(this._makeCat, this);      _ref4 = Palette.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Palette.prototype._makeCat = function() {
      var colors, h, n,
        _this = this;

      n = this.domain.levels.length;
      if (n <= 9) {
        colors = ["#E41A1C", "#377EB8", "#4DAF4A", "#984EA3", "#FF7F00", "#FFFF33", "#A65628", "#F781BF", "#999999"];
        return this.f = function(value) {
          var i;

          i = _.indexOf(_this.domain.levels, value);
          return colors[i];
        };
      } else {
        h = function(v) {
          return _.indexOf(_this.domain.levels, v) / n + 1 / (2 * n);
        };
        return this.f = function(value) {
          return Raphael.hsl(h(value), 0.5, 0.5);
        };
      }
    };

    return Palette;

  })(Scale);

  Gradient = (function(_super) {
    __extends(Gradient, _super);

    function Gradient(params) {
      this._makeDate = __bind(this._makeDate, this);
      this._makeNum = __bind(this._makeNum, this);      this.lower = params.lower, this.upper = params.upper;
    }

    Gradient.prototype._makeNum = function() {
      var b, g, lower, r, upper,
        _this = this;

      lower = Raphael.color(this.lower);
      upper = Raphael.color(this.upper);
      r = poly.linear(this.domain.min, lower.r, this.domain.max, upper.r);
      g = poly.linear(this.domain.min, lower.g, this.domain.max, upper.g);
      b = poly.linear(this.domain.min, lower.b, this.domain.max, upper.b);
      return this.f = this._identityWrapper(function(value) {
        return Raphael.rgb(r(value), g(value), b(value));
      });
    };

    Gradient.prototype._makeDate = function() {
      return this._makeNum();
    };

    return Gradient;

  })(Scale);

  Gradient2 = (function(_super) {
    __extends(Gradient2, _super);

    function Gradient2(params) {
      this._makeDate = __bind(this._makeDate, this);
      this._makeCat = __bind(this._makeCat, this);
      this._makeNum = __bind(this._makeNum, this);
      var _ref5;

      this.lower = params.lower, this.middle = params.middle, this.upper = params.upper, this.midpoint = params.midpoint;
      if ((_ref5 = this.midpoint) == null) {
        this.midpoint = 0;
      }
    }

    Gradient2.prototype._makeNum = function() {
      var b1, b2, g1, g2, lower, middle, r1, r2, upper,
        _this = this;

      lower = Raphael.color(this.lower);
      middle = Raphael.color(this.middle);
      upper = Raphael.color(this.upper);
      r1 = poly.linear(this.domain.min, lower.r, this.midpoint, middle.r);
      g1 = poly.linear(this.domain.min, lower.g, this.midpoint, middle.g);
      b1 = poly.linear(this.domain.min, lower.b, this.midpoint, middle.b);
      r2 = poly.linear(this.midpoint, middle.r, this.domain.max, upper.r);
      g2 = poly.linear(this.midpoint, middle.g, this.domain.max, upper.g);
      b2 = poly.linear(this.midpoint, middle.b, this.domain.max, upper.b);
      return this.f = this._identityWrapper(function(value) {
        if (value < _this.midpoint) {
          return Raphael.rgb(r1(value), g1(value), b1(value));
        } else {
          return Raphael.rgb(r2(value), g2(value), b2(value));
        }
      });
    };

    Gradient2.prototype._makeCat = function() {};

    Gradient2.prototype._makeDate = function() {
      return this._makeNum();
    };

    return Gradient2;

  })(Scale);

  CustomScale = (function(_super) {
    __extends(CustomScale, _super);

    function CustomScale(params) {
      this["function"] = params["function"];
    }

    CustomScale.prototype.make = function(domain) {
      this.domain = domain;
      this.compare = poly.domain.compare(domain);
      return this.f = this._identityWrapper(this["function"]);
    };

    return CustomScale;

  })(Scale);

  Shape = (function(_super) {
    __extends(Shape, _super);

    function Shape() {
      _ref5 = Shape.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    Shape.prototype._makeCat = function() {};

    return Shape;

  })(Scale);

  Identity = (function(_super) {
    __extends(Identity, _super);

    function Identity() {
      _ref6 = Identity.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    Identity.prototype.make = function(domain) {
      this.domain = domain;
      this.compare = function(a, b) {
        return 0;
      };
      return this.f = this._identityWrapper(function(x) {
        return x;
      });
    };

    return Identity;

  })(Scale);

  /*
  Public interface to making different scales
  */


  poly.scale = {};

  poly.scale.Base = Scale;

  poly.scale.classes = {
    linear: Linear,
    log: Log,
    area: Area,
    palette: Palette,
    gradient: Gradient,
    gradient2: Gradient2,
    identity: Identity,
    opacity: Opacity,
    custom: CustomScale
  };

  poly.scale.make = function(spec) {
    var type;

    type = spec.type;
    if (type in poly.scale.classes) {
      return new poly.scale.classes[type](spec);
    }
    throw poly.error.defn("No such scale " + spec.type + ".");
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
(function() {
  var ScaleSet, typeError,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  poly.scaleset = function(guideSpec, domains, ranges) {
    return new ScaleSet(guideSpec, domains, ranges);
  };

  ScaleSet = (function() {
    function ScaleSet(tmpRanges, coord) {
      this.coord = coord;
      this.ranges = tmpRanges;
      this.axes = poly.guide.axes();
      this.legends = poly.guide.legends();
    }

    ScaleSet.prototype.make = function(guideSpec, domains, layers) {
      this.guideSpec = guideSpec;
      this.layers = layers;
      this.domains = domains;
      this.scales = this._makeScales(guideSpec, domains, this.ranges);
      this.reverse = {
        x: this.scales.x.finv,
        y: this.scales.y.finv
      };
      return this.layerMapping = this._mapLayers(layers);
    };

    ScaleSet.prototype.setRanges = function(ranges) {
      var aes, _i, _len, _ref, _results;

      this.ranges = ranges;
      _ref = ['x', 'y'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        aes = _ref[_i];
        _results.push(this.scales[aes].make(this.domains[aes], this.ranges[aes], this.getSpec(aes).padding));
      }
      return _results;
    };

    ScaleSet.prototype._makeScales = function(guideSpec, domains, ranges) {
      var defaultSpec, scales, specScale;

      specScale = function(a) {
        var possibleScales, _ref;

        if (guideSpec && (guideSpec[a] != null) && (guideSpec[a].scale != null)) {
          if (_.isFunction(guideSpec[a].scale)) {
            return {
              type: 'custom',
              "function": guideSpec[a].scale
            };
          } else {
            switch (a) {
              case 'x':
                possibleScales = ['linear', 'log'];
                break;
              case 'y':
                possibleScales = ['linear', 'log'];
                break;
              case 'color':
                possibleScales = ['palette', 'gradient', 'gradient2'];
                break;
              case 'size':
                possibleScales = ['linear', 'log'];
                break;
              case 'opacity':
                possibleScales = ['opacity'];
                break;
              case 'shape':
                possibleScales = ['linear', 'log', 'area'];
                break;
              case 'id':
                possibleScales = ['identity'];
                break;
              case 'text':
                possibleScales = ['identity'];
                break;
              default:
                possibleScales = [];
            }
            if (_ref = guideSpec[a].scale.type, __indexOf.call(possibleScales, _ref) >= 0) {
              return guideSpec[a].scale;
            } else {
              throw poly.error.scale("Aesthetic " + a + " cannot have scale " + guideSpec[a].scale.type);
            }
          }
        } else {
          return null;
        }
      };
      scales = {};
      scales.x = poly.scale.make(specScale('x') || {
        type: 'linear'
      });
      scales.x.make(domains.x, ranges.x, this.getSpec('x').padding);
      scales.y = poly.scale.make(specScale('y') || {
        type: 'linear'
      });
      scales.y.make(domains.y, ranges.y, this.getSpec('y').padding);
      if (domains.color != null) {
        if (domains.color.type === 'cat') {
          scales.color = poly.scale.make(specScale('color') || {
            type: 'palette'
          });
        } else {
          defaultSpec = {
            type: 'gradient',
            upper: 'steelblue',
            lower: 'red'
          };
          scales.color = poly.scale.make(specScale('color') || defaultSpec);
        }
        scales.color.make(domains.color);
      }
      if (domains.size != null) {
        scales.size = poly.scale.make(specScale('size') || {
          type: 'area'
        });
        scales.size.make(domains.size);
      }
      if (domains.opacity != null) {
        scales.opacity = poly.scale.make(specScale('opacity') || {
          type: 'opacity'
        });
        scales.opacity.make(domains.opacity);
      }
      scales.text = poly.scale.make({
        type: 'identity'
      });
      scales.text.make();
      return scales;
    };

    ScaleSet.prototype.fromPixels = function(start, end) {
      var map, obj, x, y, _i, _j, _len, _len1, _ref, _ref1, _ref2;

      if ((start != null) && (end != null)) {
        _ref = this.coord.getAes(start, end, this.reverse), x = _ref.x, y = _ref.y;
      }
      obj = {};
      _ref1 = this.layerMapping.x;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        map = _ref1[_i];
        if ((map.type != null) && map.type === 'map') {
          obj[map.value] = x != null ? x : null;
        }
      }
      _ref2 = this.layerMapping.y;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        map = _ref2[_j];
        if ((map.type != null) && map.type === 'map') {
          obj[map.value] = y != null ? y : null;
        }
      }
      return obj;
    };

    ScaleSet.prototype.getSpec = function(a) {
      if ((this.guideSpec != null) && (this.guideSpec[a] != null)) {
        return this.guideSpec[a];
      } else {
        return {};
      }
    };

    ScaleSet.prototype.makeGuides = function(spec, dims) {
      var _ref, _ref1;

      this.makeAxes();
      this.makeTitles((_ref = spec.title) != null ? _ref : '');
      this.makeLegends((_ref1 = spec.legendPosition) != null ? _ref1 : 'right', dims);
      return {
        axes: this.axes,
        legends: this.legends,
        title: this.title
      };
    };

    ScaleSet.prototype.renderGuides = function(dims, renderer, facet) {
      this.axes.render(dims, renderer, facet);
      this.renderTitles(dims, renderer);
      return this.renderLegends(dims, renderer);
    };

    ScaleSet.prototype.disposeGuides = function(renderer) {
      this.axes.dispose(renderer);
      this.legends.dispose(renderer);
      this.titles.x.dispose(renderer);
      this.titles.y.dispose(renderer);
      this.titles.main.dispose(renderer);
      return this.titles = {};
    };

    ScaleSet.prototype.makeTitles = function(maintitle) {
      var _ref;

      if ((_ref = this.titles) == null) {
        this.titles = {
          x: poly.guide.title(this.coord.axisType('x')),
          y: poly.guide.title(this.coord.axisType('y')),
          main: poly.guide.title('main')
        };
      }
      this.titles.main.make({
        title: maintitle,
        guideSpec: {},
        position: "top"
      });
      this.titles.x.make({
        guideSpec: this.getSpec('x'),
        title: poly.getLabel(this.layers, 'x')
      });
      return this.titles.y.make({
        guideSpec: this.getSpec('y'),
        title: poly.getLabel(this.layers, 'y')
      });
    };

    ScaleSet.prototype.titleOffset = function(dim) {
      var dir, key, o, offset, title, _i, _len, _ref, _ref1, _ref2;

      offset = {};
      _ref = this.titles;
      for (key in _ref) {
        title = _ref[key];
        o = title.getDimension();
        _ref1 = ['left', 'right', 'top', ' bottom'];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          dir = _ref1[_i];
          if (o[dir]) {
            if ((_ref2 = offset[dir]) == null) {
              offset[dir] = 0;
            }
            offset[dir] += o[dir];
          }
        }
      }
      return offset;
    };

    ScaleSet.prototype.renderTitles = function(dims, renderer) {
      var o;

      renderer = renderer({}, false, false);
      o = this.axesOffset(dims);
      this.titles.x.render(renderer, dims, o);
      this.titles.y.render(renderer, dims, o);
      return this.titles.main.render(renderer, dims, o);
    };

    ScaleSet.prototype.makeAxes = function() {
      var _ref;

      return this.axes.make({
        domains: {
          x: this.domains.x,
          y: this.domains.y
        },
        coord: this.coord,
        scales: this.scales,
        specs: (_ref = this.guideSpec) != null ? _ref : {},
        labels: {
          x: poly.getLabel(this.layers, 'x'),
          y: poly.getLabel(this.layers, 'y')
        }
      });
    };

    ScaleSet.prototype.axesOffset = function(dims) {
      return this.axes.getDimension(dims);
    };

    ScaleSet.prototype._mapLayers = function(layers) {
      var aes, obj, _i, _len, _ref;

      obj = {};
      _ref = poly["const"].aes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        aes = _ref[_i];
        obj[aes] = _.map(layers, function(layer) {
          if (layer.mapping[aes] != null) {
            return {
              type: 'map',
              value: layer.mapping[aes]
            };
          } else if (layer.consts[aes] != null) {
            return {
              type: 'const',
              value: layer.consts[aes]
            };
          } else {
            return layer.defaults[aes];
          }
        });
      }
      return obj;
    };

    ScaleSet.prototype.makeLegends = function(position, dims) {
      if (position == null) {
        position = 'right';
      }
      return this.legends.make({
        domains: this.domains,
        layers: this.layers,
        guideSpec: this.guideSpec,
        scales: this.scales,
        layerMapping: this.layerMapping,
        position: position,
        dims: dims
      });
    };

    ScaleSet.prototype.legendOffset = function(dims) {
      return this.legends.getDimension(dims);
    };

    ScaleSet.prototype.renderLegends = function(dims, renderer) {
      var axesOffset, dir, offset, titleOffset, _i, _len, _ref, _ref1, _ref2;

      offset = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      };
      axesOffset = this.axesOffset(dims);
      titleOffset = this.titleOffset(dims);
      _ref = ['left', 'right', 'top', 'bottom'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dir = _ref[_i];
        offset[dir] += (_ref1 = axesOffset[dir]) != null ? _ref1 : 0;
        offset[dir] += (_ref2 = titleOffset[dir]) != null ? _ref2 : 0;
      }
      return this.legends.render(dims, renderer, offset);
    };

    return ScaleSet;

  })();

  typeError = function(msg) {
    return msg;
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Data Object
---------
Polychart wrapper around a data set. This is contains the data structure
required for poly.chart().  Data object that either contains JSON format
of a dataset, or knows how to retrieve data from some source.
*/


(function() {
  var AbstractData, ApiData, BackendData, FrontendData, _getArray, _getArrayOfArrays, _getCSV, _getDataType, _getObject,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  poly.data = function(blob) {
    var data, meta, type;

    type = void 0;
    data = void 0;
    meta = void 0;
    if (_.isObject(blob) && _.keys(blob).length < 4 && 'data' in blob) {
      data = blob.data;
      meta = blob.meta;
    } else {
      data = blob;
    }
    switch (_getDataType(data)) {
      case 'json-object':
      case 'json-grid':
      case 'json-array':
        return poly.data.json(data, meta, type);
      case 'url':
        return poly.data.url(data, meta, type);
      case 'csv':
        return poly.data.csv(data, meta);
      case 'api':
        return poly.data.api(data);
      default:
        throw poly.error.data("Unknown data format.");
    }
  };

  poly.data.json = function(data, meta, type) {
    return new FrontendData({
      data: data,
      meta: meta,
      type: type
    });
  };

  poly.data.csv = function(data, meta) {
    return new FrontendData({
      data: data,
      meta: meta,
      'csv': 'csv'
    });
  };

  poly.data.url = function(url, computeBackend, limit) {
    return new BackendData({
      url: url,
      computeBackend: computeBackend,
      limit: limit
    });
  };

  /*
  Data format which takes an API-facing function.
  
  Signature:
  poly.data.api =
   ((requestParams, (err, result) -> undefined) -> undefined) -> polyjsData
  */


  poly.data.api = function(apiFun) {
    return new ApiData({
      apiFun: apiFun
    });
  };

  /*
  Helper functions
  */


  _getDataType = function(data) {
    if (_.isArray(data)) {
      if (_.isArray(data[0])) {
        return 'json-grid';
      } else {
        return 'json-array';
      }
    } else if (_.isObject(data)) {
      return 'json-object';
    } else if (_.isString(data)) {
      if (poly.isURI(data)) {
        return 'url';
      } else {
        return 'csv';
      }
    } else if (_.isFunction(data)) {
      return 'api';
    } else {
      throw poly.error.data("Unknown data format.");
    }
  };

  _getArray = function(json, meta) {
    var first100, item, key, keys, raw, _i, _j, _k, _len, _len1, _len2, _ref;

    if (json.length > 0) {
      keys = _.union(_.keys(meta), _.keys(json[0]));
      first100 = json.slice(0, 100);
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if ((_ref = meta[key]) == null) {
          meta[key] = {};
        }
        if (!meta[key].type) {
          meta[key].type = poly.type.impute(_.pluck(first100, key));
        }
      }
      for (_j = 0, _len1 = json.length; _j < _len1; _j++) {
        item = json[_j];
        for (_k = 0, _len2 = keys.length; _k < _len2; _k++) {
          key = keys[_k];
          item[key] = poly.type.coerce(item[key], meta[key]);
        }
      }
      key = keys;
      raw = json;
    } else {
      key = _.keys(meta);
      raw = [];
    }
    return {
      key: key,
      raw: raw,
      meta: meta
    };
  };

  _getArrayOfArrays = function(json, meta) {
    var first100, i, item, key, keys, newitem, raw, retobj, value, _i, _j, _k, _len, _len1, _len2, _ref;

    retobj = [];
    if (json.length > 0) {
      keys = meta && _.isArray(meta) ? meta : meta && _.isObject(meta) ? _.keys(meta) : _.keys(json[0]);
      if (_.isArray(meta) || !_.isObject(meta)) {
        meta = {};
      }
      first100 = json.slice(0, 100);
      for (i = _i = 0, _len = keys.length; _i < _len; i = ++_i) {
        key = keys[i];
        if ((_ref = meta[key]) == null) {
          meta[key] = {};
        }
        if (!meta[key].type) {
          meta[key].type = poly.type.impute(_.pluck(first100, i));
        }
      }
      for (_j = 0, _len1 = json.length; _j < _len1; _j++) {
        item = json[_j];
        newitem = {};
        for (i = _k = 0, _len2 = item.length; _k < _len2; i = ++_k) {
          value = item[i];
          key = keys[i];
          newitem[key] = poly.type.coerce(value, meta[key]);
        }
        retobj.push(newitem);
      }
      key = keys;
      raw = retobj;
    } else {
      key = _.keys(meta);
      raw = [];
    }
    return {
      key: key,
      raw: raw,
      meta: meta
    };
  };

  _getObject = function(json, meta) {
    var i, k, key, keys, len, obj, raw, _i, _j, _k, _len, _len1, _ref, _ref1;

    keys = _.keys(json);
    raw = [];
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      if ((_ref = meta[key]) == null) {
        meta[key] = {};
      }
      if (!meta[key].type) {
        meta[key].type = poly.type.impute(json[key].slice(0, 100));
      }
    }
    if (keys.length > 0) {
      len = json[keys[0]].length;
      if (len > 0) {
        for (i = _j = 0, _ref1 = len - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          obj = {};
          for (_k = 0, _len1 = keys.length; _k < _len1; _k++) {
            k = keys[_k];
            obj[k] = poly.type.coerce(json[k][i], meta[k]);
          }
          raw.push(obj);
        }
      }
    }
    key = keys;
    return {
      key: key,
      raw: raw,
      meta: meta
    };
  };

  _getCSV = function(str, meta) {
    return _getArray(poly.csv.parse(str), meta);
  };

  /*
  Classes
  */


  AbstractData = (function() {
    AbstractData.prototype.isData = true;

    function AbstractData() {
      this.raw = null;
      this.meta = {};
      this.key = [];
      this.subscribed = [];
      this.computeBackend = false;
    }

    AbstractData.prototype.update = function() {
      var fn, _i, _len, _ref, _results;

      _ref = this.subscribed;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        fn = _ref[_i];
        _results.push(fn());
      }
      return _results;
    };

    AbstractData.prototype.subscribe = function(h) {
      if (_.indexOf(this.subscribed, h) === -1) {
        return this.subscribed.push(h);
      }
    };

    AbstractData.prototype.unsubscribe = function(h) {
      return this.subscribed.splice(_.indexOf(this.subscribed, h), 1);
    };

    AbstractData.prototype.keys = function() {
      return this.key;
    };

    AbstractData.prototype.rename = function() {
      return false;
    };

    AbstractData.prototype.renameMany = function() {
      return false;
    };

    AbstractData.prototype.remove = function() {
      return false;
    };

    AbstractData.prototype.filter = function() {
      return false;
    };

    AbstractData.prototype.sort = function() {
      return false;
    };

    AbstractData.prototype.derive = function() {
      return false;
    };

    AbstractData.prototype.get = function(key) {
      if (this.raw) {
        return _.pluck(this.raw, key);
      } else {
        throw poly.error.data("Data has not been fetched or is undefined.");
      }
    };

    AbstractData.prototype.len = function() {
      if (this.raw) {
        return this.raw.length;
      } else {
        throw poly.error.data("Data has not been fetched or is undefined.");
      }
    };

    AbstractData.prototype.getObject = function(i) {
      if (this.raw) {
        return this.raw[i];
      } else {
        throw poly.error.data("Data has not been fetched or is undefined.");
      }
    };

    AbstractData.prototype.max = function(key) {
      return _.max(this.get(key));
    };

    AbstractData.prototype.min = function(key) {
      return _.min(this.get(key));
    };

    AbstractData.prototype.getMeta = function(key) {
      if (this.meta) {
        return this.meta[key];
      } else {
        return void 0;
      }
    };

    AbstractData.prototype.type = function(key) {
      var t;

      if (key in this.meta) {
        t = this.meta[key].type;
        if (t === 'num') {
          return 'number';
        } else {
          return t;
        }
      }
      throw poly.error.defn("Data does not have column " + key + ".");
    };

    return AbstractData;

  })();

  FrontendData = (function(_super) {
    __extends(FrontendData, _super);

    function FrontendData(params) {
      FrontendData.__super__.constructor.call(this);
      this._setData(params);
    }

    FrontendData.prototype.getData = function(callback) {
      return callback(null, this);
    };

    FrontendData.prototype.update = function(params) {
      this._setData(params);
      return FrontendData.__super__.update.call(this);
    };

    FrontendData.prototype._setData = function(blob) {
      var data, meta, _ref, _ref1;

      if (_.isObject(blob) && _.keys(blob).length < 4 && 'data' in blob) {
        data = blob.data;
        meta = (_ref = blob.meta) != null ? _ref : {};
      } else {
        data = blob;
        meta = {};
      }
      _ref1 = (function() {
        var _ref1;

        switch ((_ref1 = blob.type) != null ? _ref1 : _getDataType(data)) {
          case 'json-object':
            return _getObject(data, meta);
          case 'json-grid':
            return _getArrayOfArrays(data, meta);
          case 'json-array':
            return _getArray(data, meta);
          case 'csv':
            return _getCSV(data, meta);
          default:
            throw poly.error.data("Unknown data format.");
        }
      })(), this.key = _ref1.key, this.raw = _ref1.raw, this.meta = _ref1.meta;
      return this.data = this.raw;
    };

    FrontendData.prototype._checkRename = function(from, to) {
      if (to === '') {
        throw poly.error.defn("Column names cannot be an empty string");
      }
      if (_.indexOf(this.key, from) === -1) {
        throw poly.error.defn("The key " + from + " doesn't exist!");
      }
      if (_.indexOf(this.key, to) !== -1) {
        throw poly.error.defn("The key " + to + " already exists!");
      }
    };

    FrontendData.prototype.rename = function(from, to, checked) {
      var item, k, _i, _len, _ref;

      if (checked == null) {
        checked = false;
      }
      from = from.toString();
      to = to.toString();
      if (from === to) {
        return true;
      }
      if (!checked) {
        this._checkRename(from, to);
      }
      _ref = this.raw;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        item[to] = item[from];
        delete item[from];
      }
      k = _.indexOf(this.key, from);
      this.key[k] = to;
      this.meta[to] = this.meta[from];
      delete this.meta[from];
      return true;
    };

    FrontendData.prototype.renameMany = function(map) {
      var from, to;

      for (from in map) {
        to = map[from];
        if (from !== to) {
          this._checkRename(from, to);
        }
      }
      for (from in map) {
        to = map[from];
        if (from !== to) {
          this.rename(from, to, true);
        }
      }
      return true;
    };

    FrontendData.prototype.remove = function(key) {
      var index, item, _i, _len, _ref;

      index = _.indexOf(this.key, key);
      if (index === '-1') {
        return false;
      }
      this.key.splice(index, 1);
      delete this.meta[key];
      _ref = this.raw;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        delete item[key];
      }
      return true;
    };

    FrontendData.prototype.filter = function(strfn) {
      var fn, item, newdata, newobj, _i, _len, _ref;

      fn = _.isFunction(strfn) ? strfn : _.isString(strfn) ? new Function('d', "with(d) { return " + strfn + ";}") : function() {
        return true;
      };
      newdata = [];
      _ref = this.raw;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (fn(item)) {
          newdata.push(item);
        }
      }
      newobj = poly.data.json(newdata, this.meta);
      return newobj;
    };

    FrontendData.prototype.sort = function(key, desc) {
      var newdata, newobj, sortfn, type;

      type = this.type(key);
      newdata = _.clone(this.raw);
      sortfn = poly.type.compare(type);
      newdata.sort(function(a, b) {
        return sortfn(a[key], b[key]);
      });
      if (desc) {
        newdata.reverse();
      }
      newobj = poly.data.json(newdata, this.meta);
      return newobj;
    };

    FrontendData.prototype.derive = function(fnstr, key, opts) {
      var compute, context, dryrun, hasFnStr, item, value, _i, _len, _ref;

      if (opts == null) {
        opts = {};
      }
      dryrun = opts.dryrun, context = opts.context;
      if (key == null) {
        key = _uniqueId("var_");
      }
      if (context == null) {
        context = {};
      }
      if (_.isFunction(fnstr)) {
        compute = fnstr;
        hasFnStr = false;
      } else {
        hasFnStr = true;
        compute = new Function('d', "with(this) { with(d) { return " + (fnstr('' ? "" : fnstr)) + ";}}");
      }
      _ref = this.raw;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        value = compute.call(context, item);
        if (_.isFunction(value)) {
          throw poly.error.defn("Derivation function returned another function.");
        }
        item[key] = value;
      }
      if (dryrun) {
        return {
          success: true,
          values: _.pluck(this.raw.slice(0, 11), key)
        };
      }
      if (!(__indexOf.call(this.key, key) >= 0)) {
        this.key.push(key);
      }
      this.meta[key] = {
        type: poly.type.impute(_.pluck(this.raw.slice(0, 101), key)),
        derived: true
      };
      if (hasFnStr) {
        this.meta[key].formula = fnstr;
      }
      return key;
    };

    return FrontendData;

  })(AbstractData);

  BackendData = (function(_super) {
    __extends(BackendData, _super);

    function BackendData(params) {
      this.getData = __bind(this.getData, this);
      var _ref;

      BackendData.__super__.constructor.call(this);
      this.url = params.url, this.computeBackend = params.computeBackend, this.limit = params.limit;
      if ((_ref = this.computeBackend) == null) {
        this.computeBackend = false;
      }
    }

    BackendData.prototype.getData = function(callback, dataSpec) {
      var chr, url,
        _this = this;

      if ((this.raw != null) && (!this.computeBackend)) {
        callback(null, this);
        return;
      }
      chr = _.indexOf(this.url, "?") === -1 ? '?' : '&';
      url = this.url;
      if (this.limit) {
        url += "" + chr + "limit=" + this.limit;
      }
      if (dataSpec) {
        url += "&spec=" + (encodeURIComponent(JSON.stringify(dataSpec)));
      }
      return poly.text(url, function(blob) {
        var data, e, meta, _ref, _ref1;

        try {
          blob = JSON.parse(blob);
        } catch (_error) {
          e = _error;
        }
        if (_.isObject(blob) && _.keys(blob).length < 4 && 'data' in blob) {
          data = blob.data;
          meta = (_ref = blob.meta) != null ? _ref : {};
        } else {
          data = blob;
          meta = {};
        }
        _ref1 = (function() {
          switch (_getDataType(data)) {
            case 'json-object':
              return _getObject(data, meta);
            case 'json-grid':
              return _getArrayOfArrays(data, meta);
            case 'json-array':
              return _getArray(data, meta);
            case 'csv':
              return _getCSV(data, meta);
            default:
              throw poly.error.data("Unknown data format.");
          }
        })(), _this.key = _ref1.key, _this.raw = _ref1.raw, _this.meta = _ref1.meta;
        _this.data = _this.raw;
        return callback(null, _this);
      });
    };

    BackendData.prototype.update = function(params) {
      this.raw = null;
      return BackendData.__super__.update.call(this);
    };

    BackendData.prototype.renameMany = function(obj) {
      return _.keys(obj).length === 0;
    };

    return BackendData;

  })(AbstractData);

  ApiData = (function(_super) {
    __extends(ApiData, _super);

    function ApiData(params) {
      this.getData = __bind(this.getData, this);      ApiData.__super__.constructor.call(this);
      this.apiFun = params.apiFun;
      this.computeBackend = true;
    }

    ApiData.prototype.getData = function(callback, dataSpec) {
      var _this = this;

      return this.apiFun(dataSpec, function(err, blob) {
        var data, e, meta, _ref, _ref1;

        if (err) {
          callback(err, null);
          return;
        }
        try {
          blob = JSON.parse(blob);
        } catch (_error) {
          e = _error;
        }
        data = blob.data;
        meta = (_ref = blob.meta) != null ? _ref : {};
        _ref1 = (function() {
          switch (_getDataType(data)) {
            case 'json-object':
              return _getObject(data, meta);
            case 'json-grid':
              return _getArrayofArrays(data, meta);
            case 'json-array':
              return _getArray(data, meta);
            case 'csv':
              return _getCSV(data, meta);
            default:
              throw poly.error.data("Unknown data format.");
          }
        })(), _this.key = _ref1.key, _this.raw = _ref1.raw, _this.meta = _ref1.meta;
        _this.data = _this.raw;
        return callback(null, _this);
      });
    };

    ApiData.prototype.update = function(params) {
      this.raw = null;
      return ApiData.__super__.update.call(this);
    };

    ApiData.prototype.renameMany = function(obj) {
      return _.keys(obj).length === 0;
    };

    return ApiData;

  })(AbstractData);

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Wrapper around the data processing piece that keeps track of the kind of
data processing to be done.
*/


(function() {
  var DataProcess, backendProcess, calculateMeta, calculateStats, filterFactory, filters, frontendProcess, statistics, statsFactory, transformFactory, transforms,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  DataProcess = (function() {
    function DataProcess(layerSpec, grouping, strictmode) {
      this._wrap = __bind(this._wrap, this);      this.dataObj = layerSpec.data;
      this.initialSpec = poly.parser.layerToData(layerSpec, grouping);
      this.prevSpec = null;
      this.strictmode = strictmode;
      this.statData = null;
      this.metaData = {};
    }

    DataProcess.prototype.reset = function(callback) {
      return this.make(this.initialSpec, callback);
    };

    DataProcess.prototype.make = function(spec, grouping, callback) {
      var dataSpec, wrappedCallback;

      wrappedCallback = this._wrap(callback);
      if (this.strictmode) {
        wrappedCallback({
          data: this.dataObj.raw,
          meta: this.dataObj.meta
        });
      }
      if (this.dataObj.computeBackend) {
        dataSpec = poly.parser.layerToData(spec, grouping);
        return backendProcess(dataSpec, this.dataObj, wrappedCallback);
      } else {
        dataSpec = poly.parser.layerToData(spec, grouping);
        return this.dataObj.getData(function(err, data) {
          var obj, _i, _len, _ref;

          if (err) {
            wrappedCallback(err, null);
            return;
          }
          if (__indexOf.call(dataSpec.select, 'count(*)') >= 0) {
            _ref = data.data;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              obj = _ref[_i];
              obj['count(*)'] = 1;
            }
            data.meta['count(*)'] = {};
            data.meta['count(*)']['type'] = 'num';
            dataSpec.stats.stats.push({
              key: 'count(*)',
              name: 'count(*)',
              stat: 'count'
            });
          }
          return frontendProcess(dataSpec, data, wrappedCallback);
        });
      }
    };

    DataProcess.prototype._wrap = function(callback) {
      var _this = this;

      return function(err, params) {
        var data, meta;

        if (err) {
          callback(err, null, null);
          return;
        }
        data = params.data, meta = params.meta;
        _this.statData = data;
        _this.metaData = meta;
        return callback(null, _this.statData, _this.metaData);
      };
    };

    return DataProcess;

  })();

  poly.DataProcess = DataProcess;

  /*
  Temporary
  */


  poly.data.process = function(dataObj, layerSpec, strictmode, callback) {
    var d;

    d = new DataProcess(layerSpec, strictmode);
    d.process(callback);
    return d;
  };

  /*
  TRANSFORMS
  ----------
  Key:value pair of available transformations to a function that creates that
  transformation. Also, a metadata description of the transformation is returned
  when appropriate. (e.g for binning)
  */


  transforms = {
    'bin': function(key, transSpec, meta) {
      var binFn, binwidth, name;

      name = transSpec.name, binwidth = transSpec.binwidth;
      if (meta.type === 'num') {
        if (isNaN(binwidth)) {
          throw poly.error.defn("The binwidth " + binwidth + " is invalid for a numeric varliable");
        }
        binwidth = +binwidth;
        binFn = function(item) {
          return item[name] = binwidth * Math.floor(item[key] / binwidth);
        };
        return {
          trans: binFn,
          meta: {
            bw: binwidth,
            binned: true,
            type: 'num'
          }
        };
      }
      if (meta.type === 'date') {
        if (!(__indexOf.call(poly["const"].timerange, binwidth) >= 0)) {
          throw poly.error.defn("The binwidth " + binwidth + " is invalid for a datetime varliable");
        }
        binFn = function(item) {
          var _timeBinning,
            _this = this;

          _timeBinning = function(n, timerange) {
            var m;

            m = moment.unix(item[key]).startOf(timerange);
            m[timerange](n * Math.floor(m[timerange]() / n));
            return item[name] = m.unix();
          };
          switch (binwidth) {
            case 'week':
              return item[name] = moment.unix(item[key]).day(0).unix();
            case 'twomonth':
              return _timeBinning(2, 'month');
            case 'quarter':
              return _timeBinning(4, 'month');
            case 'sixmonth':
              return _timeBinning(6, 'month');
            case 'twoyear':
              return _timeBinning(2, 'year');
            case 'fiveyear':
              return _timeBinning(5, 'year');
            case 'decade':
              return _timeBinning(10, 'year');
            default:
              return item[name] = moment.unix(item[key]).startOf(binwidth).unix();
          }
        };
        return {
          trans: binFn,
          meta: {
            bw: binwidth,
            binned: true,
            type: 'date'
          }
        };
      }
    },
    'lag': function(key, transSpec, meta) {
      var i, lag, lagFn, lastn, name;

      name = transSpec.name, lag = transSpec.lag;
      lastn = (function() {
        var _i, _results;

        _results = [];
        for (i = _i = 1; 1 <= lag ? _i <= lag : _i >= lag; i = 1 <= lag ? ++_i : --_i) {
          _results.push(void 0);
        }
        return _results;
      })();
      lagFn = function(item) {
        lastn.push(item[key]);
        return item[name] = lastn.shift();
      };
      return {
        trans: lagFn,
        meta: {
          type: meta.type
        }
      };
    }
  };

  /*
  Helper function to figures out which transformation to create, then creates it
  */


  transformFactory = function(key, transSpec, meta) {
    return transforms[transSpec.trans](key, transSpec, meta != null ? meta : {});
  };

  /*
  FILTERS
  ----------
  Key:value pair of available filtering operations to filtering function. The
  filtering function returns true iff the data item satisfies the filtering
  criteria.
  */


  filters = {
    'lt': function(x, value) {
      return x < value;
    },
    'le': function(x, value) {
      return x <= value;
    },
    'gt': function(x, value) {
      return x > value;
    },
    'ge': function(x, value) {
      return x >= value;
    },
    'in': function(x, value) {
      return __indexOf.call(value, x) >= 0;
    }
  };

  /*
  Helper function to figures out which filter to create, then creates it
  */


  filterFactory = function(filterSpec) {
    var filterFuncs;

    filterFuncs = [];
    _.each(filterSpec, function(spec, key) {
      return _.each(spec, function(value, predicate) {
        var filter;

        filter = function(item) {
          return filters[predicate](item[key], value);
        };
        return filterFuncs.push(filter);
      });
    });
    return function(item) {
      var f, _i, _len;

      for (_i = 0, _len = filterFuncs.length; _i < _len; _i++) {
        f = filterFuncs[_i];
        if (!f(item)) {
          return false;
        }
      }
      return true;
    };
  };

  /*
  STATISTICS
  ----------
  Key:value pair of available statistics operations to a function that creates
  the appropriate statistical function given the spec. Each statistics function
  produces one atomic value for each group of data.
  */


  statistics = {
    sum: function(spec) {
      return function(values) {
        return _.reduce(_.without(values, void 0, null), (function(v, m) {
          return v + m;
        }), 0);
      };
    },
    mean: function(spec) {
      return function(values) {
        values = _.without(values, void 0, null);
        return _.reduce(values, (function(v, m) {
          return v + m;
        }), 0) / values.length;
      };
    },
    count: function(spec) {
      return function(values) {
        return _.without(values, void 0, null).length;
      };
    },
    unique: function(spec) {
      return function(values) {
        return (_.uniq(_.without(values, void 0, null))).length;
      };
    },
    min: function(spec) {
      return function(values) {
        return _.min(values);
      };
    },
    max: function(spec) {
      return function(values) {
        return _.max(values);
      };
    },
    median: function(spec) {
      return function(values) {
        return poly.median(values);
      };
    },
    box: function(spec) {
      return function(values) {
        var iqr, len, lowerBound, mid, q2, q4, quarter, sortedValues, splitValues, upperBound, _ref;

        len = values.length;
        if (len > 5) {
          mid = len / 2;
          sortedValues = _.sortBy(values, function(x) {
            return x;
          });
          quarter = Math.ceil(mid) / 2;
          if (quarter % 1 !== 0) {
            quarter = Math.floor(quarter);
            q2 = sortedValues[quarter];
            q4 = sortedValues[(len - 1) - quarter];
          } else {
            q2 = (sortedValues[quarter] + sortedValues[quarter - 1]) / 2;
            q4 = (sortedValues[len - quarter] + sortedValues[(len - quarter) - 1]) / 2;
          }
          iqr = q4 - q2;
          lowerBound = q2 - (1.5 * iqr);
          upperBound = q4 + (1.5 * iqr);
          splitValues = _.groupBy(sortedValues, function(v) {
            return v >= lowerBound && v <= upperBound;
          });
          return {
            q1: _.min(splitValues["true"]),
            q2: q2,
            q3: poly.median(sortedValues, true),
            q4: q4,
            q5: _.max(splitValues["true"]),
            outliers: (_ref = splitValues["false"]) != null ? _ref : []
          };
        }
        return {
          outliers: values
        };
      };
    }
  };

  /*
  Helper function to figures out which statistics to create, then creates it
  */


  statsFactory = function(statSpec) {
    return statistics[statSpec.stat](statSpec);
  };

  /*
  Calculate statistics
  */


  calculateStats = function(data, statSpecs) {
    var groupedData, statFuncs;

    statFuncs = {};
    _.each(statSpecs.stats, function(statSpec) {
      var key, name, statFn;

      key = statSpec.key, name = statSpec.name;
      statFn = statsFactory(statSpec);
      return statFuncs[name] = function(data) {
        return statFn(_.pluck(data, key));
      };
    });
    groupedData = poly.groupBy(data, statSpecs.groups);
    return _.map(groupedData, function(data) {
      var rep;

      rep = {};
      _.each(statSpecs.groups, function(g) {
        return rep[g] = data[0][g];
      });
      _.each(statFuncs, function(stats, name) {
        return rep[name] = stats(data);
      });
      return rep;
    });
  };

  /*
  META
  ----
  Calculations of meta properties including sorting and limiting based on the
  values of statistical calculations
  */


  calculateMeta = function(key, metaSpec, data) {
    var asc, comparator, limit, multiplier, sort, stat, statSpec, values;

    sort = metaSpec.sort, stat = metaSpec.stat, limit = metaSpec.limit, asc = metaSpec.asc;
    if (stat) {
      statSpec = {
        stats: [stat],
        groups: [key]
      };
      data = calculateStats(data, statSpec);
    }
    multiplier = asc ? 1 : -1;
    comparator = function(a, b) {
      if (a[sort] === b[sort]) {
        return 0;
      }
      if (a[sort] >= b[sort]) {
        return 1 * multiplier;
      }
      return -1 * multiplier;
    };
    if (limit) {
      data = data.slice(0, +(limit - 1) + 1 || 9e9);
    }
    values = _.uniq(_.pluck(data, key));
    return {
      meta: {
        levels: values,
        sorted: true
      },
      filter: {
        "in": values
      }
    };
  };

  /*
  GENERAL PROCESSING
  ------------------
  Coordinating the actual work being done
  */


  /*
  Perform the necessary computation in the front end
  */


  frontendProcess = function(dataSpec, data, callback) {
    var addMeta, additionalFilter, d, filter, key, meta, metaData, metaSpec, name, statSpec, trans, transSpec, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;

    metaData = _.clone(data.meta);
    data = _.clone(data.raw);
    if (metaData == null) {
      metaData = {};
    }
    addMeta = function(key, meta) {
      var _ref;

      return metaData[key] = _.extend((_ref = metaData[key]) != null ? _ref : {}, meta);
    };
    if (dataSpec.trans) {
      _ref = dataSpec.trans;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        transSpec = _ref[_i];
        key = transSpec.key;
        _ref1 = transformFactory(key, transSpec, metaData[key]), trans = _ref1.trans, meta = _ref1.meta;
        for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
          d = data[_j];
          trans(d);
        }
        addMeta(transSpec.name, meta);
      }
    }
    if (dataSpec.filter) {
      data = _.filter(data, filterFactory(dataSpec.filter));
    }
    if (dataSpec.meta) {
      additionalFilter = {};
      _ref2 = dataSpec.meta;
      for (key in _ref2) {
        metaSpec = _ref2[key];
        _ref3 = calculateMeta(key, metaSpec, data), meta = _ref3.meta, filter = _ref3.filter;
        additionalFilter[key] = filter;
        addMeta(key, meta);
      }
      data = _.filter(data, filterFactory(additionalFilter));
    }
    if (dataSpec.stats && dataSpec.stats.stats && dataSpec.stats.stats.length > 0) {
      data = calculateStats(data, dataSpec.stats);
      _ref4 = dataSpec.stats.stats;
      for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
        statSpec = _ref4[_k];
        name = statSpec.name;
        addMeta(name, {
          type: 'num'
        });
      }
    }
    _ref6 = (_ref5 = dataSpec.select) != null ? _ref5 : [];
    for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
      key = _ref6[_l];
      if ((metaData[key] == null) && key !== 'count(*)') {
        throw poly.error.defn("You referenced a data column " + key + " that doesn't exist.");
      }
    }
    return callback(null, {
      data: data,
      meta: metaData
    });
  };

  /*
  Perform the necessary computation in the backend
  */


  backendProcess = function(dataSpec, dataObj, callback) {
    return dataObj.getData(callback, dataSpec);
  };

  /*
  For debug purposes only
  */


  poly.data.frontendProcess = frontendProcess;

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Layer
------------------------------------------
A "Layer" is a visual representation of some data. It is sometimes referred
to as a glymph, geometry, or mark, and was (erronously) referred to as "chart
type" in Polychart graph builder.

Each layer needs to be initiated with a specification object. Once initiated,
the layer's @calculate() function takes a dataset + metadata, and produces
one or more objects representing geometric objects. These geometrical objects
have the appropriate data mapped to each appropriate aesthetics, but the scale
has not yet been applied.

These geometrical objects are be rendered on the screen using the Geometry class
found in abstract.coffee

Layers can be reused: i.e. created once and applied to many versions of the same
data set. It is also disposable, and does not contain state information -- only
state that needs to be preserved for consistency is the geometry.
*/


/*
Shared constants
*/


(function() {
  var Area, Bar, Box, Layer, Line, Path, Point, Spline, Text, Tile, aesthetics, defaults, sf, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  aesthetics = poly["const"].aes;

  sf = poly["const"].scaleFns;

  defaults = {
    'x': sf.novalue(),
    'y': sf.novalue(),
    'color': 'steelblue',
    'size': 5,
    'opacity': 0.9,
    'shape': 1
  };

  /*
  Base class for all layers
  */


  Layer = (function() {
    Layer.prototype.defaults = defaults;

    function Layer(spec, strictMode, guideSpec) {
      var aes, _i, _len;

      this.spec = spec;
      this.guideSpec = guideSpec;
      this.mapping = {};
      this.consts = {};
      for (_i = 0, _len = aesthetics.length; _i < _len; _i++) {
        aes = aesthetics[_i];
        if (spec[aes]) {
          if (spec[aes]["var"]) {
            this.mapping[aes] = spec[aes]["var"];
          }
          if (spec[aes]["const"]) {
            this.consts[aes] = spec[aes]["const"];
          }
        }
      }
    }

    Layer.prototype.calculate = function(statData, meta) {
      var aes, key, _ref;

      this.statData = statData;
      this.meta = meta;
      this._calcGeoms();
      this.geoms = this._sample(this.geoms);
      meta = {};
      _ref = this.mapping;
      for (aes in _ref) {
        key = _ref[aes];
        meta[aes] = this.meta[key];
      }
      return {
        geoms: this.geoms,
        meta: meta
      };
    };

    Layer.prototype._calcGeoms = function() {
      throw poly.error.impl();
    };

    Layer.prototype._tooltip = function(item) {
      var tooltip,
        _this = this;

      tooltip = null;
      if (typeof this.spec.tooltip === 'function') {
        return tooltip = function(axes) {
          return this.spec.tooltip(item);
        };
      } else if (this.spec.tooltip != null) {
        return tooltip = function(axes) {
          return this.spec.tooltip;
        };
      } else {
        return tooltip = function(axes) {
          var aes, formatter, key, seenKeys, text, _ref;

          text = "";
          seenKeys = [];
          _ref = _this.mapping;
          for (aes in _ref) {
            key = _ref[aes];
            if (seenKeys.indexOf(key) !== -1) {
              continue;
            } else {
              seenKeys.push(key);
            }
            if ((axes != null) && (axes[aes] != null)) {
              formatter = axes[aes].ticksFormatter;
            } else {
              formatter = function(x) {
                return x;
              };
            }
            text += "\n" + key + ": " + (formatter(item[key]));
          }
          return text.substr(1);
        };
      }
    };

    Layer.prototype._sample = function(geoms) {
      if (this.spec.sample === false) {
        return geoms;
      } else if (_.isNumber(this.spec.sample)) {
        return poly.sample(geoms, this.spec.sample);
      } else {
        throw poly.error.defn("A layer's 'sample' definition should be an integer, not " + this.spec.sample);
      }
    };

    Layer.prototype._getValue = function(item, aes) {
      if (this.mapping[aes]) {
        return item[this.mapping[aes]];
      } else if (this.consts[aes]) {
        return sf.identity(this.consts[aes]);
      } else if (aes === 'x' || aes === 'y') {
        return this.defaults[aes];
      } else {
        return sf.identity(this.defaults[aes]);
      }
    };

    Layer.prototype._getIdFunc = function() {
      var _this = this;

      if (this.mapping['id'] != null) {
        return function(item) {
          return _this._getValue(item, 'id');
        };
      } else {
        return poly.counter();
      }
    };

    Layer.prototype._fillZeros = function(data, all_x) {
      var data_x, item, missing, x;

      data_x = (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          _results.push(this._getValue(item, 'x'));
        }
        return _results;
      }).call(this);
      missing = _.difference(all_x, data_x);
      return {
        x: data_x.concat(missing),
        y: ((function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            _results.push(this._getValue(item, 'y'));
          }
          return _results;
        }).call(this)).concat((function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = missing.length; _i < _len; _i++) {
            x = missing[_i];
            _results.push(void 0);
          }
          return _results;
        })())
      };
    };

    Layer.prototype._stack = function(group) {
      var data, datas, item, key, tmp, yval, _results,
        _this = this;

      datas = poly.groupBy(this.statData, group);
      _results = [];
      for (key in datas) {
        data = datas[key];
        tmp = 0;
        yval = this.mapping.y != null ? (function(item) {
          return item[_this.mapping.y];
        }) : function(item) {
          return 0;
        };
        _results.push((function() {
          var _i, _len, _results1;

          _results1 = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            item.$lower = tmp;
            tmp += parseFloat(yval(item));
            _results1.push(item.$upper = tmp);
          }
          return _results1;
        })());
      }
      return _results;
    };

    Layer.prototype._dodge = function(group) {
      var aes, datas, groupAes, groupKey, item, key, numgroup, order, orderfn, values, yval, _i, _len, _ref, _results,
        _this = this;

      groupAes = _.without(_.keys(this.mapping), 'x', 'y', 'id');
      groupKey = _.toArray(_.pick(this.mapping, groupAes));
      yval = this.mapping.y != null ? (function(item) {
        return item[_this.mapping.y];
      }) : function(item) {
        return 0;
      };
      _ref = poly.groupBy(this.statData, group);
      _results = [];
      for (key in _ref) {
        datas = _ref[key];
        order = {};
        numgroup = 1;
        for (_i = 0, _len = groupAes.length; _i < _len; _i++) {
          aes = groupAes[_i];
          values = _.uniq((function() {
            var _j, _len1, _results1;

            _results1 = [];
            for (_j = 0, _len1 = datas.length; _j < _len1; _j++) {
              item = datas[_j];
              _results1.push(this._getValue(item, aes));
            }
            return _results1;
          }).call(this));
          numgroup *= values.length;
          values.sort(poly.type.compare(this.meta[this.mapping[aes]].type));
          order[aes] = values;
        }
        orderfn = function(item) {
          var m, n, _j, _len1;

          m = numgroup;
          n = 0;
          for (_j = 0, _len1 = groupAes.length; _j < _len1; _j++) {
            aes = groupAes[_j];
            m /= order[aes].length;
            n += m * _.indexOf(order[aes], _this._getValue(item, aes));
          }
          return n;
        };
        _results.push((function() {
          var _j, _len1, _results1;

          _results1 = [];
          for (_j = 0, _len1 = datas.length; _j < _len1; _j++) {
            item = datas[_j];
            item.$n = orderfn(item);
            _results1.push(item.$m = numgroup);
          }
          return _results1;
        })());
      }
      return _results;
    };

    Layer.prototype._inLevels = function(item) {
      var aes, _i, _len, _ref, _ref1;

      _ref = ['x', 'y'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        aes = _ref[_i];
        if ((this.guideSpec[aes] != null) && (this.guideSpec[aes].levels != null)) {
          return _ref1 = item[this.spec[aes]["var"]], __indexOf.call(this.guideSpec[aes].levels, _ref1) >= 0;
        } else {
          return true;
        }
      }
    };

    return Layer;

  })();

  Point = (function(_super) {
    __extends(Point, _super);

    function Point() {
      _ref = Point.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Point.prototype._calcGeoms = function() {
      var evtData, idfn, item, k, v, _i, _len, _ref1, _results;

      idfn = this._getIdFunc();
      this.geoms = {};
      _ref1 = this.statData;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        item = _ref1[_i];
        evtData = {};
        for (k in item) {
          v = item[k];
          evtData[k] = {
            "in": [v]
          };
        }
        _results.push(this.geoms[idfn(item)] = {
          marks: {
            0: {
              type: 'circle',
              x: this._getValue(item, 'x'),
              y: this._getValue(item, 'y'),
              color: this._getValue(item, 'color'),
              size: this._getValue(item, 'size'),
              opacity: this._inLevels(item) ? this._getValue(item, 'opacity') : 0
            }
          },
          evtData: evtData,
          tooltip: this._tooltip(item)
        });
      }
      return _results;
    };

    return Point;

  })(Layer);

  Path = (function(_super) {
    __extends(Path, _super);

    function Path() {
      _ref1 = Path.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Path.prototype._calcGeoms = function() {
      var data, datas, evtData, group, idfn, k, key, sample, _i, _len, _results,
        _this = this;

      group = (function() {
        var _i, _len, _ref2, _results;

        _ref2 = _.without(_.keys(this.mapping), 'x', 'y');
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          k = _ref2[_i];
          _results.push(this.mapping[k]);
        }
        return _results;
      }).call(this);
      datas = poly.groupBy(this.statData, group);
      idfn = this._getIdFunc();
      this.geoms = {};
      _results = [];
      for (k in datas) {
        data = datas[k];
        sample = data[0];
        evtData = {};
        for (_i = 0, _len = group.length; _i < _len; _i++) {
          key = group[_i];
          evtData[key] = {
            "in": [sample[key]]
          };
        }
        _results.push(this.geoms[idfn(sample)] = {
          marks: {
            0: {
              type: 'path',
              x: _.map(data, function(item) {
                return _this._getValue(item, 'x');
              }),
              y: _.map(data, function(item) {
                return _this._getValue(item, 'y');
              }),
              color: this._getValue(sample, 'color'),
              opacity: this._getValue(sample, 'opacity'),
              size: this._getValue(sample, 'size')
            }
          },
          evtData: evtData
        });
      }
      return _results;
    };

    return Path;

  })(Layer);

  Line = (function(_super) {
    __extends(Line, _super);

    function Line() {
      _ref2 = Line.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Line.prototype.defaults = {
      'x': sf.novalue(),
      'y': sf.novalue(),
      'color': 'steelblue',
      'size': 1,
      'opacity': 0.9,
      'shape': 1
    };

    Line.prototype._calcGeoms = function() {
      var all_x, data, datas, evtData, group, i, idfn, item, k, key, pair, sample, segments, x, y, _i, _j, _len, _len1, _ref3, _results;

      all_x = _.uniq((function() {
        var _i, _len, _ref3, _results;

        _ref3 = this.statData;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          item = _ref3[_i];
          _results.push(this._getValue(item, 'x'));
        }
        return _results;
      }).call(this));
      group = (function() {
        var _i, _len, _ref3, _results;

        _ref3 = _.without(_.keys(this.mapping), 'x', 'y');
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          k = _ref3[_i];
          _results.push(this.mapping[k]);
        }
        return _results;
      }).call(this);
      datas = _.pairs(poly.groupBy(this.statData, group));
      idfn = this._getIdFunc();
      this.geoms = {};
      segments = (_.max(datas, function(pair) {
        return pair[1].length;
      }))[1].length === 1;
      _results = [];
      for (i = _i = 0, _len = datas.length; _i < _len; i = ++_i) {
        pair = datas[i];
        key = pair[0], data = pair[1];
        if (segments && i + 1 < datas.length) {
          data.push(datas[i + 1][1][0]);
        }
        sample = data[0];
        evtData = {};
        for (_j = 0, _len1 = group.length; _j < _len1; _j++) {
          key = group[_j];
          evtData[key] = {
            "in": [sample[key]]
          };
        }
        _ref3 = this._fillZeros(data, all_x), x = _ref3.x, y = _ref3.y;
        _results.push(this.geoms[idfn(sample)] = {
          marks: {
            0: {
              type: 'line',
              x: x,
              y: y,
              color: this._getValue(sample, 'color'),
              opacity: this._getValue(sample, 'opacity'),
              size: this._getValue(sample, 'size')
            }
          },
          evtData: evtData
        });
      }
      return _results;
    };

    return Line;

  })(Layer);

  Spline = (function(_super) {
    __extends(Spline, _super);

    function Spline() {
      _ref3 = Spline.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Spline.prototype._calcGeoms = function() {
      var geom, key, key2, mark, _ref4, _results;

      Spline.__super__._calcGeoms.call(this);
      _ref4 = this.geoms;
      _results = [];
      for (key in _ref4) {
        geom = _ref4[key];
        _results.push((function() {
          var _ref5, _results1;

          _ref5 = geom.marks;
          _results1 = [];
          for (key2 in _ref5) {
            mark = _ref5[key2];
            _results1.push(mark.type = 'spline');
          }
          return _results1;
        })());
      }
      return _results;
    };

    return Spline;

  })(Line);

  Bar = (function(_super) {
    __extends(Bar, _super);

    function Bar() {
      _ref4 = Bar.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Bar.prototype._calcGeoms = function() {
      var m, _ref5;

      if (this.mapping.y && this.meta[this.mapping.y].type === 'cat') {
        throw poly.error.defn("The dependent variable of a bar chart cannot be categorical!");
      } else {
        if (this.mapping.x) {
          m = this.meta[this.mapping.x];
          if (m.type !== 'cat' && !m.bw && !m.binned) {
            if (m.type === 'num' && (this.guideSpec.x.bw == null)) {
              throw poly.error.type("Bar chart x-values need to be binned. Set binwidth or use the bin() transform!");
            }
          }
        }
        this.position = (_ref5 = this.spec.position) != null ? _ref5 : 'stack';
        if (this.position === 'stack') {
          return this._calcGeomsStack();
        } else if (this.position === 'dodge') {
          return this._calcGeomsDodge();
        } else {
          throw poly.error.defn("Bar chart position " + this.position + " is unknown.");
        }
      }
    };

    Bar.prototype._calcGeomsDodge = function() {
      var evtData, group, idfn, item, k, lower, upper, v, _i, _len, _ref5, _results;

      group = this.mapping.x != null ? [this.mapping.x] : [];
      this._dodge(group);
      this._stack(group.concat("$n"));
      this.geoms = {};
      idfn = this._getIdFunc();
      _ref5 = this.statData;
      _results = [];
      for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
        item = _ref5[_i];
        evtData = {};
        for (k in item) {
          v = item[k];
          if (k !== 'y') {
            evtData[k] = {
              "in": [v]
            };
          }
        }
        lower = sf.lower(this._getValue(item, 'x'), item.$n, item.$m);
        upper = sf.upper(this._getValue(item, 'x'), item.$n, item.$m);
        _results.push(this.geoms[idfn(item)] = {
          marks: {
            0: {
              type: 'rect',
              x: [lower, upper],
              y: [item.$lower, item.$upper],
              color: this._getValue(item, 'color'),
              opacity: this._inLevels(item) ? this._getValue(item, 'opacity') : 0
            }
          },
          evtData: evtData,
          tooltip: this._tooltip(item)
        });
      }
      return _results;
    };

    Bar.prototype._calcGeomsStack = function() {
      var evtData, group, idfn, item, k, v, _i, _len, _ref5, _results;

      group = this.mapping.x != null ? [this.mapping.x] : [];
      this._stack(group);
      idfn = this._getIdFunc();
      this.geoms = {};
      _ref5 = this.statData;
      _results = [];
      for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
        item = _ref5[_i];
        evtData = {};
        for (k in item) {
          v = item[k];
          if (k !== 'y') {
            evtData[k] = {
              "in": [v]
            };
          }
        }
        _results.push(this.geoms[idfn(item)] = {
          marks: {
            0: {
              type: 'rect',
              x: [sf.lower(this._getValue(item, 'x')), sf.upper(this._getValue(item, 'x'))],
              y: [item.$lower, item.$upper],
              color: this._getValue(item, 'color'),
              opacity: this._inLevels(item) ? this._getValue(item, 'opacity') : 0
            }
          },
          evtData: evtData,
          tooltip: this._tooltip(item)
        });
      }
      return _results;
    };

    return Bar;

  })(Layer);

  Area = (function(_super) {
    __extends(Area, _super);

    function Area() {
      _ref5 = Area.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    Area.prototype._calcGeoms = function() {
      var all_x, counters, data, datas, evtData, group, idfn, item, k, key, sample, x, y, y_next, y_previous, _i, _j, _k, _len, _len1, _len2, _results;

      all_x = (function() {
        var _i, _len, _ref6, _results;

        _ref6 = this.statData;
        _results = [];
        for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
          item = _ref6[_i];
          if (poly.isDefined(this._getValue(item, 'y')) && poly.isDefined(x = this._getValue(item, 'x'))) {
            _results.push(x);
          }
        }
        return _results;
      }).call(this);
      all_x = _.uniq(all_x);
      counters = {};
      for (_i = 0, _len = all_x.length; _i < _len; _i++) {
        key = all_x[_i];
        counters[key] = 0;
      }
      group = (function() {
        var _j, _len1, _ref6, _results;

        _ref6 = _.without(_.keys(this.mapping), 'x', 'y');
        _results = [];
        for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
          k = _ref6[_j];
          _results.push(this.mapping[k]);
        }
        return _results;
      }).call(this);
      datas = poly.groupBy(this.statData, group);
      idfn = this._getIdFunc();
      this.geoms = {};
      _results = [];
      for (k in datas) {
        data = datas[k];
        sample = data[0];
        evtData = {};
        for (_j = 0, _len1 = group.length; _j < _len1; _j++) {
          key = group[_j];
          evtData[key] = {
            "in": [sample[key]]
          };
        }
        y_previous = (function() {
          var _k, _len2, _results1;

          _results1 = [];
          for (_k = 0, _len2 = all_x.length; _k < _len2; _k++) {
            x = all_x[_k];
            _results1.push(counters[x]);
          }
          return _results1;
        })();
        for (_k = 0, _len2 = data.length; _k < _len2; _k++) {
          item = data[_k];
          x = this._getValue(item, 'x');
          y = this._getValue(item, 'y');
          counters[x] += y;
        }
        y_next = (function() {
          var _l, _len3, _results1;

          _results1 = [];
          for (_l = 0, _len3 = all_x.length; _l < _len3; _l++) {
            x = all_x[_l];
            _results1.push(counters[x]);
          }
          return _results1;
        })();
        _results.push(this.geoms[idfn(sample)] = {
          marks: {
            0: {
              type: 'area',
              x: all_x,
              y: {
                bottom: y_previous,
                top: y_next
              },
              color: this._getValue(sample, 'color'),
              opacity: this._getValue(sample, 'opacity')
            }
          },
          evtData: evtData
        });
      }
      return _results;
    };

    return Area;

  })(Layer);

  Text = (function(_super) {
    __extends(Text, _super);

    function Text() {
      _ref6 = Text.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    Text.prototype._calcGeoms = function() {
      var evtData, idfn, item, k, v, _i, _len, _ref7, _results;

      idfn = this._getIdFunc();
      this.geoms = {};
      _ref7 = this.statData;
      _results = [];
      for (_i = 0, _len = _ref7.length; _i < _len; _i++) {
        item = _ref7[_i];
        evtData = {};
        for (k in item) {
          v = item[k];
          evtData[k] = {
            "in": [v]
          };
        }
        _results.push(this.geoms[idfn(item)] = {
          marks: {
            0: {
              type: 'text',
              x: this._getValue(item, 'x'),
              y: this._getValue(item, 'y'),
              text: this._getValue(item, 'text'),
              color: this._getValue(item, 'color'),
              size: this._getValue(item, 'size'),
              opacity: this._getValue(item, 'opacity'),
              'text-anchor': 'center'
            }
          },
          evtData: evtData
        });
      }
      return _results;
    };

    return Text;

  })(Layer);

  Tile = (function(_super) {
    __extends(Tile, _super);

    function Tile() {
      _ref7 = Tile.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    Tile.prototype._calcGeoms = function() {
      var evtData, idfn, item, k, v, x, y, _i, _len, _ref8, _results;

      idfn = this._getIdFunc();
      this.geoms = {};
      _ref8 = this.statData;
      _results = [];
      for (_i = 0, _len = _ref8.length; _i < _len; _i++) {
        item = _ref8[_i];
        evtData = {};
        x = this._getValue(item, 'x');
        y = this._getValue(item, 'y');
        for (k in item) {
          v = item[k];
          if (k !== 'y' && k !== 'x') {
            evtData[k] = {
              "in": [v]
            };
          }
        }
        _results.push(this.geoms[idfn(item)] = {
          marks: {
            0: {
              type: 'rect',
              x: [sf.lower(this._getValue(item, 'x')), sf.upper(this._getValue(item, 'x'))],
              y: [sf.lower(this._getValue(item, 'y')), sf.upper(this._getValue(item, 'y'))],
              color: this._getValue(item, 'color'),
              size: this._getValue(item, 'size'),
              opacity: this._getValue(item, 'opacity')
            }
          },
          evtData: evtData,
          tooltip: this._tooltip(item)
        });
      }
      return _results;
    };

    return Tile;

  })(Layer);

  Box = (function(_super) {
    __extends(Box, _super);

    function Box() {
      _ref8 = Box.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    Box.prototype._calcGeoms = function() {
      var color, evtData, geom, idfn, index, item, k, opacity, point, size, v, x, xl, xm, xu, y, _i, _j, _len, _len1, _ref10, _ref9, _results;

      idfn = this._getIdFunc();
      this.geoms = {};
      _ref9 = this.statData;
      _results = [];
      for (_i = 0, _len = _ref9.length; _i < _len; _i++) {
        item = _ref9[_i];
        evtData = {};
        for (k in item) {
          v = item[k];
          if (k !== 'y') {
            evtData[k] = {
              "in": [v]
            };
          }
        }
        x = this._getValue(item, 'x');
        y = this._getValue(item, 'y');
        color = this._getValue(item, 'color');
        size = this._getValue(item, 'size');
        opacity = this._inLevels(item) ? this._getValue(item, 'opacity') : 0;
        xl = sf.lower(x);
        xu = sf.upper(x);
        xm = sf.middle(x);
        geom = {
          marks: {},
          evtData: evtData
        };
        if (y.q1) {
          geom.marks = {
            iqr: {
              type: 'rect',
              x: [xl, xu],
              y: [y.q2, y.q4],
              stroke: color,
              color: sf.identity('white'),
              size: size,
              opacity: opacity,
              'stroke-width': '1px'
            },
            q1: {
              type: 'pline',
              x: [xl, xu],
              y: [y.q1, y.q1],
              color: color,
              size: size,
              opacity: opacity
            },
            lower: {
              type: 'pline',
              x: [xm, xm],
              y: [y.q1, y.q2],
              color: color,
              size: size,
              opacity: opacity
            },
            q5: {
              type: 'pline',
              x: [xl, xu],
              y: [y.q5, y.q5],
              color: color,
              size: size,
              opacity: opacity
            },
            upper: {
              type: 'pline',
              x: [xm, xm],
              y: [y.q4, y.q5],
              color: color,
              size: size,
              opacity: opacity
            },
            middle: {
              type: 'pline',
              x: [xl, xu],
              y: [y.q3, y.q3],
              color: color,
              size: size,
              opacity: opacity
            }
          };
        }
        _ref10 = y.outliers;
        for (index = _j = 0, _len1 = _ref10.length; _j < _len1; index = ++_j) {
          point = _ref10[index];
          geom.marks[index] = {
            type: 'circle',
            x: xm,
            y: point,
            color: color,
            size: sf.identity(3),
            opacity: opacity
          };
        }
        _results.push(this.geoms[idfn(item)] = geom);
      }
      return _results;
    };

    return Box;

  })(Layer);

  /*
  Public interface to making different layer types.
  TODO: this should be changed to make it easier to make other
        types of layers.
  */


  poly.layer = {};

  poly.layer.Base = Layer;

  poly.layer.classes = {
    'point': Point,
    'text': Text,
    'line': Line,
    'path': Path,
    'area': Area,
    'bar': Bar,
    'tile': Tile,
    'box': Box,
    'spline': Spline
  };

  poly.layer.make = function(layerSpec, strictMode, guideSpec) {
    var type;

    type = layerSpec.type;
    if (type in poly.layer.classes) {
      return new poly.layer.classes[type](layerSpec, strictMode, guideSpec);
    }
    throw poly.error.defn("No such layer " + layerSpec.type + ".");
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
(function() {
  var Pane,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  poly.pane = {};

  poly.pane.make = function(grp, title) {
    return new Pane(grp, title);
  };

  Pane = (function(_super) {
    __extends(Pane, _super);

    function Pane(multiindex, titleObj) {
      this.titleObj = titleObj;
      this.index = multiindex;
      this.layers = null;
      this.title = null;
    }

    Pane.prototype.make = function(spec, data, layers) {
      var geoms, i, layer, meta, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;

      this.layers = layers;
      if (!this.geoms) {
        this.geoms = {};
        _ref = this.layers;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          layer = _ref[i];
          this.geoms[i] = new poly.Geometry();
        }
      }
      this.metas = {};
      _ref1 = this.layers;
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        layer = _ref1[i];
        _ref2 = layer.calculate(data[i].statData, data[i].metaData), geoms = _ref2.geoms, meta = _ref2.meta;
        this.geoms[i].set(geoms);
        this.metas[i] = meta;
      }
      if ((_ref3 = this.title) == null) {
        this.title = this._makeTitle(spec);
      }
      this.title.make(this.titleObj);
      return this.domains = this._makeDomains(spec, this.geoms, this.metas);
    };

    Pane.prototype._makeTitle = function() {
      return poly.guide.title('facet');
    };

    Pane.prototype._makeDomains = function(spec, geoms, metas) {
      return poly.domain.make(geoms, metas, spec.guides, spec.strict);
    };

    Pane.prototype.render = function(renderer, offset, clipping, dims) {
      var geom, k, r, _ref, _results;

      this.title.render(renderer({}, false, false), dims, offset);
      r = renderer(offset, clipping, true);
      _ref = this.geoms;
      _results = [];
      for (k in _ref) {
        geom = _ref[k];
        _results.push(geom.render(r));
      }
      return _results;
    };

    Pane.prototype.dispose = function(renderer) {
      var geom, k, _ref;

      _ref = this.geoms;
      for (k in _ref) {
        geom = _ref[k];
        geom.dispose(renderer);
      }
      this.geoms = {};
      return this.title.dispose(renderer);
    };

    return Pane;

  })(poly.Renderable);

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
DIMENSIONS
----------
Calculate the pixel dimension and layout of a particular chart

Dimension object has the following elements (all numeric in pixels):
  @width: the width of the entire chart, including paddings, guides, etc.
  @height : the height of the entire chart, including paddings, guides, etc.
  @paddingLeft: left padding, not including guides
  @paddingRight: right padding, not including guides
  @paddingTop: top padding, not including guides
  @paddingBottom: bottom padding, not including guides
  @guideLeft: space for guides (axes & legends) on the left side of chart
  @guideRight: space for guides (axes & legends) on the right side of chart
  @guideTop: space for guides (axes & legends) on the top of chart
  @guideBottom: space for guides (axes & legends) on the bottom of chart
  @chartHeight: height of area given for actual chart, includes all facets and
                the spaces between the facets
  @chartWidth: width of area given for actual chart, includes all facets and
               the spaces between the facets
  @eachHeight: the height of the chart area for each facet
  @eachWidth: the width of the chart area for each facet
  @horizontalSpacing: horizontal space between ajacent facets
  @verticalSpacing: horizontal space between ajacent facets
*/


(function() {
  poly.dim = {};

  poly.dim.make = function(spec, scaleSet, facetGrid) {
    var bottom, dim, hMax, left, right, top, vMax, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;

    dim = {
      width: (_ref = spec.width) != null ? _ref : 400,
      height: (_ref1 = spec.height) != null ? _ref1 : 400,
      paddingLeft: (_ref2 = spec.paddingLeft) != null ? _ref2 : 10,
      paddingRight: (_ref3 = spec.paddingRight) != null ? _ref3 : 10,
      paddingTop: (_ref4 = spec.paddingTop) != null ? _ref4 : 10,
      paddingBottom: (_ref5 = spec.paddingBottom) != null ? _ref5 : 10,
      horizontalSpacing: (_ref6 = spec.horizontalSpacing) != null ? _ref6 : 10,
      verticalSpacing: (_ref7 = spec.verticalSpacing) != null ? _ref7 : 20,
      guideTop: 10,
      guideRight: 0,
      guideLeft: 5,
      guideBottom: 5
    };
    _ref8 = scaleSet.axesOffset(dim), left = _ref8.left, right = _ref8.right, top = _ref8.top, bottom = _ref8.bottom;
    dim.guideLeft += left != null ? left : 0;
    dim.guideRight += right != null ? right : 0;
    dim.guideBottom += bottom != null ? bottom : 0;
    dim.guideTop += top != null ? top : 0;
    _ref9 = scaleSet.titleOffset(dim), left = _ref9.left, right = _ref9.right, top = _ref9.top, bottom = _ref9.bottom;
    dim.guideLeft += left != null ? left : 0;
    dim.guideRight += right != null ? right : 0;
    dim.guideBottom += bottom != null ? bottom : 0;
    dim.guideTop += top != null ? top : 0;
    _ref10 = scaleSet.legendOffset(dim), left = _ref10.left, right = _ref10.right, top = _ref10.top, bottom = _ref10.bottom;
    dim.guideLeft += left != null ? left : 0;
    dim.guideRight += right != null ? right : 0;
    dim.guideBottom += bottom != null ? bottom : 0;
    dim.guideTop += top != null ? top : 0;
    hMax = dim.width * 0.40;
    vMax = dim.height * 0.40;
    if (dim.guideLeft > hMax) {
      dim.guideLeft = hMax;
    }
    if (dim.guideRight > hMax) {
      dim.guideRight = hMax;
    }
    if (dim.guideTop > vMax) {
      dim.guideTop = vMax;
    }
    if (dim.guideBottom > vMax) {
      dim.guideBottom = vMax;
    }
    dim.chartHeight = dim.height - dim.paddingTop - dim.paddingBottom - dim.guideTop - dim.guideBottom;
    dim.chartWidth = dim.width - dim.paddingLeft - dim.paddingRight - dim.guideLeft - dim.guideRight;
    if ((facetGrid.cols != null) && facetGrid.cols > 1) {
      dim.eachWidth = dim.chartWidth - dim.horizontalSpacing * facetGrid.cols;
      dim.eachWidth /= facetGrid.cols;
    } else {
      dim.eachWidth = dim.chartWidth;
    }
    if ((facetGrid.rows != null) && facetGrid.rows > 1) {
      dim.eachHeight = dim.chartHeight - dim.verticalSpacing * (facetGrid.rows + 1);
      dim.eachHeight /= facetGrid.rows;
    } else {
      dim.eachHeight = dim.chartHeight - dim.verticalSpacing;
    }
    return dim;
  };

  poly.dim.guess = function(spec, facetGrid) {
    var dim, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;

    dim = {
      width: (_ref = spec.width) != null ? _ref : 400,
      height: (_ref1 = spec.height) != null ? _ref1 : 400,
      paddingLeft: (_ref2 = spec.paddingLeft) != null ? _ref2 : 10,
      paddingRight: (_ref3 = spec.paddingRight) != null ? _ref3 : 10,
      paddingTop: (_ref4 = spec.paddingTop) != null ? _ref4 : 10,
      paddingBottom: (_ref5 = spec.paddingBottom) != null ? _ref5 : 10,
      guideLeft: 30,
      guideRight: 40,
      guideTop: 10,
      guideBottom: 30,
      horizontalSpacing: (_ref6 = spec.horizontalSpacing) != null ? _ref6 : 10,
      verticalSpacing: (_ref7 = spec.verticalSpacing) != null ? _ref7 : 10
    };
    dim.chartHeight = dim.height - dim.paddingTop - dim.paddingBottom - dim.guideTop - dim.guideBottom;
    dim.chartWidth = dim.width - dim.paddingLeft - dim.paddingRight - dim.guideLeft - dim.guideRight;
    if ((facetGrid.cols != null) && facetGrid.cols > 1) {
      dim.eachWidth = dim.chartWidth - dim.horizontalSpacing * (facetGrid.cols - 1);
    } else {
      dim.eachWidth = dim.chartWidth;
    }
    if ((facetGrid.rows != null) && facetGrid.rows > 1) {
      dim.eachHeight = dim.chartHeight - dim.verticalSpacing * (facetGrid.rows - 1);
    } else {
      dim.eachHeight = dim.chartHeight;
    }
    return dim;
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
# GLOBALS
*/


(function() {
  var Area, Circle, CircleRect, Line, Path, PathRenderer, PolarLine, Rect, Renderer, Spline, Text, renderer, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  poly.paper = function(dom, w, h, graph) {
    var bg, paper;

    if (typeof Raphael === "undefined" || Raphael === null) {
      throw poly.error.depn("The dependency Raphael is not included.");
    }
    paper = Raphael(dom, w, h);
    bg = paper.rect(0, 0, w, h).attr({
      fill: 'white',
      opacity: 0,
      'stroke-width': 0
    });
    bg.click(graph.handleEvent('reset'));
    poly.mouseEvents(graph, bg, false);
    poly.touchEvents(graph.handleEvent, bg, true);
    return paper;
  };

  /*
  Mouse Events
  */


  poly.mouseEvents = function(graph, bg, showRect) {
    var end, endInfo, handler, onend, onmove, onstart, rect, start, startInfo;

    handler = graph.handleEvent('select');
    if (showRect) {
      rect = null;
    }
    start = end = null;
    startInfo = endInfo = null;
    onstart = function() {
      start = null;
      return end = null;
    };
    onmove = function(dx, dy, x, y) {
      var attr, offset;

      if ((startInfo != null) && (start != null)) {
        end = {
          x: start.x + dx,
          y: start.y + dy
        };
        endInfo = graph.facet.getFacetInfo(graph.dims, end.x, end.y);
        if ((rect != null) && (endInfo != null) && endInfo.col === startInfo.col && endInfo.row === startInfo.row && showRect) {
          attr = {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(start.x - end.x),
            height: Math.abs(start.y - end.y)
          };
          return rect = rect.attr(attr);
        }
      } else {
        offset = poly.offset(graph.dom);
        start = {
          x: x - offset.left,
          y: y - offset.top
        };
        startInfo = graph.facet.getFacetInfo(graph.dims, start.x, start.y);
        if ((startInfo != null) && showRect) {
          rect = graph.paper.rect(start.x, start.y, 0, 0, 2);
          return rect = rect.attr({
            fill: 'black',
            opacity: 0.2
          });
        }
      }
    };
    onend = function() {
      if ((start != null) && (end != null)) {
        if ((rect != null) && showRect) {
          rect = rect.hide();
          rect.remove();
        }
        return handler({
          start: start,
          end: end
        });
      }
    };
    return bg.drag(onmove, onstart, onend);
  };

  poly.touchEvents = function(handleEvent, elem, enable) {
    if (enable == null) {
      enable = true;
    }
    if (enable) {
      elem.touchstart(handleEvent('touchstart'));
      elem.touchend(handleEvent('touchend'));
      elem.touchmove(handleEvent('touchmove'));
      return elem.touchcancel(handleEvent('touchcancel'));
    }
  };

  /*
  Helper function for rendering all the geoms of an object
  */


  poly.render = function(handleEvent, paper, scales, coord) {
    return function(offset, clipping, mayflip) {
      if (offset == null) {
        offset = {};
      }
      if (clipping == null) {
        clipping = false;
      }
      if (mayflip == null) {
        mayflip = true;
      }
      if (coord.type == null) {
        throw poly.error.unknown("Coordinate don't have at type?");
      }
      if (renderer[coord.type] == null) {
        throw poly.error.input("Unknown coordinate type " + coord.type);
      }
      return {
        add: function(mark, evtData, tooltip, type) {
          var pt;

          if (renderer[coord.type][mark.type] == null) {
            throw poly.error.input("Coord " + coord.type + " has no mark " + mark.type);
          }
          pt = renderer[coord.type][mark.type].render(paper, scales, coord, offset, mark, mayflip);
          pt.data('m', mark);
          if (evtData && _.keys(evtData).length > 0) {
            pt.data('e', evtData);
          }
          if (tooltip) {
            pt.data('t', tooltip);
          }
          if (clipping != null) {
            pt.attr('clip-rect', clipping);
          }
          if (type === 'guide') {
            pt.click(handleEvent('guide-click'));
            poly.touchEvents(handleEvent, pt, true);
          } else {
            pt.click(handleEvent('click'));
            pt.hover(handleEvent('mover'), handleEvent('mout'));
            poly.touchEvents(handleEvent, pt, true);
          }
          return pt;
        },
        remove: function(pt) {
          return pt.remove();
        },
        animate: function(pt, mark, evtData, tooltip) {
          renderer[coord.type][mark.type].animate(pt, scales, coord, offset, mark, mayflip);
          if (clipping != null) {
            pt.attr('clip-rect', clipping);
          }
          if (evtData && _.keys(evtData).length > 0) {
            pt.data('e', evtData);
          }
          if (tooltip) {
            pt.data('t', tooltip);
          }
          pt.data('m', mark);
          return pt;
        }
      };
    };
  };

  Renderer = (function() {
    function Renderer() {}

    Renderer.prototype.render = function(paper, scales, coord, offset, mark, mayflip) {
      var k, pt, v, _ref;

      pt = this._make(paper);
      _ref = this.attr(scales, coord, offset, mark, mayflip);
      for (k in _ref) {
        v = _ref[k];
        pt.attr(k, v);
      }
      return pt;
    };

    Renderer.prototype._make = function() {
      throw poly.error.impl();
    };

    Renderer.prototype.animate = function(pt, scales, coord, offset, mark, mayflip) {
      return pt.animate(this.attr(scales, coord, offset, mark, mayflip), 300);
    };

    Renderer.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      throw poly.error.impl();
    };

    Renderer.prototype._cantRender = function(aes) {
      throw poly.error.missingdata();
    };

    Renderer.prototype._makePath = function(xs, ys, type) {
      var path;

      if (type == null) {
        type = 'L';
      }
      switch (type) {
        case 'spline':
          path = _.map(xs, function(x, i) {
            return (i === 0 ? "M " + x + " " + ys[i] + " R " : '') + ("" + x + " " + ys[i]);
          });
          break;
        default:
          path = _.map(xs, function(x, i) {
            return (i === 0 ? 'M' : type) + x + ' ' + ys[i];
          });
      }
      return path.join(' ');
    };

    Renderer.prototype._maybeApply = function(scales, mark, key) {
      var val;

      val = mark[key];
      if (_.isObject(val) && val.f === 'identity') {
        return val.v;
      } else if (scales[key] != null) {
        return scales[key].f(val);
      } else {
        return val;
      }
    };

    Renderer.prototype._applyOffset = function(x, y, offset) {
      var i, _ref, _ref1;

      if (!offset) {
        return {
          x: x,
          y: y
        };
      }
      if ((_ref = offset.x) == null) {
        offset.x = 0;
      }
      if ((_ref1 = offset.y) == null) {
        offset.y = 0;
      }
      return {
        x: _.isArray(x) ? (function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = x.length; _i < _len; _i++) {
            i = x[_i];
            _results.push(i + offset.x);
          }
          return _results;
        })() : x + offset.x,
        y: _.isArray(y) ? (function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = y.length; _i < _len; _i++) {
            i = y[_i];
            _results.push(i + offset.y);
          }
          return _results;
        })() : y + offset.y
      };
    };

    Renderer.prototype._shared = function(scales, mark, attr) {
      var maybeAdd,
        _this = this;

      maybeAdd = function(aes) {
        if ((mark[aes] != null) && (attr[aes] == null)) {
          return attr[aes] = _this._maybeApply(scales, mark, aes);
        }
      };
      maybeAdd('opacity');
      maybeAdd('stroke-width');
      maybeAdd('stroke-dasharray');
      maybeAdd('stroke-dashoffset');
      maybeAdd('transform');
      maybeAdd('font-size');
      maybeAdd('font-weight');
      maybeAdd('font-family');
      return attr;
    };

    Renderer.prototype._checkPointUndefined = function(x, y, type) {
      if (type == null) {
        type = "Point";
      }
      if (x === void 0 || y === void 0) {
        throw poly.error.missing("" + type + " cannot be plotted due to undefined data.");
      }
    };

    Renderer.prototype._checkArrayUndefined = function(x, y, type) {
      var i;

      if (type == null) {
        type = "Line";
      }
      if (_.all((function() {
        var _i, _ref, _results;

        _results = [];
        for (i = _i = 0, _ref = x.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(x[i] === void 0 || y[i] === void 0);
        }
        return _results;
      })())) {
        throw poly.error.missing("" + type + " cannot be plotted due to too many missing points.");
      }
    };

    Renderer.prototype._checkArrayNaN = function(xs, ys) {
      var z, zs;

      zs = _.map(_.zip(xs, ys), function(z, i) {
        if (isNaN(z[0]) || isNaN(z[1])) {
          return void 0;
        } else {
          return z;
        }
      });
      return {
        x: (function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = zs.length; _i < _len; _i++) {
            z = zs[_i];
            if (z != null) {
              _results.push(z[0]);
            }
          }
          return _results;
        })(),
        y: (function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = zs.length; _i < _len; _i++) {
            z = zs[_i];
            if (z != null) {
              _results.push(z[1]);
            }
          }
          return _results;
        })()
      };
    };

    return Renderer;

  })();

  PathRenderer = (function(_super) {
    __extends(PathRenderer, _super);

    function PathRenderer() {
      _ref = PathRenderer.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    PathRenderer.prototype.animate = function(pt, scales, coord, offset, mark, mayflip) {
      var newattr, oldmark, scaleattr,
        _this = this;

      oldmark = pt.data('m');
      newattr = this.attr(scales, coord, offset, mark, mayflip);
      if (!_.isEqual(oldmark.x, mark.x)) {
        scaleattr = this.attr(scales, coord, offset, oldmark, mayflip);
        return pt.animate(scaleattr, 300, function() {
          return pt.attr(newattr);
        });
      } else {
        return pt.animate(newattr, 300);
      }
    };

    return PathRenderer;

  })(Renderer);

  Circle = (function(_super) {
    __extends(Circle, _super);

    function Circle() {
      _ref1 = Circle.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Circle.prototype._make = function(paper) {
      return paper.circle();
    };

    Circle.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var attr, fill, stroke, x, y, _ref2, _ref3;

      _ref2 = coord.getXY(mayflip, mark), x = _ref2.x, y = _ref2.y;
      this._checkPointUndefined(x, y, "Circle");
      _ref3 = this._applyOffset(x, y, offset), x = _ref3.x, y = _ref3.y;
      stroke = this._maybeApply(scales, mark, mark.stroke ? 'stroke' : 'color');
      attr = {
        cx: x,
        cy: y,
        r: this._maybeApply(scales, mark, 'size'),
        stroke: stroke
      };
      fill = this._maybeApply(scales, mark, 'color');
      if (fill && fill !== 'none') {
        attr.fill = fill;
      }
      return this._shared(scales, mark, attr);
    };

    return Circle;

  })(Renderer);

  Path = (function(_super) {
    __extends(Path, _super);

    function Path() {
      _ref2 = Path.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Path.prototype._make = function(paper) {
      return paper.path();
    };

    Path.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var size, stroke, x, y, _ref3, _ref4;

      _ref3 = coord.getXY(mayflip, mark), x = _ref3.x, y = _ref3.y;
      this._checkArrayUndefined(x, y, "Path");
      _ref4 = this._applyOffset(x, y, offset), x = _ref4.x, y = _ref4.y;
      stroke = this._maybeApply(scales, mark, mark.stroke ? 'stroke' : 'color');
      size = this._maybeApply(scales, mark, mark.size ? 'size' : 'stroke-width');
      return this._shared(scales, mark, {
        path: this._makePath(x, y),
        stroke: stroke,
        'stroke-width': size
      });
    };

    return Path;

  })(Renderer);

  Line = (function(_super) {
    __extends(Line, _super);

    function Line() {
      _ref3 = Line.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Line.prototype._make = function(paper) {
      return paper.path();
    };

    Line.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var i, size, stroke, x, xi, y, yi, _i, _len, _ref4, _ref5, _ref6, _ref7;

      _ref4 = poly.sortArrays(scales.x.compare, [mark.x, mark.y]), mark.x = _ref4[0], mark.y = _ref4[1];
      _ref5 = coord.getXY(mayflip, mark), x = _ref5.x, y = _ref5.y;
      this._checkArrayUndefined(x, y, "Line");
      for (i = _i = 0, _len = x.length; _i < _len; i = ++_i) {
        xi = x[i];
        yi = y[i];
      }
      _ref6 = this._applyOffset(x, y, offset), x = _ref6.x, y = _ref6.y;
      _ref7 = this._checkArrayNaN(x, y), x = _ref7.x, y = _ref7.y;
      stroke = this._maybeApply(scales, mark, mark.stroke ? 'stroke' : 'color');
      size = this._maybeApply(scales, mark, mark.size ? 'size' : 'stroke-width');
      return this._shared(scales, mark, {
        path: this._makePath(x, y),
        stroke: stroke,
        'stroke-width': size
      });
    };

    return Line;

  })(PathRenderer);

  Spline = (function(_super) {
    __extends(Spline, _super);

    function Spline() {
      _ref4 = Spline.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Spline.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var i, size, stroke, x, xi, y, yi, _i, _len, _ref5, _ref6, _ref7, _ref8;

      _ref5 = poly.sortArrays(scales.x.compare, [mark.x, mark.y]), mark.x = _ref5[0], mark.y = _ref5[1];
      _ref6 = coord.getXY(mayflip, mark), x = _ref6.x, y = _ref6.y;
      this._checkArrayUndefined(x, y, "Spline");
      for (i = _i = 0, _len = x.length; _i < _len; i = ++_i) {
        xi = x[i];
        yi = y[i];
      }
      _ref7 = this._applyOffset(x, y, offset), x = _ref7.x, y = _ref7.y;
      _ref8 = this._checkArrayNaN(x, y), x = _ref8.x, y = _ref8.y;
      stroke = this._maybeApply(scales, mark, mark.stroke ? 'stroke' : 'color');
      size = this._maybeApply(scales, mark, mark.size ? 'size' : 'stroke-width');
      return this._shared(scales, mark, {
        path: this._makePath(x, y, 'spline'),
        stroke: stroke,
        'stroke-width': size
      });
    };

    return Spline;

  })(Line);

  PolarLine = (function(_super) {
    __extends(PolarLine, _super);

    function PolarLine() {
      _ref5 = PolarLine.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    PolarLine.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var dir, i, large, path, r, stroke, t, x, y, _ref6, _ref7;

      _ref6 = coord.getXY(mayflip, mark), x = _ref6.x, y = _ref6.y, r = _ref6.r, t = _ref6.t;
      this._checkArrayUndefined(x, y, "Line");
      _ref7 = this._applyOffset(x, y, offset), x = _ref7.x, y = _ref7.y;
      path = (function() {
        var _i, _ref8;

        if (_.max(r) - _.min(r) < poly["const"].epsilon) {
          r = r[0];
          path = "M " + x[0] + " " + y[0];
          for (i = _i = 1, _ref8 = x.length - 1; 1 <= _ref8 ? _i <= _ref8 : _i >= _ref8; i = 1 <= _ref8 ? ++_i : --_i) {
            large = Math.abs(t[i] - t[i - 1]) > Math.PI ? 1 : 0;
            dir = t[i] - t[i - 1] > 0 ? 1 : 0;
            path += "A " + r + " " + r + " 0 " + large + " " + dir + " " + x[i] + " " + y[i];
          }
          return path;
        } else {
          return this._makePath(x, y);
        }
      }).call(this);
      stroke = this._maybeApply(scales, mark, mark.stroke ? 'stroke' : 'color');
      return this._shared(scales, mark, {
        path: path,
        stroke: stroke
      });
    };

    return PolarLine;

  })(Line);

  Area = (function(_super) {
    __extends(Area, _super);

    function Area() {
      _ref6 = Area.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    Area.prototype._make = function(paper) {
      return paper.path();
    };

    Area.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var bottom, top, x, y, _ref7, _ref8;

      _ref7 = poly.sortArrays(scales.x.compare, [mark.x, mark.y.top]), x = _ref7[0], y = _ref7[1];
      top = coord.getXY(mayflip, {
        x: x,
        y: y
      });
      top = this._applyOffset(top.x, top.y, offset);
      _ref8 = poly.sortArrays((function(a, b) {
        return -scales.x.compare(a, b);
      }), [mark.x, mark.y.bottom]), x = _ref8[0], y = _ref8[1];
      bottom = coord.getXY(mayflip, {
        x: x,
        y: y
      });
      bottom = this._applyOffset(bottom.x, bottom.y, offset);
      x = top.x.concat(bottom.x);
      y = top.y.concat(bottom.y);
      return this._shared(scales, mark, {
        path: this._makePath(x, y),
        stroke: this._maybeApply(scales, mark, 'color'),
        fill: this._maybeApply(scales, mark, 'color'),
        'stroke-width': '0px'
      });
    };

    return Area;

  })(PathRenderer);

  Rect = (function(_super) {
    __extends(Rect, _super);

    function Rect() {
      _ref7 = Rect.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    Rect.prototype._make = function(paper) {
      return paper.rect();
    };

    Rect.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var stroke, x, y, _ref8, _ref9;

      _ref8 = coord.getXY(mayflip, mark), x = _ref8.x, y = _ref8.y;
      this._checkPointUndefined(x[0], y[0], "Bar");
      this._checkPointUndefined(x[1], y[1], "Bar");
      _ref9 = this._applyOffset(x, y, offset), x = _ref9.x, y = _ref9.y;
      stroke = this._maybeApply(scales, mark, mark.stroke ? 'stroke' : 'color');
      return this._shared(scales, mark, {
        x: _.min(x),
        y: _.min(y),
        width: Math.abs(x[1] - x[0]),
        height: Math.abs(y[1] - y[0]),
        fill: this._maybeApply(scales, mark, 'color'),
        stroke: stroke,
        'stroke-width': this._maybeApply(scales, mark, 'stroke-width' != null ? 'stroke-width' : '0px')
      });
    };

    return Rect;

  })(Renderer);

  CircleRect = (function(_super) {
    __extends(CircleRect, _super);

    function CircleRect() {
      _ref8 = CircleRect.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    CircleRect.prototype._make = function(paper) {
      return paper.path();
    };

    CircleRect.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var large, path, r, stroke, t, x, x0, x1, y, y0, y1, _ref10, _ref11, _ref12, _ref9;

      _ref9 = mark.x, x0 = _ref9[0], x1 = _ref9[1];
      _ref10 = mark.y, y0 = _ref10[0], y1 = _ref10[1];
      this._checkPointUndefined(x0, y0, "Bar");
      this._checkPointUndefined(x1, y1, "Bar");
      mark.x = [x0, x0, x1, x1];
      mark.y = [y0, y1, y1, y0];
      _ref11 = coord.getXY(mayflip, mark), x = _ref11.x, y = _ref11.y, r = _ref11.r, t = _ref11.t;
      _ref12 = this._applyOffset(x, y, offset), x = _ref12.x, y = _ref12.y;
      if (coord.flip) {
        x.push(x.splice(0, 1)[0]);
        y.push(y.splice(0, 1)[0]);
        r.push(r.splice(0, 1)[0]);
        t.push(t.splice(0, 1)[0]);
      }
      if (2 * Math.PI - Math.abs(t[1] - t[0]) < poly["const"].epsilon) {
        path = "M " + x[0] + " " + y[0] + " A " + r[0] + " " + r[0] + " 0 1 1 " + x[0] + " " + (y[0] + 2 * r[0]) + " A " + r[1] + " " + r[1] + " 0 1 1 " + x[1] + " " + y[1];
        path += "M " + x[2] + " " + y[2] + " A " + r[2] + " " + r[2] + " 0 1 0 " + x[2] + " " + (y[2] + 2 * r[2]) + " A " + r[3] + " " + r[3] + " 0 1 0 " + x[3] + " " + y[3] + " Z";
      } else {
        large = Math.abs(t[1] - t[0]) > Math.PI ? 1 : 0;
        path = "M " + x[0] + " " + y[0] + " A " + r[0] + " " + r[1] + " 0 " + large + " 1 " + x[1] + " " + y[1];
        large = Math.abs(t[3] - t[2]) > Math.PI ? 1 : 0;
        path += "L " + x[2] + " " + y[2] + " A " + r[2] + " " + r[3] + " 0 " + large + " 0 " + x[3] + " " + y[3] + " Z";
      }
      stroke = this._maybeApply(scales, mark, mark.stroke ? 'stroke' : 'color');
      return this._shared(scales, mark, {
        path: path,
        fill: this._maybeApply(scales, mark, 'color'),
        stroke: stroke,
        'stroke-width': this._maybeApply(scales, mark, 'stroke-width' != null ? 'stroke-width' : '0px')
      });
    };

    return CircleRect;

  })(Renderer);

  Text = (function(_super) {
    __extends(Text, _super);

    function Text() {
      _ref9 = Text.__super__.constructor.apply(this, arguments);
      return _ref9;
    }

    Text.prototype._make = function(paper) {
      return paper.text();
    };

    Text.prototype.attr = function(scales, coord, offset, mark, mayflip) {
      var x, y, _ref10, _ref11, _ref12;

      _ref10 = coord.getXY(mayflip, mark), x = _ref10.x, y = _ref10.y;
      this._checkPointUndefined(x, y, "Text");
      _ref11 = this._applyOffset(x, y, offset), x = _ref11.x, y = _ref11.y;
      return this._shared(scales, mark, {
        x: x,
        y: y,
        r: 10,
        text: this._maybeApply(scales, mark, 'text'),
        'font-size': this._maybeApply(scales, mark, 'size'),
        'text-anchor': (_ref12 = mark['text-anchor']) != null ? _ref12 : 'left',
        fill: this._maybeApply(scales, mark, 'color') || 'black'
      });
    };

    return Text;

  })(Renderer);

  renderer = {
    cartesian: {
      circle: new Circle(),
      line: new Line(),
      pline: new Line(),
      area: new Area(),
      path: new Path(),
      text: new Text(),
      rect: new Rect(),
      spline: new Spline()
    },
    polar: {
      circle: new Circle(),
      path: new Path(),
      line: new Line(),
      pline: new PolarLine(),
      area: new Area(),
      text: new Text(),
      rect: new CircleRect(),
      spline: new Spline()
    }
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
/*
Interaction
-----------
The functions here makes it easier to create common types of interactions.
*/


(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  poly.handler = {};

  /*
  Render a tooltip. This is actually included automatically for every graph.
  */


  poly.handler.tooltip = function() {
    var offset, tooltip, update;

    tooltip = {};
    offset = null;
    update = function(tooltip) {
      return function(e) {
        var height, mousePos, width, x, y, _ref, _ref1;

        mousePos = poly.getXY(offset, e);
        if (tooltip.text.getBBox()) {
          _ref = tooltip.text.getBBox(), x = _ref.x, y = _ref.y, width = _ref.width, height = _ref.height;
          tooltip.text.attr({
            x: mousePos.x,
            y: Math.max(0, mousePos.y - 5 - height)
          });
          _ref1 = tooltip.text.getBBox(), x = _ref1.x, y = _ref1.y, width = _ref1.width, height = _ref1.height;
          return tooltip.box.attr({
            x: Math.max(0, x - 5),
            y: Math.max(0, y - 5),
            width: width + 10,
            height: height + 10
          });
        }
      };
    };
    return function(type, obj, event, graph) {
      var height, mousePos, paper, width, x, x1, x2, y, y1, y2, _ref, _ref1, _ref2;

      offset = poly.offset(graph.dom);
      paper = obj.paper;
      if (type === 'mover' || type === 'mout') {
        if (tooltip.text != null) {
          tooltip.text.remove();
          tooltip.box.remove();
        }
        tooltip = {};
        if (type === 'mover' && obj.tooltip) {
          _ref = obj.getBBox(), x = _ref.x, y = _ref.y, x2 = _ref.x2, y2 = _ref.y2;
          mousePos = poly.getXY(offset, event);
          x1 = mousePos.x;
          y1 = mousePos.y;
          tooltip.text = paper.text(x1, y1, obj.tooltip(graph.axes.axes)).attr({
            'text-anchor': 'middle',
            'fill': 'white'
          });
          _ref1 = tooltip.text.getBBox(), x = _ref1.x, y = _ref1.y, width = _ref1.width, height = _ref1.height;
          y = y1 - height - 10;
          tooltip.text.attr({
            'y': y
          });
          _ref2 = tooltip.text.getBBox(), x = _ref2.x, y = _ref2.y, width = _ref2.width, height = _ref2.height;
          tooltip.box = paper.rect(x - 5, y - 5, width + 10, height + 10, 5);
          tooltip.box.attr({
            fill: '#213'
          });
          tooltip.text.toFront();
          return obj.mousemove(update(tooltip));
        } else {
          return typeof obj.unmousemove === "function" ? obj.unmousemove(null) : void 0;
        }
      }
    };
  };

  /*
  Drilldown. Suitable for bar charts over categorical data, mostly.
  This function does not handle the following:
    * drilldown for multiple aesthetics. does this even make sense?
    * breaks if an initial filter overlaps with one of the drilldown levels
  */


  poly.handler.drilldown = function(aes, levels, initial_filter) {
    var current, filters;

    if (initial_filter == null) {
      initial_filter = {};
    }
    if (!_.isArray(levels)) {
      throw poly.error.input("Parameter `levels` should be an array.");
    }
    if (__indexOf.call(poly["const"].aes, aes) < 0) {
      throw poly.error.input("Unknown aesthetic " + aes + ".");
    }
    current = 0;
    filters = [initial_filter];
    return function(type, obj, event, graph) {
      var data, layer, newFilter, newFilterValue, spec, _i, _j, _len, _len1, _ref, _ref1;

      if (type === 'reset' && current > 0) {
        spec = graph.spec;
        filters.pop();
        newFilter = filters.unshift();
        current--;
        _ref = spec.layers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layer = _ref[_i];
          layer.filter = newFilter;
          layer[aes] = levels[current];
          layer.id = levels[current];
        }
        return graph.make(graph.spec);
      } else if (type === 'click' && current < levels.length - 1) {
        data = obj.evtData;
        spec = graph.spec;
        newFilterValue = data[levels[current]];
        if (!newFilterValue) {
          return;
        }
        newFilter = {};
        newFilter[levels[current]] = newFilterValue;
        current++;
        newFilter = _.extend(_.clone(filters[filters.length - 1]), newFilter);
        _ref1 = spec.layers;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          layer = _ref1[_j];
          layer.filter = newFilter;
          layer[aes] = levels[current];
          layer.id = levels[current];
        }
        filters.push(newFilter);
        return graph.make(graph.spec);
      }
    };
  };

  /*
  Zooming and Resetting. Whenever click and drag on range, set to that range.
    * Reset event, that is, restoring to previous values, when click blank spot
    * TODO: Add a friendly interface to restrict zooms
  */


  poly.handler.zoom = function(init_spec, zoomOptions) {
    var aes, initGuides, initHandlers, _ref, _ref1, _wrapHandlers;

    if (zoomOptions == null) {
      zoomOptions = {
        x: true,
        y: true
      };
    }
    if (init_spec == null) {
      throw poly.error.input("Initial specification missing.");
    }
    initGuides = {
      x: _.clone((_ref = init_spec.guides) != null ? _ref.x : void 0),
      y: _.clone((_ref1 = init_spec.guides) != null ? _ref1.y : void 0)
    };
    initHandlers = void 0;
    aes = ['x', 'y'];
    _wrapHandlers = function(h) {
      return function(type, obj, event, graph) {
        if (type === 'reset') {
          if (_.isFunction(h)) {
            return h('resetZoom', obj, event, graph);
          } else {
            return h.handle('resetZoom', obj, event, graph);
          }
        } else {
          if (_.isFunction(h)) {
            return h(type, obj, event, graph);
          } else {
            return h.handle(type, obj, event, graph);
          }
        }
      };
    };
    return function(type, obj, event, graph) {
      var aesVar, data, guides, layer, spec, v, _i, _j, _k, _len, _len1, _len2, _ref2, _ref3, _ref4, _ref5, _ref6, _results;

      if (initHandlers == null) {
        initHandlers = _.clone(graph.handlers);
      }
      if (graph.coord.type === 'cartesian') {
        if (type === 'resetZoom') {
          spec = graph.spec;
          for (_i = 0, _len = aes.length; _i < _len; _i++) {
            v = aes[_i];
            spec.guides[v] = _.clone(initGuides[v]);
          }
          graph.handlers = _.clone(initHandlers);
          graph.make(graph.spec);
        }
        if (type === 'select') {
          data = obj.evtData;
          guides = graph.spec.guides;
          _ref2 = graph.spec.layers;
          _results = [];
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            layer = _ref2[_j];
            for (_k = 0, _len2 = aes.length; _k < _len2; _k++) {
              v = aes[_k];
              if (!(zoomOptions[v] && (layer[v] != null))) {
                continue;
              }
              aesVar = layer[v]["var"];
              if ((_ref3 = graph.axes.domains[v].type) === 'num' || _ref3 === 'date') {
                if (data[aesVar].le - data[aesVar].ge > poly["const"].epsilon) {
                  if ((_ref4 = guides[v]) == null) {
                    guides[v] = {
                      min: null,
                      max: null
                    };
                  }
                  _ref5 = [data[aesVar].ge, data[aesVar].le], guides[v].min = _ref5[0], guides[v].max = _ref5[1];
                }
              }
              if (graph.axes.domains[v].type === 'cat') {
                if (data[aesVar]["in"].length !== 0) {
                  if ((_ref6 = guides[v]) == null) {
                    guides[v] = {
                      levels: null
                    };
                  }
                  guides[v].levels = data[aesVar]["in"];
                }
              }
            }
            graph.handlers = _.map(graph.handlers, _wrapHandlers);
            _results.push(graph.make(graph.spec));
          }
          return _results;
        }
      }
    };
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
(function() {
  var Facet,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  poly.facet = {};

  poly.facet.make = function() {
    return new Facet();
  };

  Facet = (function() {
    function Facet() {
      this.type = 'none';
      this.mapping = {};
      this.specgroups = [];
      this.groups = [];
      this.panes = {};
      this.deletedPanes = [];
    }

    Facet.prototype.make = function(spec) {
      var aes, key, mapping, _ref;

      this.spec = spec;
      _ref = this._getMappings(this.spec.facet), this.type = _ref.type, mapping = _ref.mapping;
      this.mapping = mapping;
      this.groups = _.values(this.mapping);
      this.specgroups = {};
      for (aes in mapping) {
        key = mapping[aes];
        if (this.spec.facet[aes]) {
          this.specgroups[key] = this.spec.facet[aes];
        }
      }
      if (this.spec.facet.formatter) {
        this.formatter = this.spec.facet.formatter;
      }
      this.style = {};
      if (this.spec.facet.size) {
        this.style.size = this.spec.facet.size;
      }
      if (this.spec.facet.color) {
        return this.style.color = this.spec.facet.color;
      }
    };

    Facet.prototype.calculate = function(datas, layers) {
      var added, deleted, kept, key, multiindex, name, numFacets, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;

      _ref = this._makeIndices(datas, this.specgroups), this.values = _ref.values, this.indices = _ref.indices;
      if (this.type === 'none') {
        this.rows = this.cols = 1;
      } else {
        this.cols = this.spec.facet.cols;
        this.rows = this.spec.facet.rows;
        if (this.type === 'wrap') {
          numFacets = this.values[this.mapping["var"]].length;
          if (!this.cols && !this.rows) {
            this.cols = Math.min(3, numFacets);
          }
          if (this.cols) {
            this.rows = Math.ceil(numFacets / this.cols);
          } else if (this.rows) {
            this.cols = Math.ceil(numFacets / this.rows);
          }
        } else {
          this.rows = this.mapping.y ? this.values[this.mapping.y].length : 1;
          this.cols = this.mapping.x ? this.values[this.mapping.x].length : 1;
        }
      }
      this.datas = this._groupData(datas, this.indices);
      _ref1 = poly.compare(_.keys(this.panes), _.keys(this.indices)), deleted = _ref1.deleted, kept = _ref1.kept, added = _ref1.added;
      for (_i = 0, _len = deleted.length; _i < _len; _i++) {
        key = deleted[_i];
        this.deletedPanes.push(this.panes[key]);
        delete this.panes[key];
      }
      for (_j = 0, _len1 = added.length; _j < _len1; _j++) {
        key = added[_j];
        name = this.formatter ? this.formatter(this.indices[key]) : key;
        this.panes[key] = poly.pane.make(this.indices[key], _.extend({
          title: name
        }, this.style));
      }
      _ref2 = this.indices;
      _results = [];
      for (key in _ref2) {
        multiindex = _ref2[key];
        _results.push(this.panes[key].make(this.spec, this.datas[key], layers));
      }
      return _results;
    };

    Facet.prototype.render = function(renderer, dims, coord) {
      var clipping, key, offset, pane, renderRemoval, _i, _len, _ref, _ref1, _results;

      if (this.deletedPanes.length > 0) {
        renderRemoval = renderer({}, false, false);
        _ref = this.deletedPanes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pane = _ref[_i];
          pane.dispose(renderRemoval);
        }
        this.deletedPanes = [];
      }
      _ref1 = this.panes;
      _results = [];
      for (key in _ref1) {
        pane = _ref1[key];
        offset = this.getOffset(dims, key);
        clipping = coord.clipping(offset);
        _results.push(pane.render(renderer, offset, clipping, dims));
      }
      return _results;
    };

    Facet.prototype.dispose = function(renderer) {
      var key, pane, _i, _len, _ref, _ref1;

      _ref = this.panes;
      for (key in _ref) {
        pane = _ref[key];
        this.deletedPanes.push(pane);
        delete this.panes[key];
      }
      if (renderer) {
        _ref1 = this.deletedPanes;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          pane = _ref1[_i];
          pane.dispose(renderer);
        }
        return this.deletedPanes = [];
      } else {

      }
    };

    Facet.prototype.getGrid = function() {
      return {
        cols: this.cols,
        rows: this.rows
      };
    };

    Facet.prototype.getOffset = function(dims, id) {
      var col, row, _ref;

      _ref = this._getRowCol(id), col = _ref.col, row = _ref.row;
      return {
        x: dims.paddingLeft + dims.guideLeft + (dims.eachWidth + dims.horizontalSpacing) * col,
        y: dims.paddingTop + dims.guideTop + (dims.eachHeight + dims.verticalSpacing) * row + dims.verticalSpacing
      };
    };

    Facet.prototype.edge = function(dir) {
      var acc, col, edge, grp, key, m, n, optimize, row,
        _this = this;

      if (this.type === 'none') {
        return function() {
          return true;
        };
      }
      if (this.type === 'grid') {
        row = function(id) {
          return _.indexOf(_this.values[_this.mapping.y], _this.indices[id][_this.mapping.y]);
        };
        col = function(id) {
          return _.indexOf(_this.values[_this.mapping.x], _this.indices[id][_this.mapping.x]);
        };
      } else {
        col = function(id) {
          return _.indexOf(_this.values[_this.mapping["var"]], _this.indices[id][_this.mapping["var"]]) % _this.cols;
        };
        row = function(id) {
          return Math.floor(_.indexOf(_this.values[_this.mapping["var"]], _this.indices[id][_this.mapping["var"]]) / _this.cols);
        };
      }
      if (dir === 'none') {
        return function() {
          return false;
        };
      }
      if (dir === 'out') {
        return function() {
          return true;
        };
      }
      grp = dir === 'top' || dir === 'bottom' ? col : row;
      optimize = dir === 'top' ? row : dir === 'bottom' ? function(k) {
        return -row(k);
      } : dir === 'left' ? col : dir === 'right' ? function(k) {
        return -col(k);
      } : void 0;
      acc = {};
      for (key in this.indices) {
        n = grp(key);
        m = optimize(key);
        if (!acc[n] || m < acc[n].v) {
          acc[n] = {
            v: m,
            k: key
          };
        }
      }
      edge = _.pluck(acc, 'k');
      return function(identifier) {
        return __indexOf.call(edge, identifier) >= 0;
      };
    };

    Facet.prototype.getEvtData = function(col, row) {
      var aes, key, obj, _ref;

      obj = {};
      _ref = this.mapping;
      for (aes in _ref) {
        key = _ref[aes];
        if (aes === 'x' || aes === 'y') {
          obj[key] = {
            "in": this.values[key][col]
          };
        } else {
          obj[key] = {
            "in": this.values[key][this.rows * row + col]
          };
        }
      }
      return obj;
    };

    Facet.prototype.getFacetInfo = function(dims, x, y, preset) {
      var adjusted, col, offset, row;

      if (preset) {
        if (!((preset.col != null) && (preset.row != null))) {
          throw poly.error.impl("Preset rows & columns are not present.");
        }
        col = preset.col;
        row = preset.row;
      } else {
        col = (x - dims.paddingLeft - dims.guideLeft) / (dims.eachWidth + dims.horizontalSpacing);
        col = Math.floor(col);
        row = (y - dims.paddingTop - dims.guideTop - dims.verticalSpacing) / (dims.eachHeight + dims.verticalSpacing);
        row = Math.floor(row);
      }
      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
        return null;
      }
      offset = {
        x: dims.paddingLeft + dims.guideLeft + (dims.eachWidth + dims.horizontalSpacing) * col,
        y: dims.paddingTop + dims.guideTop + (dims.eachHeight + dims.verticalSpacing) * row + dims.verticalSpacing
      };
      adjusted = {
        x: x - offset.x,
        y: y - offset.y
      };
      if (!preset && (adjusted.x > dims.eachWidth || adjusted.y > dims.eachHeight)) {
        return null;
      }
      adjusted.x = Math.max(Math.min(adjusted.x, dims.eachWidth), 0);
      adjusted.y = Math.max(Math.min(adjusted.y, dims.eachHeight), 0);
      return {
        row: row,
        col: col,
        offset: offset,
        adjusted: adjusted,
        evtData: this.getEvtData(col, row)
      };
    };

    /*
    Helper functions
    */


    Facet.prototype._getMappings = function(spec) {
      var retobj;

      retobj = {
        type: 'none',
        mapping: {}
      };
      if (_.isObject(spec)) {
        if (spec.type === 'wrap') {
          retobj.type = 'wrap';
          if (!spec["var"]) {
            throw poly.error.defn("You didn't specify a variable to facet on.");
          }
          if (spec["var"]) {
            retobj.mapping["var"] = spec["var"]["var"];
          }
        } else if (spec.type === 'grid') {
          retobj.type = 'grid';
          if (!spec.x && spec.y) {
            throw poly.error.defn("You didn't specify a variable to facet on.");
          }
          if (spec.x) {
            retobj.mapping.x = spec.x["var"];
          }
          if (spec.y) {
            retobj.mapping.y = spec.y["var"];
          }
        }
      }
      return retobj;
    };

    Facet.prototype._makeIndices = function(datas, groups) {
      var aes, data, index, indexValues, indices, key, meta, sortfn, stringify, v, val, values, _i, _len, _ref;

      values = {};
      for (aes in groups) {
        key = groups[aes];
        if (key.levels) {
          values[key["var"]] = key.levels;
        } else {
          v = [];
          sortfn = null;
          for (index in datas) {
            data = datas[index];
            if (meta = data.metaData[key["var"]]) {
              if (meta && ((_ref = meta.type) === 'num' || _ref === 'date')) {
                poly.type.compare(meta.type);
              }
            }
            v = _.uniq(_.union(v, _.pluck(data.statData, key["var"])));
          }
          values[key["var"]] = sortfn != null ? v.sort(sortfn) : v;
        }
      }
      indexValues = poly.cross(values);
      indices = {};
      stringify = poly.stringify(_.pluck(groups, 'var'));
      for (_i = 0, _len = indexValues.length; _i < _len; _i++) {
        val = indexValues[_i];
        indices[stringify(val)] = val;
      }
      return {
        values: values,
        indices: indices
      };
    };

    Facet.prototype._groupData = function(unfaceted, indicies) {
      var datas, groupedData, id, mindex, pointer, value, _ref;

      groupedData = poly.groupProcessedData(unfaceted, this.groups);
      datas = {};
      _ref = this.indices;
      for (id in _ref) {
        mindex = _ref[id];
        pointer = groupedData;
        while (pointer.grouped === true) {
          value = mindex[pointer.key];
          pointer = pointer.values[value];
        }
        datas[id] = pointer;
      }
      return datas;
    };

    Facet.prototype._getRowCol = function(id) {
      var retobj, value;

      retobj = {
        row: 0,
        col: 0
      };
      if (this.type === 'wrap') {
        value = this.indices[id][this.mapping["var"]];
        id = _.indexOf(this.values[this.mapping["var"]], value);
        retobj.col = id % this.cols;
        retobj.row = Math.floor(id / this.cols);
      } else if (this.type === 'grid') {
        retobj.row = _.indexOf(this.values[this.mapping.y], this.indices[id][this.mapping.y]);
        retobj.col = _.indexOf(this.values[this.mapping.x], this.indices[id][this.mapping.x]);
      }
      return retobj;
    };

    return Facet;

  })();

  /*
  Take a processedData from the data processing step and group it for faceting
  purposes.
  
  Input is in the format: 
  processData = {
    layer_id : { statData: [...], metaData: {...} }
    ...
  }
  
  Output should be in one of the two format:
    groupedData = {
      grouped: true
      key: group1
      values: {
        value1: groupedData2 # note recursive def'n
        value2: groupedData3
        ...
      }
    }
    OR
    groupedData = {
      layer_id : { statData: [...], metaData: {...} }
      ...
    }
  */


  poly.groupProcessedData = function(processedData, groups) {
    var currGrp, data, index, newProcessedData, result, uniqueValues, value, _i, _len;

    if (groups.length === 0) {
      return processedData;
    }
    currGrp = groups.splice(0, 1)[0];
    uniqueValues = [];
    for (index in processedData) {
      data = processedData[index];
      if (currGrp in data.metaData) {
        uniqueValues = _.union(uniqueValues, _.uniq(_.pluck(data.statData, currGrp)));
      }
    }
    result = {
      grouped: true,
      key: currGrp,
      values: {}
    };
    for (_i = 0, _len = uniqueValues.length; _i < _len; _i++) {
      value = uniqueValues[_i];
      newProcessedData = {};
      for (index in processedData) {
        data = processedData[index];
        newProcessedData[index] = {
          metaData: data.metaData
        };
        newProcessedData[index].statData = currGrp in data.metaData ? poly.filter(data.statData, currGrp, value) : _.clone(data.statData);
      }
      result.values[value] = poly.groupProcessedData(newProcessedData, _.clone(groups));
    }
    return result;
  };

}).call(this);
// Generated by CoffeeScript 1.6.2
(function() {
  var Graph,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Graph = (function() {
    /*
    The constructor does not do any real work. It just sets a bunch of variables
    to its default value and call @make(), which actually does the real work.
    */
    function Graph(spec, callback, prepare) {
      this.handleEvent = __bind(this.handleEvent, this);
      this.render = __bind(this.render, this);
      this.mergeDomains = __bind(this.mergeDomains, this);
      this.merge = __bind(this.merge, this);
      this.maybeDispose = __bind(this.maybeDispose, this);      if (spec == null) {
        throw poly.error.defn("No graph specification is passed in!");
      }
      this.handlers = [];
      this.scaleSet = null;
      this.axes = null;
      this.legends = null;
      this.dims = null;
      this.paper = null;
      this.coord = null;
      this.facet = poly.facet.make();
      this.dataSubscribed = [];
      this.callback = callback;
      this.prepare = prepare;
      this.make(spec);
      this.addHandler(poly.handler.tooltip());
    }

    /*
    Remove all existing items on the graph, if necessary
    */


    Graph.prototype.maybeDispose = function(spec) {
      var renderer;

      renderer = poly.render(this.handleEvent, this.paper, this.scaleSet.scales, this.coord);
      renderer = renderer();
      if (this.coord && !_.isEqual(this.coord.spec, spec.coord)) {
        if (this.scaleSet) {
          this.scaleSet.disposeGuides(renderer);
          this.scaleSet = null;
        }
        return this.coord = null;
      }
    };

    /*
    Begin work to plot the graph. This function does only half of the work:
    i.e. things that needs to be done prior to data process. Because data
    process may be asynchronous, we pass in @merge() as a callback for when
    data processing is complete.
    */


    Graph.prototype.make = function(spec) {
      var d, dataChange, datas, id, layerSpec, merge, _i, _len, _ref, _ref1,
        _this = this;

      if (spec != null) {
        spec = poly.spec.toStrictMode(spec);
        poly.spec.check(spec);
        this.spec = spec;
      } else {
        spec = this.spec;
      }
      if (this.scaleSet) {
        this.maybeDispose(spec);
      }
      if ((_ref = this.coord) == null) {
        this.coord = poly.coord.make(this.spec.coord);
      }
      this.facet.make(spec);
      dataChange = this.handleEvent('data');
      datas = (function() {
        var _i, _len, _ref1, _results;

        _ref1 = spec.layers;
        _results = [];
        for (id = _i = 0, _len = _ref1.length; _i < _len; id = ++_i) {
          layerSpec = _ref1[id];
          _results.push(layerSpec.data);
        }
        return _results;
      })();
      _ref1 = _.difference(datas, this.dataSubscribed);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        d = _ref1[_i];
        d.subscribe(dataChange);
      }
      this.dataSubscribed = datas;
      merge = _.after(spec.layers.length, this.merge);
      this.dataprocess = {};
      this.processedData = {};
      return _.each(spec.layers, function(layerSpec, id) {
        var groups;

        spec = _this.spec.layers[id];
        groups = _.values(_this.facet.specgroups);
        _this.dataprocess[id] = new poly.DataProcess(spec, groups, spec.strict);
        return _this.dataprocess[id].make(spec, groups, function(err, statData, metaData) {
          if (err) {
            console.error(err);
            alert('Error processing chart data');
            callback(err);
            return;
          }
          _this.processedData[id] = {
            statData: statData,
            metaData: metaData
          };
          return merge();
        });
      });
    };

    /*
    Complete work to plot the graph. This includes three stages:
      1) Create each "pane". Each "pane" is a facet containing a smallversion
         of the chart, filtered to only data that falls within that facet.
      2) Merge the domains from each layer and each pane. This is used to
         define scales and determine the min/max point of each axis.
      3) Actually render the chart.
    */


    Graph.prototype.merge = function() {
      var _this = this;

      this.layers = _.map(this.spec.layers, function(layerSpec) {
        return poly.layer.make(layerSpec, _this.spec.strict, _this.spec.guides);
      });
      this.facet.calculate(this.processedData, this.layers);
      this.mergeDomains();
      return this.render();
    };

    Graph.prototype.mergeDomains = function() {
      var domains, domainsets, tmpDims, tmpRanges;

      domainsets = _.map(this.facet.panes, function(p) {
        return p.domains;
      });
      domains = poly.domain.merge(domainsets);
      if (!this.scaleSet) {
        tmpDims = poly.dim.guess(this.spec, this.facet.getGrid());
        this.coord.make(tmpDims);
        tmpRanges = this.coord.ranges();
        this.scaleSet = poly.scaleset(tmpRanges, this.coord);
      }
      this.scaleSet.make(this.spec.guides, domains, this.layers);
      this.dims = this._makeDimensions(this.spec, this.scaleSet, this.facet, tmpDims);
      this.coord.make(this.dims);
      this.ranges = this.coord.ranges();
      return this.scaleSet.setRanges(this.ranges);
    };

    Graph.prototype.render = function() {
      var renderer, scales, _ref, _ref1;

      if ((this.spec.render != null) && this.spec.render === false) {
        return;
      }
      scales = this.scaleSet.scales;
      this.coord.setScales(scales);
      this.scaleSet.coord = this.coord;
      _ref = this.scaleSet.makeGuides(this.spec, this.dims), this.axes = _ref.axes, this.titles = _ref.titles, this.legends = _ref.legends;
      if (this.prepare) {
        this.prepare(this);
      }
      this.dom = this.spec.dom;
      if ((_ref1 = this.paper) == null) {
        this.paper = this._makePaper(this.dom, this.dims.width, this.dims.height, this);
      }
      renderer = poly.render(this.handleEvent, this.paper, scales, this.coord);
      this.facet.render(renderer, this.dims, this.coord);
      this.scaleSet.renderGuides(this.dims, renderer, this.facet);
      if (this.callback) {
        return this.callback(this);
      }
    };

    Graph.prototype.addHandler = function(h) {
      if (__indexOf.call(this.handlers, h) < 0) {
        return this.handlers.push(h);
      }
    };

    Graph.prototype.removeHandler = function(h) {
      return this.handlers.splice(_.indexOf(this.handlers, h), 1);
    };

    Graph.prototype.handleEvent = function(type) {
      var graph, handler;

      graph = this;
      handler = function(event) {
        var adjEnd, adjStart, adjusted, col, end, evtData, f1, h, obj, row, start, _i, _len, _ref, _results;

        obj = this;
        if (type === 'touchstart' || type === 'touchmove' || type === 'touchend' || type === 'touchcancel') {
          poly.touch(type, obj, event, graph);
        } else if (type === 'select') {
          start = event.start, end = event.end;
          f1 = graph.facet.getFacetInfo(graph.dims, start.x, start.y);
          if (!f1) {
            return;
          }
          col = f1.col, row = f1.row, evtData = f1.evtData, adjusted = f1.adjusted;
          adjStart = _.clone(adjusted);
          adjusted = graph.facet.getFacetInfo(graph.dims, end.x, end.y, {
            col: col,
            row: row
          }).adjusted;
          adjEnd = _.clone(adjusted);
          if (graph.coord.type === 'cartesian') {
            obj.evtData = graph.scaleSet.fromPixels(adjStart, adjEnd);
          } else {
            obj.evtData = null;
          }
        } else if (type === 'data') {
          obj.evtData = {};
        } else if (type === 'reset' || type === 'click' || type === 'mover' || type === 'mout' || type === 'guide-click') {
          obj.tooltip = obj.data('t');
          obj.evtData = obj.data('e');
        }
        _ref = graph.handlers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          h = _ref[_i];
          if (_.isFunction(h)) {
            _results.push(h(type, obj, event, graph));
          } else {
            _results.push(h.handle(type, obj, event, graph));
          }
        }
        return _results;
      };
      return _.throttle(handler, 300);
    };

    Graph.prototype._makeScaleSet = function(spec, domains, facet) {
      var tmpRanges;

      tmpRanges = this.coord.ranges();
      return poly.scaleset(tmpRanges, this.coord);
    };

    Graph.prototype._makeDimensions = function(spec, scaleSet, facet, tmpDims) {
      scaleSet.makeGuides(spec, tmpDims);
      return poly.dim.make(spec, scaleSet, facet.getGrid());
    };

    Graph.prototype._makePaper = function(dom, width, height, handleEvent) {
      var paper;

      return paper = poly.paper(dom, width, height, handleEvent);
    };

    return Graph;

  })();

  poly.chart = function(spec, callback, prepare) {
    return new Graph(spec, callback, prepare);
  };

}).call(this);
  }
  return {
    data: poly.data,
    chart: poly.chart,
    handler: poly.handler,
    debug: poly
  }
})(window.polyjs);