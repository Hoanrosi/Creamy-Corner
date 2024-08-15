import express from "express";
import {
  createOrderWithItems,
  getAllOrdersByUser,
  getAllOrders,
  approveOrRejectOrder,
} from "../controllers/order.controller";

import { restrictTo, protect } from "../controllers/auth.controller";
const router = express.Router();

router.route("/").post(createOrderWithItems);

router
  .route("/:id")
  .get(protect, restrictTo("user", "admin"), getAllOrdersByUser);

router.route("/").get(protect, restrictTo("admin"), getAllOrders);
router.route("/:id").patch(protect, restrictTo("admin"), approveOrRejectOrder);

export default router;
