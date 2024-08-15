import crypto from "crypto";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import sequelize from "../server";
import { Op } from "sequelize";
import Email from "../utils/email";
import AppError from "../utils/appError";
import { emit } from "process";
import { ErrorCode, HttpStatusCode } from "../constants";

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const createSendToken = (user, statusCode, req, res) => {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  res.cookie("accessToken", accessToken, {
    maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
      token: {
        accessToken,
        refreshToken,
      },
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const existedUser = await sequelize.models.User.findOne({
    where: { email: email },
  });

  if (existedUser) {
    return next(
      new AppError(ErrorCode.DATA_EXISTED, HttpStatusCode.badRequest)
    );
  }

  const newUser = await sequelize.models.User.create({
    email,
    password,
  });

  await new Email(newUser, "").sendWelcome();
  createSendToken(newUser, 201, req, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await sequelize.models.User.findOne({
    where: { email: email },
  });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(ErrorCode.INVALID_CREDENTIALS, HttpStatusCode.unauthorized)
    );
  }

  createSendToken(user, 200, req, res);
});

export const logout = (req, res) => {
  res.cookie("accessToken", "loggedout", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.cookie("refreshToken", "loggedout", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

export const protect = catchAsync(async (req, res, next) => {
  let accessToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    accessToken = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.accessToken) {
    accessToken = req.cookies.accessToken;
  }
  if (!accessToken) {
    return next(
      new AppError(ErrorCode.INVALID_CREDENTIALS, HttpStatusCode.unauthorized)
    );
  }

  let decoded;

  try {
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return next(
      new AppError(
        ErrorCode.ACCESS_TOKEN_EXPIRE,
        HttpStatusCode.accessTokenExpire
      )
    );
  }

  const currentUser = await sequelize.models.User.findByPk(decoded.id, {
    attributes: { include: ["role"] },
  });

  if (!currentUser) {
    return next(new AppError(ErrorCode.NOT_FOUND, HttpStatusCode.unauthorized));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(ErrorCode.UNAUTHORIZED, HttpStatusCode.unauthorized)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(
      new AppError(ErrorCode.INVALID_REFRESH_TOKEN, HttpStatusCode.unauthorized)
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next(
      new AppError(ErrorCode.REFRESH_TOKEN_EXPIRE, HttpStatusCode.unauthorized)
    );
  }

  const currentUser = await sequelize.models.User.findByPk(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(ErrorCode.DATA_EXISTED, HttpStatusCode.unauthorized)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(ErrorCode.INVALID_CREDENTIALS, HttpStatusCode.unauthorized)
    );
  }

  const newAccessToken = signAccessToken(currentUser.id);

  res.cookie("accessToken", newAccessToken, {
    maxAge: process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
  });
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(ErrorCode.FORBIDDEN, HttpStatusCode.forbidden));
    }
    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await sequelize.models.User.findOne({
    where: { email: req.body.email },
  });
  if (!user) {
    return next(new AppError(ErrorCode.NOT_FOUND, HttpStatusCode.notFound));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  try {
    const resetURL = `http://localhost:5173/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(new AppError("AA_ISE_001"), 500);
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await sequelize.models.User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    return next(
      new AppError(ErrorCode.INVALID_OR_EXPIRE_TOKEN, HttpStatusCode.badRequest)
    );
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await sequelize.models.User.findByPk(req.user.id);

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError(ErrorCode.INVALID_CREDENTIALS, HttpStatusCode.unauthorized)
    );
  }

  user.password = req.body.password;
  await user.save();

  createSendToken(user, 200, req, res);
});
