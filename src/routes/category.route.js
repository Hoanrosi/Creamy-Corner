import express from "express";
import {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  createBulkProductsCategory,
  getAllProductsByCategory,
  deleteProductCategory,
} from "../controllers/category.controller";

import { restrictTo, protect } from "../controllers/auth.controller";

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createCategory)
  .get(getAllCategory);

router
  .route("/:id")
  .get(getAllProductsByCategory)
  .post(protect, restrictTo("admin"), createBulkProductsCategory)
  .delete(protect, restrictTo("admin"), deleteCategory)
  .patch(protect, restrictTo("admin"), updateCategory);

router
  .route("/:categoryId/:productId")
  .delete(protect, restrictTo("admin"), deleteProductCategory);

export default router;
