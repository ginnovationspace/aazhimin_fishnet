const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const handleServerError = (err, req, context) => {
  console.error(`[${new Date().toISOString()}] Error in ${context}:`, err);
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  asyncHandler,
  handleServerError,
  AppError
};