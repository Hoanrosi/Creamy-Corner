import express from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  getValuesByVariant,
  createBulkVariantValues,
  deleteVariantValue,
  createVariantsCombination,
  getVariantsCombination,
  updateVariantValue,
  updateVariantsCombination,
  getAllImagesByProduct,
  createBulkImagesByProduct,
  deleteImageByProduct,
  getVariantsByProduct,
  searchProduct,
} from "../controllers/product.controller";

import { restrictTo, protect } from "../controllers/auth.controller";

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), createProduct)
  .get(getAllProducts);

router.route("/search/:str").get(searchProduct);

router
  .route("/variants-combinations")
  .post(protect, restrictTo("admin"), createVariantsCombination);

router
  .route("/variants-combinations/:id1/:id2?")
  .get(getVariantsCombination)
  .patch(protect, restrictTo("admin"), updateVariantsCombination);

router
  .route("/:id")
  .get(getProduct)
  .delete(protect, restrictTo("admin"), deleteProduct)
  .patch(protect, restrictTo("admin"), updateProduct);

router.route("/:id/variants").get(getVariantsByProduct);

router
  .route("/:id/images")
  .get(getAllImagesByProduct)
  .post(protect, restrictTo("admin"), createBulkImagesByProduct);

router
  .route("/images/:id")
  .delete(protect, restrictTo("admin"), deleteImageByProduct);

router
  .route("/variants")
  .post(protect, restrictTo("admin"), createVariant)
  .delete(protect, restrictTo("admin"), deleteVariant);

router
  .route("/variants/:id")
  .get(getValuesByVariant)
  .patch(protect, restrictTo("admin"), updateVariant)
  .delete(protect, restrictTo("admin"), deleteVariant)
  .post(protect, restrictTo("admin"), createBulkVariantValues);

router
  .route("/variants/:id/values")
  .delete(protect, restrictTo("admin"), deleteVariantValue);

router
  .route("/variants/:variantId/values/:id")
  .patch(protect, restrictTo("admin"), updateVariantValue);
export default router;
