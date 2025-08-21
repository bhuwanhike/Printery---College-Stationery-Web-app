import { Router } from "express";
import {
  orderPracticalFilesController,
  getOrderedPracticalFilesController,
  deleteSelectedOrderController,
  clearAllOrderedFilesController,
} from "../controller/orderPracticalFiles.controller";

import { authMiddleware } from "../middleware/authMiddleware";
const router = Router();

router
  .route("/")
  .post(authMiddleware, orderPracticalFilesController)
  .get(authMiddleware, getOrderedPracticalFilesController);
router.route("/deleteAll").put(authMiddleware, clearAllOrderedFilesController);
router.route("/:id").put(authMiddleware, deleteSelectedOrderController);
export default router;
