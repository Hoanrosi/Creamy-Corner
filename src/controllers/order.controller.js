import sequelize from "../server";
import AppError from "../utils/appError";
import { getAll } from "./handleFactory";
import catchAsync from "./../utils/catchAsync";
import APIFeatures from "../utils/apiFeatures";

export const createOrderWithItems = catchAsync(async (req, res, next) => {
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    return next(new AppError("Request body must be a non-empty array", 400));
  }

  let order;
  if (
    req.body.addressDetail &&
    req.body.province &&
    req.body.district &&
    req.body.ward &&
    req.body.phone &&
    req.body.name
  ) {
    order = await sequelize.models.Order.create({
      ...req.body,
    });
  } else if (req.body.userId && req.body.addressId) {
    order = await sequelize.models.Order.create({
      ...req.body,
      addressDetail: null,
      province: null,
      district: null,
      ward: null,
      phone: null,
      name: null,
    });
  } else {
    return next(new AppError("An order must have a valid address", 400));
  }

  const items = await Promise.all(
    req.body.items.map(async (item) => {
      const product = await sequelize.models.ProductVariantCombination.findOne({
        where: {
          id: item[0],
        },
      });

      if (product) {
        return {
          orderId: order.id,
          productVariantCombinationId: product.id,
          productId: product.productId,
          quantity: item[1],
        };
      } else {
        const product = await sequelize.models.Product.findOne({
          where: {
            id: item[0],
          },
        });
        return {
          orderId: order.id,
          productId: product.id,
          quantity: item[1],
        };
      }
    })
  );

  const orderItems = await sequelize.models.OrderItem.bulkCreate(items);

  res.status(201).json({
    status: "success",
    data: {
      order,
      orderItems,
    },
  });
});

export const getAllOrders = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.id) {
    filter = { id: req.params.id };
  }

  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const queryOptions = {
    ...features.getQueryOptions(),
    where: { ...features.getQueryOptions().where, ...filter },
    include: [
      { model: sequelize.models.OrderItem, required: true },
      { model: sequelize.models.UserAddress, require: true },
    ],
  };

  const doc = await sequelize.models.Order.findAll(queryOptions);

  res.status(200).json({
    status: "success",
    results: doc.length,
    data: doc,
  });
});

export const getAllOrdersByUser = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.id) {
    filter = { userId: req.params.id };
  }

  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const queryOptions = {
    ...features.getQueryOptions(),
    where: { ...features.getQueryOptions().where, ...filter },
    include: [
      { model: sequelize.models.OrderItem, required: true },
      { model: sequelize.models.UserAddress, require: true },
    ],
  };

  const doc = await sequelize.models.Order.findAll(queryOptions);

  res.status(200).json({
    status: "success",
    results: doc.length,
    data: doc,
  });
});

export const approveOrRejectOrder = catchAsync(async (req, res, next) => {
  const [updatedRowCount, updatedRows] = await sequelize.models.Order.update(
    { status: req.body.status },
    {
      where: {
        id: req.params.id,
      },
      returning: true,
      individualHooks: true,
    }
  );

  if (updatedRowCount === 0) {
    return next(new Error("No document found with that ID", 404));
  }

  const doc = updatedRows[0];

  res.status(200).json({
    status: "success",
    data: doc,
  });
});
