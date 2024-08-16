import AppError from "../../utils/appError"; 
import errorCodes from "../../errorCodes.json"; 

describe("AppError Class", () => {
  it("should initialize with correct properties", () => {
    const errorCode = "INVALID_INPUT";
    const statusCode = 400;
    const details = "Invalid input data";

    const error = new AppError(errorCode, statusCode, details);

    expect(error.errorCode).toBe(errorCode);
    expect(error.statusCode).toBe(statusCode);
    expect(error.status).toBe("fail"); // 4xx status code should result in "fail"
    expect(error.message).toBe(errorCodes[errorCode] || "An unknown error occurred");
    expect(error.isOperational).toBe(true);
    expect(error.details).toBe(details);
    expect(error.stack).toBeDefined(); // Check if stack trace is defined
  });

  it("should handle unknown error codes", () => {
    const errorCode = "UNKNOWN_ERROR_CODE";
    const statusCode = 500;
    const details = "An unknown error occurred";

    const error = new AppError(errorCode, statusCode, details);

    expect(error.errorCode).toBe(errorCode);
    expect(error.statusCode).toBe(statusCode);
    expect(error.status).toBe("error"); // Non-4xx status code should result in "error"
    expect(error.message).toBe("An unknown error occurred");
    expect(error.isOperational).toBe(true);
    expect(error.details).toBe(details);
    expect(error.stack).toBeDefined(); // Check if stack trace is defined
  });
});
