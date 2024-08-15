import {
  signup,
  login,
  protect,
  refreshAccessToken,
  resetPassword,
} from "../../controllers/auth.controller";
import sequelize from "../../server";
import jwt from "jsonwebtoken";
import Email from "../../utils/email";
import AppError from "../../utils/appError";

jest.mock("../../server", () => ({
  models: {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
  },
}));

jest.mock("jsonwebtoken");
jest.mock("../../utils/email");
jest.mock("../../utils/appError");

describe("Auth Controller - Signup", () => {
  //   it("should create a new user and send a token", async () => {
  //     const req = {
  //       body: {
  //         email: "test@example.com",
  //         password: "password123",
  //       },
  //     };
  //     const res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn(),
  //       cookie: jest.fn(),
  //     };
  //     const next = jest.fn();

  //     const newUser = {
  //       email: "test@example.com",
  //       password: "password123",
  //     };

  //     sequelize.models.User.findOne.mockResolvedValue(null);
  //     sequelize.models.User.create.mockResolvedValue(newUser);
  //     Email.prototype.sendWelcome.mockResolvedValue();

  //     await signup(req, res, next);

  //     expect(sequelize.models.User.findOne).toHaveBeenCalledWith({
  //       where: { email: "test@example.com" },
  //     });
  //     expect(sequelize.models.User.create).toHaveBeenCalledWith({
  //       email: "test@example.com",
  //       password: "password123",
  //     });
  //     expect(res.status).toHaveBeenCalledWith(201);
  //     expect(res.json).toHaveBeenCalledWith({
  //       status: "success",
  //       data: {
  //         user: {
  //           id: "9ccc49c0-750e-4cf2-9e09-cddeacd925e7",
  //           email: "test@example.com",
  //           passwordResetToken: null,
  //           passwordResetExpires: null,
  //           isActive: true,
  //         },
  //         token: expect.any(Object),
  //       },
  //     });
  //   });
  it("should create a new user and send a token", async () => {
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
      id: "some-id",
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
        token: expect.any(Object),
      },
    });
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
