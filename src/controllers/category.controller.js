import { getAll, createOne, updateOne } from "./handleFactory";
import catchAsync from "./../utils/catchAsync";
import sequelize from "../server";
import APIFeatures from "./../utils/apiFeatures";
import AppError from "../utils/appError";

export const getAllCategory = getAll("Category", "", false);
export const createCategory = createOne("Category");
export const updateCategory = updateOne("Category");

export const deleteCategory = catchAsync(async (req, res, next) => {
  await sequelize.models.Category.destroy({
    where: { parentId: req.params.id },
  });

  const doc = await sequelize.models.Category.destroy({
    where: { id: req.params.id },
  });

  if (doc[0] === 0) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getAllProductsByCategory = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let filter = { categoryId: req.params.id };
  let includeOptions = {
    include: [sequelize.models.Product.unscoped()],
  };

  const queryOptions = {
    ...features.getQueryOptions(),
    where: { ...features.getQueryOptions().where, ...filter },
    ...includeOptions,
  };

  let doc;

  let totalCount = 0;

  const childCategories = await sequelize.models.Category.findAll({
    where: { parentId: req.params.id },
  });

  if (childCategories.length === 0) {
    doc = await sequelize.models.ProductsCategory.findAll({
      ...queryOptions,
    });

    totalCount = await sequelize.models[model].count({
      where: { ...filter, ...features.getQueryOptions().where },
    });
  } else {
    doc = await Promise.all(
      childCategories.map(async (category) => {
        return await sequelize.models.ProductsCategory.findAll({
          ...queryOptions,
          where: { categoryId: category.id },
        });
      })
    );
    doc = doc.flat();
    doc = doc.filter((value) => value.Product.dataValues.isActive === true);

    totalCount = await Promise.all(
      childCategories.map(async (category) => {
        return await sequelize.models.ProductsCategory.count({
          where: {
            categoryId: category.id,
            ...features.getQueryOptions().where,
          },
        });
      })
    );
    totalCount = totalCount.reduce((acc, count) => acc + count, 0);
  }
  doc = doc.map((value) => value.dataValues.Product);

  res.status(200).json({
    status: "success",
    results: doc.length,
    totalResults: totalCount,
    data: doc,
  });
});

export const createBulkProductsCategory = catchAsync(async (req, res, next) => {
  if (!Array.isArray(req.body.products) || req.body.products.length === 0) {
    return next(new AppError("Request body must be a non-empty array", 400));
  }

  const products = req.body.products.map((product) => ({
    productId: product,
    categoryId: req.params.id,
  }));

  const docs = await sequelize.models.ProductsCategory.bulkCreate(products);

  res.status(201).json({
    status: "success",
    data: docs,
  });
});

export const deleteProductCategory = catchAsync(async (req, res, next) => {
  const doc = await sequelize.models.ProductsCategory.destroy({
    where: {
      categoryId: req.params.categoryId,
      productId: req.params.productId,
    },
  });

  if (doc[0] === 0) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
