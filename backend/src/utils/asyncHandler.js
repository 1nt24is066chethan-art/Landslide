/**
 * Wraps an async Express route handler so any thrown error (or
 * rejected promise) is forwarded to next(), instead of every
 * controller needing its own try/catch block.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
