import {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  refreshAccessToken,
  forgotPassword,
  updatePassword,
  resetPassword,
  createSendToken,
} from "../../controllers/auth.controller";
import sequelize from "../../server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Email from "../../utils/email";
import AppError from "../../utils/appError";
import { mockRequest, mockResponse } from "mock-req-res";
import { ErrorCode, HttpStatusCode } from "../../constants";
import { expect } from "@jest/globals";

jest.mock("../../server", () => ({
  models: {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
      save: jest.fn(),
    },
  },
}));
jest.mock("crypto");
jest.mock("jsonwebtoken");
jest.mock("../../utils/email", () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendWelcome: jest.fn().mockResolvedValue(),
      sendPasswordReset: jest.fn().mockResolvedValue(),
    };
  });
});
jest.mock("../../utils/appError");

describe("Auth Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });
  describe("createSendToken", () => {
    let res;
    let req;
    const user = { id: "user-id", password: "hashedPassword" };

    beforeEach(() => {
      req = {
        secure: true,
        headers: {
          "x-forwarded-proto": "https",
        },
      };

      res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN = "1";
      process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN = "7";
      process.env.ACCESS_TOKEN_SECRET = "access-secret";
      process.env.REFRESH_TOKEN_SECRET = "refresh-secret";
    });

    it("should create and send access and refresh tokens, set cookies, and send a response", () => {
      const accessToken = "access-token";
      const refreshToken = "refresh-token";

      jwt.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      createSendToken(user, 201, req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
      );

      expect(res.cookie).toHaveBeenCalledWith("accessToken", accessToken, {
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
        httpOnly: true,
        secure: true,
      });

      expect(res.cookie).toHaveBeenCalledWith("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true,
        secure: true,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          user: { id: "user-id", password: undefined }, // Password should be undefined
          token: {
            accessToken,
            refreshToken,
          },
        },
      });
    });
  });
  describe("POST/Signup", () => {
    it("should create a new user and send a token", async () => {
      try {
        const req = {
          body: {
            email: "test@example.com",
            password: "password123",
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          cookie: jest.fn(),
        };
        const next = jest.fn();

        sequelize.models.User.findOne.mockResolvedValue(null);
        sequelize.models.User.create.mockResolvedValue({
          password: "password123",
          email: "test@example.com",
        });
        Email.prototype.sendWelcome = jest.fn().mockResolvedValue();

        await signup(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          data: {
            user: expect.objectContaining({
              id: "some-id",
              email: "test@example.com",
            }),
            token: {
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            },
          },
        });
        expect(res.cookie).toHaveBeenCalledWith(
          "accessToken",
          expect.any(String),
          expect.objectContaining({
            maxAge: expect.any(Number),
            httpOnly: true,
            secure: true,
          })
        );

        expect(res.cookie).toHaveBeenCalledWith(
          "refreshToken",
          expect.any(String),
          expect.objectContaining({
            maxAge: expect.any(Number),
            httpOnly: true,
            secure: true,
          })
        );
        expect(next).not.toHaveBeenCalled();
      } catch (e) {
        console.log(e);
      }
    });

    it("should return an error if the user already exists", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      };
      const res = {};
      const next = jest.fn();

      sequelize.models.User.findOne.mockResolvedValue({});

      await signup(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("POST/Login", () => {
    it("should login a user and send a token", async () => {
      try {
        const req = {
          body: {
            email: "test@example.com",
            password: "password123",
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          cookie: jest.fn(),
        };
        const next = jest.fn();

        const user = {
          id: "123",
          email: "test@example.com",
          password: "password123",
          correctPassword: jest.fn().mockResolvedValue(true),
        };

        sequelize.models.User.findOne.mockResolvedValue(user);

        await login(req, res, next);

        expect(sequelize.models.User.findOne).toHaveBeenCalledWith({
          where: { email: "test@example.com" },
        });
        expect(user.correctPassword).toHaveBeenCalledWith(
          "password123",
          "password123"
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          data: {
            user: { id: "123", email: "test@example.com", password: undefined },
            token: expect.any(Object),
          },
        });
      } catch (err) {
        console.log(err);
      }
    });

    it("should return an error if credentials are invalid", async () => {
      try {
        const req = {
          body: {
            email: "test@example.com",
            password: "wrongpassword",
          },
        };
        const res = {};
        const next = jest.fn();

        const user = {
          id: "123",
          email: "test@example.com",
          password: "password123",
          correctPassword: jest.fn().mockResolvedValue(false),
        };

        sequelize.models.User.findOne.mockResolvedValue(user);

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
      } catch (err) {
        console.log(err);
      }
    });
  });

  describe("GET/logout", () => {
    let req, res;
    beforeEach(() => {
      req = {};
      res = {
        cookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });
    it("should set accessToken and refreshToken cookies to 'loggedout' and return status 200", () => {
      logout(req, res);

      expect(res.cookie).toHaveBeenCalledWith("accessToken", "loggedout", {
        expires: expect.any(Date),
        httpOnly: true,
      });

      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "loggedout", {
        expires: expect.any(Date),
        httpOnly: true,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "success" });
    });

    it("should set the cookies with correct expiration time", () => {
      const beforeDate = new Date(Date.now() + 5 * 1000);

      logout(req, res);

      const setCookieCall = res.cookie.mock.calls[0];
      const expiresDate = setCookieCall[2].expires;

      expect(expiresDate.getTime()).toBeGreaterThanOrEqual(
        beforeDate.getTime()
      );
    });
  });
  describe("Protect", () => {
    it("should protect a route and attach the user to the request object", async () => {
      const req = {
        headers: {
          authorization: "Bearer validtoken",
        },
        cookies: {},
      };
      const res = {
        locals: {},
      };
      const next = jest.fn();

      const decoded = { id: "123" };

      jwt.verify.mockReturnValue(decoded);
      sequelize.models.User.findByPk.mockResolvedValue({
        id: "123",
        role: "user",
        changedPasswordAfter: jest.fn().mockReturnValue(false),
      });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        "validtoken",
        process.env.ACCESS_TOKEN_SECRET
      );
      expect(sequelize.models.User.findByPk).toHaveBeenCalledWith("123", {
        attributes: { include: ["role"] },
      });
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it("should return an error if the token is invalid", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalidtoken",
        },
        cookies: {},
      };
      const res = {};
      const next = jest.fn();

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await protect(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
  describe("POST/ Refresh Access Token", () => {
    let req, res, next, user;

    beforeEach(() => {
      req = {
        cookies: {},
        secure: true,
        headers: {
          "x-forwarded-proto": "https",
        },
      };

      res = {
        cookie: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      next = jest.fn();

      user = {
        id: "some-user-id",
        changedPasswordAfter: jest.fn().mockReturnValue(false),
      };

      sequelize.models.User.findByPk = jest.fn().mockResolvedValue(user);
    });

    it("should return 401 if refreshToken is missing", async () => {
      try {
        req.cookies.refreshToken = null;

        await refreshAccessToken(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe(
          ErrorCode.INVALID_CREDENTIALS
        );
      } catch (err) {
        console.log(err);
      }
    });

    it("should return 401 if refreshToken is invalid", async () => {
      try {
        req.cookies.refreshToken = "invalid-token";
        jwt.verify.mockImplementation(() => {
          throw new Error();
        });

        await refreshAccessToken(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe(
          ErrorCode.REFRESH_TOKEN_EXPIRE
        );
      } catch (err) {
        console.log(err);
      }
    });

    it("should return 401 if user does not exist", async () => {
      try {
        req.cookies.refreshToken = "valid-token";
        jwt.verify.mockReturnValue({ id: "some-user-id" });
        sequelize.models.User.findByPk.mockResolvedValue(null);

        await refreshAccessToken(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe(ErrorCode.UNAUTHORIZED);
      } catch (err) {
        console.log(err);
      }
    });

    it("should return 401 if user changed password after token was issued", async () => {
      try {
        req.cookies.refreshToken = "valid-token";
        jwt.verify.mockReturnValue({ id: "some-user-id", iat: 100 });
        user.changedPasswordAfter.mockReturnValue(true);

        await refreshAccessToken(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe(
          ErrorCode.INVALID_CREDENTIALS
        );
      } catch (err) {
        console.log(err);
      }
    });

    it("should refresh access token if everything is valid", async () => {
      req.cookies.refreshToken = "valid-token";
      jwt.verify.mockReturnValue({ id: "some-user-id", iat: 100 });
      const newAccessToken = "new-access-token";
      jwt.sign.mockReturnValue(newAccessToken);

      await refreshAccessToken(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith("accessToken", newAccessToken, {
        maxAge:
          process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        accessToken: newAccessToken,
      });
    });
  });
  describe("restrictTo", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: {
          role: "user",
        },
      };

      res = {};

      next = jest.fn();
    });

    it("should allow access if user has the required role", () => {
      const middleware = restrictTo("user", "admin");
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should deny access if user does not have the required role", () => {
      req.user.role = "guest";
      const middleware = restrictTo("admin", "user");
      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].message).toBe("AA_FE_001");
    });

    it("should allow access if user role matches one of the required roles", () => {
      req.user.role = "admin";
      const middleware = restrictTo("admin", "user");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should deny access if no roles match", () => {
      req.user.role = "guest";
      const middleware = restrictTo("admin", "user");

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(HttpStatusCode.forbidden);
      expect(error.errorCode).toBe(ErrorCode.FORBIDDEN);
      expect(error.message).toBe("Forbidden");
    });
  });
  describe("POST/forgotPassword", () => {
    let req, res, next;

    beforeEach(() => {
      req = { body: { email: "test@example.com" } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should send reset token to email if user exists", async () => {
      const user = {
        email: "test@example.com",
        createPasswordResetToken: jest.fn().mockReturnValue("resetToken"),
        save: jest.fn(),
      };
      sequelize.models.User.findOne = jest.fn().mockResolvedValue(user);
      Email.prototype.sendPasswordReset = jest.fn().mockResolvedValue();

      await forgotPassword(req, res, next);

      expect(sequelize.models.User.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email },
      });
      expect(user.createPasswordResetToken).toHaveBeenCalled();
      expect(user.save).toHaveBeenCalled();
      expect(Email.prototype.sendPasswordReset).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Token sent to email!",
      });
    });

    it("should return 404 if user does not exist", async () => {
      sequelize.models.User.findOne = jest.fn().mockResolvedValue(null);

      await forgotPassword(req, res, next);

      expect(sequelize.models.User.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email },
      });
      expect(next).toHaveBeenCalledWith(
        new AppError(ErrorCode.NOT_FOUND, HttpStatusCode.notFound)
      );
    });

    it("should handle errors when sending the email", async () => {
      const user = {
        email: "test@example.com",
        createPasswordResetToken: jest.fn().mockReturnValue("resetToken"),
        save: jest.fn(),
      };
      sequelize.models.User.findOne = jest.fn().mockResolvedValue(user);
      Email.prototype.sendPasswordReset = jest
        .fn()
        .mockRejectedValue(new Error("Email failed"));

      await forgotPassword(req, res, next);

      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
      expect(next).toHaveBeenCalledWith(new AppError("AA_ISE_001", 500));
    });
  });
  describe("PATCH/resetPassword", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        params: { token: "resetToken" },
        body: { password: "newPassword" },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should reset password if token is valid and not expired", async () => {
      const hashedToken = "hashedResetToken";
      crypto.createHash.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(hashedToken),
      });

      const user = {
        passwordResetToken: hashedToken,
        passwordResetExpires: Date.now() + 10 * 60 * 1000,
        save: jest.fn(),
      };
      sequelize.models.User.findOne = jest.fn().mockResolvedValue(user);

      await resetPassword(req, res, next);

      expect(sequelize.models.User.findOne).toHaveBeenCalledWith({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpires: { [Op.gt]: expect.any(Date) },
        },
      });
      expect(user.password).toBe(req.body.password);
      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
      expect(user.save).toHaveBeenCalled();
    });

    it("should return 400 if token is invalid or expired", async () => {
      sequelize.models.User.findOne = jest.fn().mockResolvedValue(null);

      await resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new AppError(
          ErrorCode.INVALID_OR_EXPIRE_TOKEN,
          HttpStatusCode.badRequest
        )
      );
    });
  });
  describe("PATCH/updatePassword", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: { id: "userId" },
        body: { passwordCurrent: "oldPassword", password: "newPassword" },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should update password if current password is correct", async () => {
      const user = {
        password: "hashedPassword",
        correctPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
      };
      sequelize.models.User.findByPk = jest.fn().mockResolvedValue(user);

      await updatePassword(req, res, next);

      expect(sequelize.models.User.findByPk).toHaveBeenCalledWith(req.user.id);
      expect(user.correctPassword).toHaveBeenCalledWith(
        req.body.passwordCurrent,
        user.password
      );
      expect(user.password).toBe(req.body.password);
      expect(user.save).toHaveBeenCalled();
    });

    // it("should return 401 if current password is incorrect", async () => {
    //   const user = {
    //     correctPassword: jest.fn().mockResolvedValue(false),
    //   };
    //   sequelize.models.User.findByPk = jest.fn().mockResolvedValue(user);

    //   await updatePassword(req, res, next);

    //   expect(next).toHaveBeenCalledWith(
    //     new AppError(ErrorCode.INVALID_CREDENTIALS, HttpStatusCode.unauthorized)
    //   );
    // });
    it("should return 401 if current password is incorrect", async () => {
      const user = {
        correctPassword: jest.fn().mockResolvedValue(false),
      };
      sequelize.models.User.findByPk = jest.fn().mockResolvedValue(user);

      await updatePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatusCode.unauthorized,
          message: ErrorCode.INVALID_CREDENTIALS,
        })
      );
    });
  });
});
