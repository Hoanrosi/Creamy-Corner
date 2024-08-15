import catchAsync from "./../utils/catchAsync";
import APIFeatures from "./../utils/apiFeatures";
import sequelize from "../server";
import AppError from "../utils/appError";
import { Op } from "sequelize";

export const deleteOne = (model, isSoftDelete = true) =>
  catchAsync(async (req, res, next) => {
    let doc;

    if (isSoftDelete) {
      doc = await sequelize.models[model].update(
        { isActive: false },
        { where: { id: req.params.id } }
      );
    } else {
      doc = await sequelize.models[model].destroy({
        where: { id: req.params.id },
      });
    }

    if (doc[0] === 0) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

export const updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const [updatedRowCount, updatedRows] = await sequelize.models[model].update(
      req.body,
      {
        where: {
          id: req.params.id,
        },
        returning: true,
        individualHooks: true,
      }
    );

    if (updatedRowCount === 0) {
      return next(new AppError("No document found with that ID", 404));
    }

    const doc = updatedRows[0];

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const createOne = (model) =>
  catchAsync(async (req, res, next) => {
    try {
      const existed = await sequelize.models[model].findAll({
        where: { ...req.body },
      });

      if (existed.length > 0) {
        return next(new AppError("Document already existed in db.", 404));
      }

      const doc = await sequelize.models[model].create({
        ...req.body,
      });

      res.status(201).json({
        status: "success",
        data: doc,
      });
    } catch (e) {
      console.log(e);
    }
  });

export const getOne = (model, option = {}) =>
  catchAsync(async (req, res, next) => {
    const doc = await sequelize.models[model].findByPk(req.params.id, {
      attributes: { include: ["isActive"] },
    });

    if (!doc || doc.isActive === false) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const getAll = (model, fileterField, isSoftDeleteOnly = true) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.id && fileterField) {
      filter = { [fileterField]: req.params.id };
    } else if (req.params.id) {
      filter = { id: req.params.id };
    }
    if (isSoftDeleteOnly) filter = { ...filter, isActive: true };

    const features = new APIFeatures(req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let includeOptions = {};

    const queryOptions = {
      ...features.getQueryOptions(),
      where: { ...features.getQueryOptions().where, ...filter },
      ...includeOptions,
    };

    const totalCount = await sequelize.models[model].count({
      where: { ...filter, ...features.getQueryOptions().where },
    });

    const doc = await sequelize.models[model].findAll(queryOptions);

    res.status(200).json({
      status: "success",
      results: doc.length,
      totalResults: totalCount,
      data: doc,
    });
  });

export const createBulk = (model) =>
  catchAsync(async (req, res, next) => {
    if (!Array.isArray(req.body.products) || req.body.products.length === 0) {
      return next(new Error("Request body must be a non-empty array", 400));
    }

    const docs = await sequelize.models[model].bulkCreate(req.body);

    res.status(201).json({
      status: "success",
      data: docs,
    });
  });
