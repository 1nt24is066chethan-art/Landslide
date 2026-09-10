/**
 * An error with an HTTP status attached, so route handlers can throw
 * a single object and the central error handler knows both the status
 * code and the safe, user-facing message to send back.
 */
class ApiError extends Error {
  constructor(status, publicMessage) {
    super(publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

module.exports = ApiError;
