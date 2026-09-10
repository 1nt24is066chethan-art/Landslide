/**
 * Handles any request that didn't match a route.
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Central error handler — every error in the app (validation errors,
 * "not found" lookups, unexpected DB errors) ends up here so the API
 * always returns the same predictable JSON shape.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  if (status >= 500) {
    // Log full detail server-side; never leak internals to the client.
    console.error(err);
  }

  res.status(status).json({
    success: false,
    error: err.publicMessage || 'Something went wrong on the server.',
  });
}

module.exports = { notFound, errorHandler };
