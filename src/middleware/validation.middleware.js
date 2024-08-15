import Joi from "joi";
import { ErrorCode, HttpStatusCode } from "../constants";
import AppError from "../utils/appError";
import { pick } from "../utils/pick";

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return next(
      new AppError(
        ErrorCode.INVALID_INCOMING_DATA,
        HttpStatusCode.badRequest,
        errorMessage
      )
    );
  }
  Object.assign(req, value);
  return next();
};

export default validate;
