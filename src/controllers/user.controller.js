import db from "../db/models";
import * as factory from "./handleFactory";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import sequelize from "../server";
export const createAddress = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (req.user.id !== req.params.id) {
    return next(
      new AppError(
        "You do not have permission to create addresses for this user"
      )
    );
  }
  if (userId !== req.params.id) {
    return next(new AppError("userId in route and body do not match"));
  }
  const doc = await sequelize.models.UserAddress.create({
    ...req.body,
  });

  console.log(doc);

  res.status(201).json({
    status: "success",
    data: doc,
  });
});

export const getUser = factory.getOne("User");
export const getAllUsers = factory.getAll("User", null, false);
export const deleteUser = factory.deleteOne("User", true);
export const getAllAdresses = factory.getAll("UserAddress", "userId", true);
export const getAddress = factory.getOne("UserAddress");
export const updateAddress = factory.updateOne("UserAddress");
export const deleteAdress = factory.deleteOne("UserAddress", true);
