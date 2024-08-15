import errorCodes from "../errorCodes.json";
class AppError extends Error {
  constructor(errorCode, statusCode, details) {
    super();
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.message = errorCodes[errorCode]
      ? errorCodes[errorCode]
      : "An unknown error occurred";
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
