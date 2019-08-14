/**
 * @author Ponnuvel G
 */
module.exports = class InstabikeError extends Error {
  constructor(error) {
    super(error.message, error.status);
    this.name = this.constructor.name;
    this.status = error.status;
    Error.captureStackTrace(this, this.constructor);
  }
};
