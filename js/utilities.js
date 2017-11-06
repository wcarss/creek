function clamp(val, low, high, epsilon, debug) {
  epsilon = epsilon || 0.001;

  if (val <= low - epsilon) {
    if (debug) {
      console.log(val + "clamped up to " + low);
    }
    val = low;
  }

  if (val >= high + epsilon) {
    if (debug) {
      console.log(val + "clamped down to " + high);
    }
    val = high;
  }

  return val;
}

function log_all(pre_message, hash) {
  str = "";
  if (pre_message !== undefined) {
    str += pre_message + " -- ";
  }

  for (k in hash) {
    if (hash.hasOwnProperty(k)) {
      str += k + ": " + hash[k] + ", ";
    }
  }

  console.log(str);
}

function throttle(func, wait) {
  var last_time = null;
  return function() {
    var now = performance.now();
    if (last_time === null || now - last_time >= wait) {
      last_time = now;
      func.apply(this, arguments);
    }
  };
}
