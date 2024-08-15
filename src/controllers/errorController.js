import { ErrorCode, HttpStatusCode } from "../constants";
import AppError from "../utils/appError";
const handleCastErrorDB = (err) => {
  const errors = err.errors
    ? err.errors.map((error) => `${error.path}: ${error.value}`).join(", ")
    : "";
  const message = `Invalid input data: ${errors}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  console.log("Error:", err);
  const errors = err.errors
    ? err.errors.map((error) => `${error.path}: ${error.value}`).join(", ")
    : "";
  const message = `Duplicate field value: ${errors}. Please use another value!`;
  return new AppError(ErrorCode.DATA_EXISTED, 400, message);
};
// handle validation error DB (handle max min fields when implement product)
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    // message: err.message,
    // stack: err.stack,
  });
};
const handleJWTError = () =>
  new AppError(ErrorCode.INVALID_OR_EXPIRE_TOKEN, HttpStatusCode.unauthorized);

const handleJWTExpiredError = () =>
  new AppError(ErrorCode.INVALID_OR_EXPIRE_TOKEN, HttpStatusCode.unauthorized);

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log("ERROR: ", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.errors = err.errors;
    if (error.name === "SequelizeValidationError") {
      error = handleCastErrorDB(error);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      error = handleDuplicateFieldsDB(error);
    } else if (error.name === "JsonWebTokenError") {
      error = handleJWTError(error);
    } else if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError(error);
    }
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
