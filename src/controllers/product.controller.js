import {
  getOne,
  createOne,
  updateOne,
  getAll,
  deleteOne,
} from "./handleFactory";
import catchAsync from "./../utils/catchAsync";
import AppError from "../utils/appError";
import sequelize from "../server";
import { Op } from "sequelize";

export const getAllProducts = getAll("Product");
export const createProduct = createOne("Product");
export const getProduct = getOne("Product");
export const updateProduct = updateOne("Product");
export const deleteProduct = deleteOne("Product");

export const searchProduct = catchAsync(async (req, res, next) => {
  function toSlug(str) {
    str = str.toLowerCase();
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.replace(/[đĐ]/g, "d");
    str = str.replace(/([^0-9a-z-\s])/g, "");
    str = str.replace(/-+/g, "-");
    str = str.replace(/^-+|-+$/g, "");
    return str;
  }

  const foundProducts = await sequelize.models.Product.findAll({
    where: {
      name: {
        [Op.iLike]: `%${toSlug(req.params.str)}%`,
      },
    },
    order: [["purchases", "DESC"]],
  });

  if (foundProducts.length >= 10) {
    foundProducts = foundProducts.slice(0, 5);
  }

  res.status(201).json({
    status: "success",
    data: foundProducts,
  });
});

export const createVariant = catchAsync(async (req, res, next) => {
  const existedVariants = await sequelize.models.Variant.findAll({
    where: { productId: req.body.productId, isActive: true },
  });

  if (existedVariants.length >= 2) {
    return next(new AppError("Your product already have 2 variants.", 404));
  } else if (existedVariants.length === 1) {
    if (existedVariants[0].name === req.body.name) {
      return next(new AppError("Variant already existed.", 404));
    }
    const doc = await sequelize.models.Variant.create({
      ...req.body,
    });

    res.status(201).json({
      status: "success",
      data: doc,
    });
  } else {
    const doc = await sequelize.models.Variant.create({
      ...req.body,
    });

    res.status(201).json({
      status: "success",
      data: doc,
    });
  }
});

export const updateVariant = updateOne("Variant");
export const getVariantsByProduct = getAll("Variant", "productId");

export const deleteVariant = catchAsync(async (req, res, next) => {
  const variantValues = await sequelize.models.VariantValue.findAll({
    where: { variantId: req.params.id },
    attributes: ["id"],
  });

  const variantValueIds = variantValues.map((vv) => vv.id);

  await sequelize.models.ProductVariantCombination.update(
    { isActive: false },
    {
      where: {
        [Op.or]: [
          { value1Id: { [Op.in]: variantValueIds } },
          { value2Id: { [Op.in]: variantValueIds } },
        ],
      },
    }
  );

  await sequelize.models.VariantValue.update(
    { isActive: false },
    {
      where: { variantId: req.params.id },
    }
  );

  const doc = await sequelize.models.Variant.update(
    { isActive: false },
    { where: { id: req.params.id } }
  );

  if (doc[0] === 0) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getValuesByVariant = getAll("VariantValue", "variantId");
export const updateVariantValue = updateOne("VariantValue");

export const createBulkVariantValues = catchAsync(async (req, res, next) => {
  if (!Array.isArray(req.body.names) || req.body.names.length === 0) {
    return next(new AppError("Request body must be a non-empty array", 400));
  }

  const names = req.body.names.map((name) => ({
    name: name,
    variantId: req.params.id,
  }));

  const docs = await sequelize.models.VariantValue.bulkCreate(names);

  res.status(201).json({
    status: "success",
    data: docs,
  });
});

export const deleteVariantValue = catchAsync(async (req, res, next) => {
  const com = await sequelize.models.ProductVariantCombination.update(
    { isActive: false },
    {
      where: {
        [Op.or]: [{ value1Id: req.body.id }, { value2Id: req.body.id }],
      },
    }
  );

  const doc = await sequelize.models.VariantValue.update(
    { isActive: false },
    { where: { id: req.body.id } }
  );

  if (doc[0] === 0) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const createVariantsCombination = createOne("ProductVariantCombination");
export const getVariantsCombination = catchAsync(async (req, res, next) => {
  let doc;

  if (req.params.id2) {
    doc = await sequelize.models.ProductVariantCombination.findOne({
      where: {
        isActive: true,
        [Op.or]: [
          {
            value1Id: req.params.id1,
            value2Id: req.params.id2,
          },
          {
            value1Id: req.params.id2,
            value2Id: req.params.id1,
          },
        ],
      },
    });
  } else {
    doc = await sequelize.models.ProductVariantCombination.findOne({
      where: {
        isActive: true,
        value1Id: req.params.id1,
      },
    });
  }

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
});

export const updateVariantsCombination = catchAsync(async (req, res, next) => {
  let updatedRowCount, updatedRows;

  if (req.params.id2) {
    [updatedRowCount, updatedRows] =
      await sequelize.models.ProductVariantCombination.update(req.body, {
        where: {
          [Op.or]: [
            { value1Id: req.params.id1, value2Id: req.params.id2 },
            { value1Id: req.params.id2, value2Id: req.params.id1 },
          ],
        },
        returning: true,
        individualHooks: true,
      });
  } else {
    [updatedRowCount, updatedRows] =
      await sequelize.models.ProductVariantCombination.update(req.body, {
        where: {
          value1Id: req.params.id1,
        },
        returning: true,
        individualHooks: true,
      });
  }

  if (updatedRowCount === 0) {
    return next(new AppError("No document found with that ID", 404));
  }

  const doc = updatedRows[0];

  res.status(200).json({
    status: "success",
    data: doc,
  });
});

export const getAllImagesByProduct = getAll("ProductImage", "productId", false);
export const deleteImageByProduct = deleteOne("ProductImage", false);

export const createBulkImagesByProduct = catchAsync(async (req, res, next) => {
  if (!Array.isArray(req.body.urls) || req.body.urls.length === 0) {
    return next(new AppError("Request body must be a non-empty array", 400));
  }

  const images = req.body.urls.map((url) => ({
    url: url,
    productId: req.params.id,
  }));

  const docs = await sequelize.models.ProductImage.bulkCreate(images);

  res.status(201).json({
    status: "success",
    data: docs,
  });
});
