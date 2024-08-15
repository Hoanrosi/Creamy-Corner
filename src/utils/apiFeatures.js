import { Op } from "sequelize";
import { contains } from "validator";

class APIFeatures {
  constructor(queryFields) {
    this.queryFields = queryFields;
    this.queryOptions = {
      where: {},
      order: [],
      attributes: [],
      limit: null,
      offset: null,
    };
  }

  filter() {
    const queryObj = { ...this.queryFields };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    for (const key in queryObj) {
      if (typeof queryObj[key] === "object" && queryObj[key] !== null) {
        const operatorObj = {};
        for (const op in queryObj[key]) {
          if (Op[op]) {
            operatorObj[Op[op]] = JSON.parse(queryObj[key][op]);
          }
        }
        this.queryOptions.where[key] = operatorObj;
      } else {
        this.queryOptions.where[key] = queryObj[key];
      }
    }

    return this;
  }

  sort() {
    if (this.queryFields.sort) {
      const sortBy = this.queryFields.sort
        .split(",")
        .map((field) => field.split(":"))
        .map((field) =>
          field[0].startsWith("-") ? [`${field[0].slice(1)}`, "DESC"] : field
        );
      this.queryOptions.order = sortBy;
    }
    return this;
  }

  limitFields() {
    if (this.queryFields.fields) {
      this.queryOptions.attributes = this.queryFields.fields.split(",");
    } else {
      this.queryOptions.attributes = { exclude: [] };
    }
    return this;
  }

  paginate() {
    const page = this.queryFields.page * 1 || 1;
    const limit = this.queryFields.limit * 1 || 100;
    const offset = (page - 1) * limit;

    this.queryOptions.limit = limit;
    this.queryOptions.offset = offset;

    return this;
  }

  getQueryOptions() {
    return this.queryOptions;
  }
}

export default APIFeatures;
